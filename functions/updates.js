const admin = require('firebase-admin');

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Site-Identity',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const firestore = admin.firestore();
firestore.settings({ ignoreUndefinedProperties: true })

exports.handler = async (event) => {
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
        let clientIp =
            event.headers["x-client-ip"] ||
            event.headers["client-ip"] ||
            event.headers["x-forwarded-for"] ||
            event.headers["x-real-ip"] ||
            firestore.collection('visitors').doc().id;
        clientIp = clientIp.split(",")[0]

        await firestore.collection('visitors').doc(clientIp).set({
            'IP': clientIp,
            'headers': {
                'user-agent': event.headers['user-agent'],
                ...JSON.parse(event.body)
            },
            'visit-time': new Date().toISOString()
        });

        const message = {
            chat_id: process.env.CHAT_ID,
            text: `Visitor - ${clientIp}`,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Get Details", callback_data: clientIp }
                    ]
                ]
            }
        };

        await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message)
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ ok: "ok" })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};