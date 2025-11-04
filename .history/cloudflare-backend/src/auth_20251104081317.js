/**
 * Authentication utilities for Cloudflare Workers
 * Simple password hashing using Web Crypto API
 */

// Simple JWT implementation for Cloudflare Workers
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export async function verifyPassword(password, hashedPassword) {
    const hash = await hashPassword(password);
    return hash === hashedPassword;
}

// Simple JWT-like token generation (not full JWT, just a signed token)
export async function generateToken(userId, role) {
    const payload = {
        userId,
        role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };
    
    const token = btoa(JSON.stringify(payload)) + '.' + await hashPassword(JSON.stringify(payload));
    return token;
}

export async function verifyToken(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 2) return null;
        
        const payload = JSON.parse(atob(parts[0]));
        const signature = parts[1];
        
        // Verify signature
        const expectedSignature = await hashPassword(JSON.stringify(payload));
        if (signature !== expectedSignature) return null;
        
        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) return null;
        
        return payload;
    } catch (error) {
        return null;
    }
}

// Middleware to check authentication
export async function requireAuth(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Unauthorized', status: 401 };
    }
    
    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    
    if (!payload) {
        return { error: 'Invalid or expired token', status: 401 };
    }
    
    // Verify session in database
    const session = await env.DB.prepare('SELECT * FROM sessions WHERE token = ? AND expiresAt > ?')
        .bind(token, Math.floor(Date.now() / 1000))
        .first();
    
    if (!session) {
        return { error: 'Session not found or expired', status: 401 };
    }
    
    // Get user info
    const user = await env.DB.prepare('SELECT id, username, fullName, email, role, class, active FROM users WHERE id = ?')
        .bind(payload.userId)
        .first();
    
    if (!user || !user.active) {
        return { error: 'User not found or inactive', status: 401 };
    }
    
    return { user, session };
}

// Middleware to check role
export function requireRole(user, allowedRoles) {
    if (!allowedRoles.includes(user.role)) {
        return { error: 'Forbidden: insufficient permissions', status: 403 };
    }
    return null;
}
