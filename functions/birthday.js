const admin = require('firebase-admin');
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const firestore = admin.firestore();

exports.handler = async (event, context) => {
    try {
        const today = new Date();
        const snapshot = await firestore.collection('birthdays').doc(`${today.getDate()}-${today.getMonth() + 1}`).get();

        // Check if the collection has any documents
        if (snapshot.empty) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: 'No data found'
                }),
            };
        }

        // Map over each document and collect its data
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(snapshot.data()['records'].map(item => ({ "uid": item.uid, "person_name": item.name })) || []),
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};