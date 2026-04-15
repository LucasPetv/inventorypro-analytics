const bcrypt = require('bcryptjs');

async function generatePasswordHashes() {
    console.log('🔐 Generiere sichere Passwort-Hashes für Demo-Accounts...\n');
    
    const passwords = [
        { user: 'admin', password: 'admin123' },
        { user: 'demo', password: 'demo123' }
    ];
    
    for (const { user, password } of passwords) {
        try {
            const saltRounds = 12;
            const salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(password, salt);
            
            console.log(`👤 ${user}:`);
            console.log(`   Password: ${password}`);
            console.log(`   Hash: ${hash}`);
            console.log(`   Salt: ${salt}\n`);
            
            // Verifikation
            const isValid = await bcrypt.compare(password, hash);
            console.log(`   ✅ Verifikation: ${isValid ? 'OK' : 'FEHLER'}\n`);
            
        } catch (error) {
            console.error(`❌ Fehler bei ${user}:`, error);
        }
    }
    
    console.log('📋 SQL Update Statement:');
    console.log('UPDATE users SET');
    console.log("  password_hash = '$2b$12$...' WHERE username = 'admin';");
    console.log("UPDATE users SET");
    console.log("  password_hash = '$2b$12$...' WHERE username = 'demo';");
}

// Nur ausführen wenn direkt aufgerufen
if (require.main === module) {
    generatePasswordHashes().catch(console.error);
}

module.exports = { generatePasswordHashes };
