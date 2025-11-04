/**
 * Password Hash Generator
 * Usage: node hash-password.js <password>
 * Example: node hash-password.js password123
 */

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

const password = process.argv[2] || 'password123';

hashPassword(password).then(hash => {
    console.log(`Password: ${password}`);
    console.log(`SHA-256 Hash: ${hash}`);
    console.log(`\nSQL INSERT example:`);
    console.log(`INSERT INTO users (username, password, fullName, role) VALUES ('username', '${hash}', 'Full Name', 'student');`);
}).catch(error => {
    console.error('Error:', error.message);
});
