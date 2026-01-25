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
        const callbackId = body.callback_query.id;

        await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerCallbackQuery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                callback_query_id: callbackId,
                text: "Fetching details…",
                show_alert: false
            })
        });

        const userAgent = await firestore.collection('visitors').doc(data).get();
        const myHeaders = new Headers();
        myHeaders.append("content-type", "application/x-www-form-urlencoded; charset=UTF-8");

        const raw = `ip=${data}&source=ipapico&ipv=4`;

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        const res = await fetch("https://www.iplocation.net/get-ipdata", requestOptions)
        const xml = (await res.json()).res.data;
        const parser = UAParser(
            {
                'user-agent': userAgent.data().headers['user-agent'],
                'sec-ch-ua-mobile': userAgent.data().headers['sec-ch-ua-mobile'],
                'sec-ch-ua-model': userAgent.data().headers['sec-ch-ua-model'],
                'sec-ch-ua-platform': userAgent.data().headers['sec-ch-ua-platform'],
                'sec-ch-ua-platform-version': userAgent.data().headers['sec-ch-ua-platform-version']
            }).withClientHints()

        let message = "";

        message += `<b>IP</b> : <code>${data}</code>\n\n__________________`

        message += `\n\n<b>Device</b>\n${parser.device.type} ${parser.device.vendor} <a href="https://www.google.com/search?q=${parser.device.vendor}+${parser.device.model}&hl=en&lr=lang_en">${parser.device.model}</a>`;
        message += `\n${parser.os.name} ${parser.os.version} ${parser.cpu.architecture}`;
        message += `\n\n<b>Browser</b>\n${parser.browser.name} <code>${parser.browser.version}</code> <code>${userAgent.data().headers['sec-ch-ua-full-version-list']}</code>\n\n__________________\n\n`;

        message += `<b>Location</b>\n<a href="https://www.google.com/maps/search/?api=1&query=${xml.latitude},${xml.longitude}">${xml.city}, ${xml.district}, ${xml.state_prov}, ${xml.country_name}, ${xml.continent_name}</a>`;
        message += `\n\n<b>ISP</b>\n${xml.connection_type} - ${xml.isp}\n${xml.organization}`;

        await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "HTML",
                disable_web_page_preview: true
            })
        });
    }

    return { statusCode: 200, body: JSON.stringify({ "ok": "ok" }) };
}
