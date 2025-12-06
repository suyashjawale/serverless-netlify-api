const UAParser = require("ua-parser-js");
const admin = require('firebase-admin');

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Accept-CH": "Sec-CH-UA-Full-Version-List, Sec-CH-UA-Mobile, Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Arch, Sec-CH-UA-Bitness",
    "Critical-CH": "Sec-CH-UA-Full-Version-List, Sec-CH-UA-Mobile, Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Arch, Sec-CH-UA-Bitness",
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
    const parser = UAParser(event.headers).withClientHints();
    await firestore.collection('visitors').doc('dummy').set(event.headers)
    // console.log(event.headers)
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(parser, null, 2)
    };
};
