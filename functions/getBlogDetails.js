const admin = require('firebase-admin');

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Site-Identity',
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
        const body = JSON.parse(event.body || '{}');

        const { link, password } = body;

        if (!password || password.length > 20) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid' }),
            };
        }

        // Check password
        if (password.toString() !== SECRET_PASSWORD) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid password' }),
            };
        }

        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8,mr;q=0.7,hi;q=0.6,la;q=0.5");
        myHeaders.append("cache-control", "no-cache");
        myHeaders.append("pragma", "no-cache");
        myHeaders.append("priority", "u=0, i");
        myHeaders.append("sec-ch-ua", "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"Google Chrome\";v=\"144\"");
        myHeaders.append("sec-ch-ua-mobile", "?0");
        myHeaders.append("sec-ch-ua-platform", "\"Windows\"");
        myHeaders.append("sec-fetch-dest", "document");
        myHeaders.append("sec-fetch-mode", "navigate");
        myHeaders.append("sec-fetch-site", "none");
        myHeaders.append("sec-fetch-user", "?1");
        myHeaders.append("upgrade-insecure-requests", "1");
        myHeaders.append("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36");
        myHeaders.append("Cookie", "uid=lo_24368we9b505; sid=1:qQ9KLcIoP4p9OPcx2/eWBte2ctgQDJ11M8yflbcKVzRnmLlHoZZEUSwy3CXTOwCW; _ga_L0TFYZVE5F=GS2.2.s1763720284$o2$g0$t1763720284$j60$l0$h0; _ga=GB1.1.608650474.1763717419; _cfuvid=GyjnozVpXJNAEBsNcqVJnP9QTcDgDq24zg3gaHzQVOc-1769776289452-0.0.1.1-604800000; cf_clearance=zsHj.2G.nXmfNK4XqWFWwEak5hKiV8yis7zupGOeFcA-1769782948-1.2.1.1-juNTqoVkFmbWIMvVLTJW2gKr174jGtf0PjRMjOvlhy8Giho7pLc6bVxqCex6x25mxwi3F7nncc90hKlY._RtDjE4lNcK1z7._KS1buRSf4iY2FNJfJkcJ1ORlVB.7mGRfi7zVIYyySEmj41lFDAEWOfZhHAzegLn61tzFF2oVjHVqQdcF0Bq.nsU6au1wCd.Nu6EomBn3rZZwmSV_R6fBsmnWy.eZDpmKV0kqvaXy6g; g_state={\"i_l\":0,\"i_ll\":1769781954297,\"i_b\":\"9rsFNHERKy27qUxFlvWDK7fR6jKt9vKWYcUNGPPAlGs\",\"i_e\":{\"enable_itp_optimization\":3}}; _ga_7JY7T788PK=GS2.1.s1769782951$o6$g0$t1769783694$j60$l0$h0; _cfuvid=l8FL6JrU8aasasasasasasaFaiQL9e7cLREYNsLXSoxEpGTEDOhq2SpbM-1769776310145-0.0.1.1-604800000; uid=lo_a2f6f444760e");

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        const res = await fetch(link, requestOptions)

        const textResponse = await res.text()

        return {
            statusCode: 200,
            headers,
            body: textResponse,
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};