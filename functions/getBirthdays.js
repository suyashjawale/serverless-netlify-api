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

        const today = new Date();
        const snapshot = await firestore.collection('birthdays').doc(`${today.getDate()}-${today.getMonth() + 1}`).get();

        if (snapshot.empty || snapshot.data() == undefined) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify([]),
            };
        }

        if (password.trim().length == 0) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(snapshot.data()['records'].map((data => {
                    return {
                        "message": data.message
                    }
                })) || []),
            };
        }
        else {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(snapshot.data()['records'] || []),
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
