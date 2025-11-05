/**
 * Test login credentials directly
 * Usage: node test-login.js
 */

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function testLogin() {
    const username = 'admin';
    const password = 'admin123';
    
    console.log('Testing login for:', username);
    console.log('Password:', password);
    
    const hash = await hashPassword(password);
    console.log('Generated hash:', hash);
    
    // Test API
    const API_URL = 'https://quiz-game-api.quiz-game-khanhan.workers.dev/api';
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        console.log('\n--- API Response ---');
        console.log('Status:', response.status);
        console.log('Data:', data);
        
        if (response.ok) {
            console.log('\n✅ LOGIN SUCCESS!');
            console.log('Token:', data.token?.substring(0, 30) + '...');
            console.log('User:', data.user);
        } else {
            console.log('\n❌ LOGIN FAILED!');
            console.log('Error:', data.error);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLogin();
