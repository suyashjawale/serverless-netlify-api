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

exports.handler = async (event, context) => {
    const body = JSON.parse(event.body);

    if (body.callback_query) {
        const chatId = body.callback_query.message.chat.id;
        const data = body.callback_query.data;

        const userAgent = await firestore.collection('visitors').doc(data).get();


        const myHeaders = new Headers();
        myHeaders.append("content-type", "application/x-www-form-urlencoded; charset=UTF-8");

        const raw = `ip=${data}&source=ipgeolocation&ipv=4`;

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        const res = await fetch("https://www.iplocation.net/get-ipdata", requestOptions)
        const xml = (await res.json()).res.data;
        const parser = new UAParser(userAgent.data()['headers']).withClientHints();

        let message = "";
        message += `<b>IP</b>\n${data}\n\n__________________\n\n<b>Browser</b>\n${parser.getBrowser().name}\n\n<b>CPU</b>\n${parser.getCPU().architecture}\n\n<b>Device</b>\n${parser.getDevice().model} ${parser.getDevice().vendor} ${parser.getDevice().type}\n\n<b>OS</b>\n${parser.getOS().name}\n\n__________________\n\n`;

        message += `<b>Continent</b>\n${xml.continent_name}\n\n<b>Country</b>\n${xml.country_name}\n\n<b>State</b>\n${xml.state_prov}\n\n<b>District</b>\n${xml.district}\n\n<b>City</b>\n${xml.city}\n\n<b>ISP</b>\n${xml.isp} - ${xml.connection_type}\n\n<b>Organization</b>\n${xml.organization}\n\n__________________\n\n<a href="https://www.google.com/maps/search/?api=1&query=${xml.latitude},${xml.longitude}">See On Maps</a>`;

        const r1 = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "HTML"
            })
        });
    }

    return { statusCode: 200, body: "ok" };
}
