const admin = require('firebase-admin');

const headers = {
    'Access-Control-Allow-Origin': 'https://suyashjawale.github.io',
    'Access-Control-Allow-Headers': 'Content-Type, X-Site-Identity',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Initialize Firebase only once
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const firestore = admin.firestore();
const SECRET_PASSWORD = process.env.AUTHENTICATION_CODE;

exports.handler = async (event) => {
    // Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // Add this check after the method check
    if (event.headers['x-site-identity'] !== 'portfolio-admin-v1') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Identity mismatch' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');

        const { link, name, password } = body;

        // Validate input
        if (!password || password.length > 20) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid' }),
            };
        }

        // Check password
        if (password.toString() !== SECRET_PASSWORD) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid password' }),
            };
        }

        // Fetch document
        await firestore.collection('movies').doc(name).set(
            {   
                link : link,
                name : name
            }
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ "message": 'Movie Uploaded' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};