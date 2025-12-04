const admin = require('firebase-admin');
const FieldValue = admin.firestore.FieldValue;

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
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
    try {

        let clientIp =
            event.headers["x-client-ip"] ||
            event.headers["client-ip"] ||
            event.headers["x-forwarded-for"] ||
            event.headers["x-real-ip"] ||
            firestore.collection('visitors').doc().id;
        clientIp = clientIp.split(",")[0]
        await firestore.collection('visitors').doc(clientIp).set({ 'IP': clientIp, visits: FieldValue.arrayUnion({ 'User-Agent': event.headers["user-agent"], 'visit-time': new Date().toISOString() }) }, { merge: true });

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
            body: "Ok",
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};