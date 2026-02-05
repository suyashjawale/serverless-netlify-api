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
        const { password } = body;

        // Validate input

        if (password.length > 20) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid' }),
            };
        }

        if (password.trim().length != 0 && password.toString() !== SECRET_PASSWORD) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid password' }),
            };
        }

        const users = await firestore.collection('instaBot').doc('users').get();
        const creds = await firestore.collection('credentials').doc('instaStoryBot').get();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ "users": users.data()['records'], "creds": creds.data() }),
        };


    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
