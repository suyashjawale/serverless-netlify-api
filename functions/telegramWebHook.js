const admin = require('firebase-admin');
const UAParser = require("ua-parser-js");

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const firestore = admin.firestore();

export async function handler(event, context) {
    const body = JSON.parse(event.body);

    if (body.callback_query) {
        const chatId = body.callback_query.message.chat.id;
        const data = body.callback_query.data;

        const myHeaders = new Headers();
        myHeaders.append("content-type", "application/x-www-form-urlencoded; charset=UTF-8");

        const raw = "ip=116.74.191.139&source=ipgeolocation&ipv=4";

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        const res = await fetch("https://www.iplocation.net/get-ipdata", requestOptions)
        const xml = await res.json();
        const parser = new UAParser(uaString);

        let message = "";
        message += `<b>IP<b/>\n${data}\n\n__________________\n\n<b>Browser<b/>\n${parser.getBrowser().name}\n\n<b>CPU<b/>\n${parser.getCPU().name}\n\n<b>Device<b/>\n${parser.getDevice().name}\n\n<b>OS<b/>\n${parser.getOS().name}\n\n__________________\n\n`;

        Object.keys(xml.res.data).forEach(key => {
            message += `<b>${key}<b/>\n${myObject[key]}\n\n`;
        });

        await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "HTML"
            })
        });
    }

    return { statusCode: 200, body: "OK" };
}
