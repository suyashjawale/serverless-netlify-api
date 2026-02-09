const admin = require('firebase-admin');
const headers = {
    'Access-Control-Allow-Origin': 'https://suyashjawale.github.io',
    'Access-Control-Allow-Headers': 'Content-Type, X-Site-Identity',
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};
// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const firestore = admin.firestore();

const MY_NUMBER = process.env.MY_NUMBER;

exports.handler = async (event, context) => {

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
        const { number } = body;

        // Check password
        if (number.toString() !== MY_NUMBER) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ status: 'Access Restricted', posts: [] }),
            };
        }

        const snapshot = await firestore.collection('posts').get();

        // Check if the collection has any documents
        if (snapshot.empty) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ status: 'failed', posts: [] }),
            };
        }

        // Map over each document and collect its data
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ status: 'Loaded', posts: snapshot.docs.map(d => d.data()) })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ status: 'failed', posts: [] }),

        };
    }
};