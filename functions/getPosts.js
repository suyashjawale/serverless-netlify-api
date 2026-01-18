const admin = require('firebase-admin');
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
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
                statusCode: 200,
                headers,
                body: JSON.stringify({ status: 'No Data', posts: [] }),
            };
        }

        // Map over each document and collect its data
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ status: 'Access Restricted', posts: snapshot.docs.map(d => d.data()) })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ status: 'No Data', posts: [] }),

        };
    }
};