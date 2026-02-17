/**
 * KNOWLEDGE BASE: MATRICES DE DELEGADO EXPERTO - VILLALBILLA
 * Este archivo contiene la lógica semántica y las interpretaciones oficiales 
 * de la Comisión Paritaria para alimentar al motor RAG.
 */

export const EXPERT_KNOWLEDGE = {
    parentesco: {
        "1er grado": ["Padres", "Hijos", "Cónyuge", "Pareja de hecho", "Suegros", "Yernos", "Nueras"],
        "2º grado": ["Abuelos", "Nietos", "Hermanos", "Cuñados", "Abuelos del cónyuge"],
        mapeoSemantico: {
            "padre": "1er grado", "madre": "1er grado", "hijo": "1er grado", "hija": "1er grado",
            "abuelo": "2º grado", "abuela": "2º grado", "nieto": "2º grado", "nieta": "2º grado",
            "hermano": "2º grado", "hermana": "2º grado", "cuñado": "2º grado", "cuñada": "2º grado",
            "suegro": "1er grado", "suegra": "1er grado", "yerno": "1er grado", "nuera": "1er grado",
            "mujer": "cónyuge", "marido": "cónyuge", "esposa": "cónyuge", "esposo": "cónyuge",
            "pareja": "cónyuge/pareja de hecho",
            "abuelo de mi mujer": "2º grado afinidad", "abuela de mi mujer": "2º grado afinidad",
            "abuelo de mi marido": "2º grado afinidad", "abuela de mi marido": "2º grado afinidad",
            "amigo": "conviviente (si acredita cuidado efectivo)", "amiga": "conviviente (si acredita cuidado efectivo)",
            "tia": "3er grado (no cubierto)", "tio": "3er grado (no cubierto)",
            "sobrino": "3er grado (no cubierto)", "sobrina": "3er grado (no cubierto)"
        },
        restricciones: {
            "animales": "No dan derecho a permiso (perro, gato, mascota, tortuga, etc.). Los permisos son exclusivos para familiares humanos o convivientes acreditados.",
            "amigos": "No dan derecho a permiso, salvo que se acredite convivencia efectiva y necesidad de cuidado (Apartado A)."
        }
    },
    lexicoMedico: {
        cirugia_grave: [
            "operacion", "cirugia", "intervencion", "ingreso", "hospitalizacion", "enfermedad grave",
            "cricotiroidectomia", "apendicectomia", "quirofano", "postoperatorio", "bypass", "mastectomia",
            "accidente", "grave", "uci", "uiv"
        ],
        invasivo_especialista: [
            "colonoscopia", "endoscopia", "biopsia", "sedacion", "anestesia general", "tac con contraste",
            "oncologia", "especialista", "pruebas invasivas", "puncion", "cateterismo", "resonancia"
        ],
        pruebas_propias: [
            "analitica", "analisis de sangre", "radiografia", "ecografia", "dentista", "oculista",
            "revision", "chequeo", "doctor", "medico", "podologo", "oftalmologo"
        ],
        rutina_familiar: [
            "pediatra", "medico de cabecera", "gripe", "indisposicion", "fiebre", "tutoria", "escolar",
            "reunion colegio", "vacuna", "enfermera"
        ]
    },
    conceptosClave: {
        "mismo_municipio": "Villalbilla",
        "distinto_municipio": "Cualquier lugar fuera de Villalbilla (ej: Alcalá de Henares, Madrid, Guadalajara)",
        "urgencia_escolar": "Apartado N (Bolsa 28h)",
        "especialista_hijo": "Apartado K (Tiempo indispensable)",
        "medico_cabecera_hijo": "Apartado N (Bolsa 28h)",
        "reposo_domiciliario": "Debe estar escrito en el alta o volante médico para dar derecho a días tras hospitalización."
    },
    interpretaciones: [
        {
            contexto: "Animales/Mascotas",
            regla: "Denegar cualquier solicitud relacionada con animales. Responder que el Art. 11 solo contempla familiares humanos."
        },
        {
            contexto: "Hospitalización/Enfermedad",
            regla: "Los días se pueden disfrutar de forma alterna mientras dure el ingreso o el reposo prescrito."
        },
        {
            contexto: "Fallecimiento",
            regla: "Si el fallecimiento es después de tu jornada, el permiso empieza al día siguiente. Si el entierro es en otra localidad, se aplican los días de distinta localidad."
        },
        {
            contexto: "Diferencia K vs N",
            regla: "Apartado K = Solo Urgencias, Especialistas o Pruebas Invasivas (sedación). Apartado N = Consultas rutinarias, gripes, tutorías escolares."
        }
    ]
};
