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

exports.handler = async (event, context) => {

    // Add this check after the method check
    if (event.headers['x-site-identity'] !== 'portfolio-admin-v1') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Identity mismatch' }) };
    }
    try {
        const name = event.queryStringParameters.name || 'all';

        if (name != 'all') {

            let single = await firestore.collection('collection').doc(name).get();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(single.data()),
            };
        }

        const snapshot = await firestore.collection('collection').get();

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