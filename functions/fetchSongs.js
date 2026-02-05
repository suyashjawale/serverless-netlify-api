const admin = require('firebase-admin');
const headers = {
    'Access-Control-Allow-Origin': 'https://suyashjawale.github.io',
    'Access-Control-Allow-Headers': 'Content-Type, X-Site-Identity',
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Accept-CH": "Sec-CH-UA, Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Mobile",
    "Permissions-Policy": "ch-ua=*; ch-ua-model=*; ch-ua-platform=*; ch-ua-platform-version=*; ch-ua-mobile=*"
};
// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const firestore = admin.firestore();

exports.handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    // Add this check after the method check
    if (event.headers['x-site-identity'] !== 'portfolio-admin-v1') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Identity mismatch' }) };
    }

    try {
        const snapshot = await firestore.collection('songs').get();

        // Check if the collection has any documents
        if (snapshot.empty) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify([]),
            };
        }

        // Map over each document and collect its data
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(snapshot.docs.map(d => d.data())), // Ensure this is JSON formatted
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};