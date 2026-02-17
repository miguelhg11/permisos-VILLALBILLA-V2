import { GoogleGenerativeAI } from "@google/generative-ai";
import funcionariosData from '../data/funcionarios.json';
import laboralesData from '../data/laborales.json';
import { EXPERT_KNOWLEDGE } from './expertKnowledge';

class RAGEngine {
    // Shared state for key rotation across instances
    static keyIndex = 0;
    static apiKeys = (import.meta.env.VITE_GEMINI_API_KEYS || "").split(',').map(k => k.trim()).filter(k => k);
    static stats = {
        totalRequests: 0,
        rotations: 0,
        failures: 0,
        keysUsage: (import.meta.env.VITE_GEMINI_API_KEYS || "").split(',').map(() => 0)
    };

    constructor(role) {
        this.role = role.toUpperCase(); // 'FUNCIONARIO' | 'LABORAL'
        this.docStore = this.role === 'FUNCIONARIO' ? funcionariosData : laboralesData;
        this.modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";

        this.initGenAI();
    }

    static getStatus() {
        return {
            currentIndex: RAGEngine.keyIndex,
            totalKeys: RAGEngine.apiKeys.length,
            stats: RAGEngine.stats,
            model: import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash"
        };
    }

    initGenAI() {
        const apiKey = RAGEngine.apiKeys[RAGEngine.keyIndex];
        if (apiKey) {
            console.log(`[RAG] Using API Key index ${RAGEngine.keyIndex} (Length: ${apiKey.length})`);
        } else {
            console.warn("[RAG] No API Keys found in environment variables");
        }
        this.genAI = new GoogleGenerativeAI(apiKey || "");
    }

    rotateKey() {
        if (RAGEngine.apiKeys.length > 1) {
            RAGEngine.keyIndex = (RAGEngine.keyIndex + 1) % RAGEngine.apiKeys.length;
            RAGEngine.stats.rotations++;
            console.log(`[RAG] Rotated to API Key index ${RAGEngine.keyIndex}`);
            this.initGenAI();
            return true;
        }
        return false;
    }

    /**
     * Normaliza el texto eliminando tildes y caracteres especiales
     */
    normalizeText(text) {
        if (!text) return "";
        return text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Quitar tildes
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // Quitar puntuación
            .replace(/\s+/g, " ") // Colapsar espacios
            .replace(/\b(\w+)(ido|ida|iendo)\b/g, "$1e") // Stemming global
            .trim();
    }

    /**
     * PASO A: Análisis Semántico Previo
     * Detecta parentescos, grados, conceptos de Villalbilla e INTENCIONES
     */
    analyzeQuerySemantically(query) {
        const q = this.normalizeText(query);
        let insights = [];
        let detectedIntents = [];

        // 1. Detección de Animales (Prioridad Máxima / Guardrail)
        const animalTerms = ["perro", "gato", "mascota", "tortuga", "pajaro", "caballo", "veterinario", "canino", "felino"];
        if (animalTerms.some(term => q.includes(term))) {
            insights.push("ALERTA: Se ha detectado una consulta sobre animales/mascotas.");
            detectedIntents.push("ANIMAL");
            return { summary: insights.join(" | "), intents: detectedIntents };
        }

        // 2. Detección de Negaciones y Ruptura de Vínculos (Filtros Críticos)
        const negativeTerms = ["no estoy", "no es", "divorciado", "divorciada", "separado", "separada", "exmujer", "exmarido", "exsuegro", "exsuegra", "expareja"];
        const hasNegation = negativeTerms.some(term => q.includes(term)) || q.startsWith("no ");
        if (hasNegation) {
            insights.push("NEGACIÓN/RUPTURA: Se detecta posible fin de afinidad o negación de condición.");
        }

        // 3. Detección de Sujeto (Yo vs Otros)
        const selfMatch = q.match(/\b(yo|tengo|mi cita|mi ope|me operan|me mudo|voy al medico|mi medico|mi dentista|mi analitica)\b/);
        const isSelf = !!selfMatch;
        insights.push(isSelf ? "Sujeto: Usuario (Propio)" : "Sujeto: Tercero/Familiar");

        // 4. Detección de Convivencia (Comodín Villalbilla)
        const convivenciaTerms = ["convivo", "empadronado", "vivimos", "mi casa", "domicilio comun"];
        const isConviviente = convivenciaTerms.some(term => q.includes(term));
        if (isConviviente) insights.push("CONVIVENCIA: Se detecta posible relación de convivencia acreditada.");

        // 5. Detección de Parentesco Complejo
        const mapping = EXPERT_KNOWLEDGE.parentesco.mapeoSemantico;
        const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);

        for (const key of sortedKeys) {
            const normalizedKey = this.normalizeText(key);
            if (q.includes(normalizedKey)) {
                if (hasNegation) {
                    insights.push(`RIESGO AFINIDAD: Se menciona ${key} en contexto de negación/separación.`);
                } else {
                    insights.push(`Sujeto: ${key} (${mapping[key]})`);
                }
                break;
            }
        }

        // 6. Mapeo de Intenciones
        const lex = EXPERT_KNOWLEDGE.lexicoMedico;
        const intentMap = [
            { terms: lex.cirugia_grave, id: "A" },
            { terms: ["muerto", "fallece", "fallecido", "fallecida", "fallecimiento", "fallecer", "tanatorio", "entierro", "funeral", "muerte", "defuncion", "sepelio", "obito"], id: "B" },
            { terms: ["muda", "mudanza", "mudo", "casa nueva", "domicilio", "traslado", "vivienda"], id: "C" },
            { terms: ["examen", "oposicion", "prueba oficial", "carne", "selectividad"], id: "D" },
            { terms: lex.pruebas_propias, id: "E" },
            { terms: ["embarazo", "parto", "adopcion", "prenatal", "acogimiento"], id: "F" },
            { terms: ["pecho", "lactancia", "bebe", "biberon"], id: "G" },
            { terms: ["prematuro", "incubadora"], id: "H" },
            { terms: ["discapacidad", "dependencia", "guarda legal", "reduccion", "minusvalia"], id: "I" },
            { terms: lex.invasivo_especialista, id: "K" },
            { terms: ["boda", "matrimonio", "pareja de hecho", "casarse"], id: "M" },
            { terms: lex.rutina_familiar, id: "N" }
        ];

        intentMap.forEach(intent => {
            if (intent.terms && intent.terms.some(term => q.includes(this.normalizeText(term)))) {
                detectedIntents.push(intent.id);
            }
        });

        // 7. Refuerzo de Intenciones por Sujeto/Convivencia
        if (isSelf && detectedIntents.includes("K")) {
            const hasMedicalSelf = lex.pruebas_propias.some(term => q.includes(this.normalizeText(term)));
            if (hasMedicalSelf && !detectedIntents.includes("A")) {
                detectedIntents.push("E");
            }
        }

        if (isConviviente) {
            detectedIntents.push("A", "N");
        }

        return {
            summary: insights.join(" | "),
            intents: [...new Set(detectedIntents)],
            flags: { hasNegation, isSelf, isConviviente }
        };
    }

    // PASO B: Recuperación RAG (Búsqueda Híbrida Local mejorada)
    retrieveContext(query, semanticData) {
        const q = this.normalizeText(query);
        const { intents, flags } = semanticData;

        // 1. Prioridad Absoluta: Intenciones Detectadas Semánticamente
        if (intents.length > 0) {
            // Prioridad de selección base
            let priorityOrder = ["A", "B", "D", "K", "F", "G", "H", "M", "C", "E", "I", "L", "N"];

            // Ajuste dinámico de prioridad según el sujeto
            if (!flags.isSelf) {
                // Si no es para uno mismo, el permiso E (médico propio) pasa al final de la cola
                priorityOrder = priorityOrder.filter(id => id !== "E");
                priorityOrder.push("E");
            }

            // Si detectamos E (Propio) y somos el sujeto, E manda sobre N
            if (flags.isSelf && intents.includes("E")) return this.docStore.find(p => p.id === "E");

            for (const intentId of priorityOrder) {
                if (intents.includes(intentId)) {
                    const doc = this.docStore.find(p => p.id === intentId);
                    if (doc) return doc;
                }
            }
        }

        // 2. Coincidencia por Letra del Apartado
        const byLetter = this.docStore.find(p => p.letter.toLowerCase() === q || p.id.toLowerCase() === q);
        if (byLetter) return byLetter;

        // 3. Scoring Híbrido (Mejorado con Pesos)
        const scoredResults = this.docStore.map(p => {
            let score = 0;
            const normalizedTitle = this.normalizeText(p.title);
            const normalizedCubre = this.normalizeText(p.tenSeconds.cubre);

            // Búsqueda en título (Peso alto)
            if (normalizedTitle.includes(q)) score += 30;

            // Búsqueda en descripción resumida
            if (normalizedCubre.includes(q)) score += 10;

            // Bonus por intención coincidente
            if (intents.includes(p.id)) score += 50;

            // Ajuste por Sujeto
            if (flags.isSelf && p.id === "E") score += 20;
            if (!flags.isSelf && (p.id === "N" || p.id === "K")) score += 10;

            // Ajuste por Convivencia
            if (flags.isConviviente && (p.id === "A" || p.id === "N")) score += 40;

            // Búsqueda en FAQs
            if (p.faq?.some(f => this.normalizeText(f.q).includes(q) || this.normalizeText(f.a).includes(q))) {
                score += 5;
            }

            // Bonus por palabras clave específicas del apartado
            const keywords = normalizedTitle.split(" ");
            if (keywords.some(word => q.includes(word) && word.length > 3)) score += 5;

            return { ...p, score };
        }).filter(r => r.score > 0).sort((a, b) => b.score - a.score);

        return scoredResults.length > 0 ? scoredResults[0] : null;
    }

    async processQuery(userQuery, history = [], forcedContext = null) {
        // PASO 1: Análisis Semántico Siempre (para guardrails e intenciones)
        const semanticData = this.analyzeQuerySemantically(userQuery);
        let contextItem = forcedContext;

        // PASO 2: Guardrail de Animales
        if (semanticData.intents.includes("ANIMAL")) {
            return {
                type: 'error',
                text: "El Art. 11 de los Permisos Retribuidos del Ayuntamiento de Villalbilla aplica exclusivamente a familiares humanos y convivientes. No existe permiso por motivos relacionados con animales o mascotas."
            };
        }

        // PASO 3: Búsqueda de Contexto (Prioridad a lo nuevo)
        const newContext = this.retrieveContext(userQuery, semanticData);

        // Si encontramos un nuevo contexto, este MANDA (cambio de tema)
        if (newContext) {
            contextItem = newContext;
        }
        // Si no hay contexto nuevo y la consulta es corta, mantenemos el anterior (seguimiento)
        else if (forcedContext && userQuery.length <= 4) {
            contextItem = forcedContext;
        }

        // PASO 4: Error si no hay contexto final
        if (!contextItem) {
            return {
                type: 'error',
                text: "No encuentro ese permiso específico en el Art. 11. ¿Podrías reformularlo o decirme el motivo (ej: médico, fallecimiento, mudanza)?"
            };
        }

        const historyContext = history.length > 0
            ? `HISTORIAL DE LA CONVERSACIÓN:\n${history.map(h => `USUARIO: ${h.query}\nASISTENTE: ${h.response}`).join('\n\n')}\n`
            : "";

        const prompt = `
            ${historyContext}
            
            CONTEXTO NORMATIVO ACTUAL:
            - Tipo de Personal: ${this.role}
            - Datos del Permiso: ${JSON.stringify(contextItem)}
            
            CONSULTA DEL USUARIO: ${userQuery}
 
            INSTRUCCIONES DE RESPUESTA:
            - Responde basándote en el CONTEXTO NORMATIVO ACTUAL y el HISTORIAL.
            - Si la consulta del usuario cambia de tema respecto al historial, prioriza los datos del nuevo permiso e indica su ID.
            - Usa [TITULO: ...] para encabezados técnicos.
            - No olvides incluir [ID: ...] al inicio y [OPCIONES: ...] al final.
            - Si el usuario pregunta algo que ya se respondió, aclara el matiz solicitado.
        `;

        try {
            return await this.executeGeminiQuery(prompt, contextItem);
        } catch (error) {
            // Handle rate limit error (429) with rotation and retry
            const isRateLimit = error.message?.includes('429') || error.status === 429;

            if (isRateLimit && this.rotateKey()) {
                console.log("[RAG] Rate limit hit. Retrying with next API key...");
                try {
                    return await this.executeGeminiQuery(prompt, contextItem);
                } catch (retryError) {
                    console.error("Gemini Retry Error:", retryError);
                    return this.getLocalFallbackResponse(contextItem);
                }
            }

            console.error("Gemini Error:", error);
            return this.getLocalFallbackResponse(contextItem);
        }
    }

    async executeGeminiQuery(prompt, contextItem) {
        // Validación inicial de llaves
        if (RAGEngine.apiKeys.length === 0) {
            console.error("[RAG] No API Keys available.");
            return this.getLocalFallbackResponse(contextItem);
        }

        const maxAttempts = RAGEngine.apiKeys.length;
        let attempt = 0;
        let lastError = null;

        // Bucle de intentos lineal (no recursivo)
        while (attempt < maxAttempts) {
            try {
                // Intentar realizar la llamada con la llave actual
                return await this.performGeminiCall(prompt, contextItem);
            } catch (error) {
                lastError = error;
                console.warn(`[RAG] Attempt ${attempt + 1}/${maxAttempts} failed with Key Index ${RAGEngine.keyIndex}:`, error.message || error);

                // Si es el último intento, no rotamos, salimos del bucle
                if (attempt === maxAttempts - 1) break;

                // Rotar llave para el siguiente intento
                if (this.rotateKey()) {
                    attempt++;
                    // Pequeña pausa para asegurar limpieza
                    await new Promise(resolve => setTimeout(resolve, 500));
                } else {
                    // Si no se puede rotar (solo hay 1 llave), salir
                    break;
                }
            }
        }

        console.error("[RAG] All API keys exhausted. Switching to Local Fallback.", lastError);
        RAGEngine.stats.failures++;
        return this.getLocalFallbackResponse(contextItem);
    }

    async performGeminiCall(prompt, contextItem) {
        // Increment stats
        RAGEngine.stats.totalRequests++;
        RAGEngine.stats.keysUsage[RAGEngine.keyIndex]++;

        const roleConfig = {
            'FUNCIONARIO': {
                normativa: 'Acuerdo de Personal Funcionario',
                label: 'ACUERDO',
                detallesExtra: `- Menciona que para hospitalización el hecho causante debe producirse dentro de la jornada laboral para computar el día.
                - Refiere siempre al "Acuerdo" como fuente legal.`
            },
            'LABORAL': {
                normativa: 'Convenio Colectivo del Personal Laboral',
                label: 'CONVENIO',
                detallesExtra: `- En intervenciones sin ingreso, recalca que el reposo domiciliario es OBLIGATORIO y debe constar en el volante para dar derecho a días adicionales.
                - Refiere siempre al "Convenio" como fuente legal.`
            }
        };

        const config = roleConfig[this.role] || { normativa: 'Normativa Municipal', label: 'NORMATIVA', detallesExtra: '' };

        const model = this.genAI.getGenerativeModel({
            model: this.modelName,
            systemInstruction: `Eres un Sistema de Información Normativa del Ayuntamiento de Villalbilla.
            Tu función es proporcionar datos técnicos precisos sobre los permisos del Art. 11 basándote EXCLUSIVamente en el ${config.normativa}.
            
            TONO: Estrictamente OBJETIVO, TÉCNICO e IMPERSONAL. 
            - No uses la segunda persona ("tienes", "debes", "te corresponde").
            - No uses fórmulas de cercanía ("compañero", "hola", "entiendo").
            - Usa la tercera persona o formas impersonales ("Corresponden...", "Es necesario...", "Se establece...").
            
            FORMATO: Usa Markdown para mejorar la legibilidad. 
            - Usa **negritas** para términos clave y plazos.
            - Usa listas con guiones si es necesario.
            - Usa [TITULO: Nombre del Título] en una línea aparte para separar secciones principales.
            
            OPCIONES DE SEGUIMIENTO: Incluye al final 2 o 3 opciones de aclaración cortas con el formato [OPCIONES: Opción 1 | Opción 2 | Opción 3].
            
            CONOCIMIENTO DEL EXPERTO: ${JSON.stringify(EXPERT_KNOWLEDGE.interpretaciones)}
            TABLA DE PARENTESCOS: ${JSON.stringify(EXPERT_KNOWLEDGE.parentesco.mapeoSemantico)}
            
            REGLAS ESPECÍFICAS (${config.label}):
            ${config.detallesExtra}

            REGLAS DE ORO:
            1. Diferencia el Apartado K (Urgencias/Especialistas) del N (Gripes/Médico Familia).
            2. Menciona la posibilidad de días alternos en hospitalización si procede.
            3. Si faltan datos (parentesco, localidad), indícalo de forma objetiva.
            4. EXÁMENES (Apartado D): La duración es estrictamente el 'Día de su celebración', sin ampliación por localidad distinta.
            5. APLICABILIDAD: Si el permiso NO aplica al caso concreto (ej: mascota, amigo, grados no cubiertos), incluye al final la etiqueta [APLICA: NO]. Si aplica, usa [APLICA: SI].
            6. IDENTIFICACIÓN: Al principio de la respuesta, indica siempre el ID del apartado que estás explicando actualmente usando la etiqueta [ID: X] (ej: [ID: K] o [ID: A]). Esto es CRÍTICO para la sincronización del sistema.
            7. REFINAMIENTO DE TARJETAS TÉCNICAS (DURACIÓN Y ACREDITACIÓN): 
               - Al final de tu respuesta, debes extraer ÚNICAMENTE los datos aplicables a la consulta específica del usuario para las tarjetas laterales.
               - Formato: [DURACION: Texto corto con el plazo específico] y [ACREDITACION: Documentos específicos para este caso].
               - Si la consulta es sobre un familiar de 2º grado, en [DURACION] solo pondrás el plazo para el 2º grado, NO el de 1º.
               - Si la consulta es una explicación general de grados o un tema donde no hay un plazo concreto, usa [DURACION: No aplica] y [ACREDITACION: No aplica].
               - Sé extremadamente conciso en estas etiquetas.

            LISTA DE IDs DISPONIBLES: ${JSON.stringify(this.docStore.map(p => ({ id: p.id, title: p.title })))}`
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let aiSummary = text;

        // Extraer ID si existe para sincronización
        const idMatch = text.match(/\[ID:\s*(.*?)\]/);
        if (idMatch) {
            const aiIdentifiedId = idMatch[1].trim();
            const matchedDoc = this.docStore.find(p => p.id === aiIdentifiedId);
            if (matchedDoc) {
                contextItem = matchedDoc;
            }
            aiSummary = aiSummary.replace(/\[ID:\s*.*?\]/, '').trim();
        }

        // Extraer opciones si existen
        let options = [];
        let showCard = true;

        const optionsMatch = aiSummary.match(/\[OPCIONES:\s*(.*?)\]/);
        if (optionsMatch) {
            options = optionsMatch[1].split('|').map(o => o.trim());
            aiSummary = aiSummary.replace(/\[OPCIONES:\s*.*?\]/, '').trim();
        }

        const aplicaMatch = aiSummary.match(/\[APLICA:\s*(.*?)\]/);
        if (aplicaMatch) {
            showCard = aplicaMatch[1].toUpperCase() === 'SI';
            aiSummary = aiSummary.replace(/\[APLICA:\s*.*?\]/, '').trim();
        }

        // Extraer Refinamiento de Tarjetas (Duración y Acreditación)
        let customDuration = contextItem.tenSeconds.corresponde;
        let customAccreditation = contextItem.documentacion;

        const duracionMatch = aiSummary.match(/\[DURACION:\s*(.*?)\]/);
        if (duracionMatch) {
            customDuration = duracionMatch[1].trim();
            aiSummary = aiSummary.replace(/\[DURACION:\s*.*?\]/, '').trim();
        }

        const acreditacionMatch = aiSummary.match(/\[ACREDITACION:\s*(.*?)\]/);
        if (acreditacionMatch) {
            customAccreditation = acreditacionMatch[1].trim();
            aiSummary = aiSummary.replace(/\[ACREDITACION:\s*.*?\]/, '').trim();
        }

        return {
            type: 'success',
            interpretation: contextItem.title,
            originalContext: contextItem,
            showCard: showCard,
            respuestaOperativa: {
                duracion: customDuration,
                quien: contextItem.quien,
                condiciones: contextItem.condiciones,
                documentacion: customAccreditation
            },
            extracto: contextItem.tenSeconds.cubre,
            aiSummary: aiSummary,
            clarificationOptions: options,
            nextStep: options.length > 0 ? "Opciones de consulta adicionales:" : "Para más aclaraciones o detalles específicos, se recomienda realizar una nueva consulta."
        };
    }

    getLocalFallbackResponse(contextItem) {
        return {
            type: 'success',
            interpretation: `(Motor Local) Sobre ${contextItem.title}:`,
            respuestaOperativa: {
                duracion: contextItem.tenSeconds.corresponde,
                quien: contextItem.quien,
                condiciones: contextItem.condiciones,
                documentacion: contextItem.documentacion
            },
            extracto: contextItem.tenSeconds.cubre,
            aiSummary: "Lo siento, el servicio de IA está saturado en todas nuestras cuentas en este momento. Como delegado, te confirmo que según el Art. 11 te corresponde lo indicado arriba. No olvides presentar el justificante médico correspondiente.",
            nextStep: "Modo Local activado por error de conexión (Saturación de API)."
        };
    }
}

export default RAGEngine;
