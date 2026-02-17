import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env.local');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const keys = [];

async function askForKey() {
    return new Promise((resolve) => {
        rl.question('\n🔑 Pega una clave API de Gemini: ', (key) => {
            if (key.trim()) {
                keys.push(key.trim());
                console.log(`✅ Clave añadida (Total: ${keys.length})`);
            } else {
                console.log('⚠️ La clave no puede estar vacía.');
            }
            resolve();
        });
    });
}

async function askForMore() {
    return new Promise((resolve) => {
        rl.question('➕ ¿Quieres añadir otra clave? (s/n): ', (answer) => {
            resolve(answer.toLowerCase() === 's');
        });
    });
}

function updateEnvFile(newKeys) {
    let content = '';
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
    }

    const lines = content.split('\n');
    let found = false;
    const newLines = lines.map(line => {
        if (line.startsWith('VITE_GEMINI_API_KEYS=')) {
            found = true;
            return `VITE_GEMINI_API_KEYS=${newKeys.join(',')}`;
        }
        return line;
    });

    if (!found) {
        newLines.push(`VITE_GEMINI_API_KEYS=${newKeys.join(',')}`);
    }

    fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
}

async function main() {
    console.log('🚀 Configurador de Claves API para Rotación');
    console.log('-------------------------------------------');

    let adding = true;
    while (adding) {
        await askForKey();
        adding = await askForMore();
    }

    if (keys.length > 0) {
        console.log(`\n📝 Actualizando .env.local con ${keys.length} claves...`);
        updateEnvFile(keys);
        console.log('✨ ¡Hecho! Tu sistema ya está listo para rotar estas claves.');
        console.log('Var: VITE_GEMINI_API_KEYS');
    } else {
        console.log('\n❌ No se añadieron claves. No se realizaron cambios.');
    }

    rl.close();
}

main().catch(err => {
    console.error('Error:', err);
    rl.close();
});
