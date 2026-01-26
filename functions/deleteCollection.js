const admin = require('firebase-admin');

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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

    try {
        const body = JSON.parse(event.body || '{}');
        const { customName, password } = body;

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
        await firestore.collection('collection').doc(customName).delete();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ "message": 'File Uploaded' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
