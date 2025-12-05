const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Accept-CH": "Sec-CH-UA, Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Mobile",
    "Critical-CH" : "Sec-CH-UA, Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Mobile",
    "Permissions-Policy": "ch-ua=*; ch-ua-model=*; ch-ua-platform=*; ch-ua-platform-version=*; ch-ua-mobile=*"
};

// exports.handler = async (event) => {

//     return { statusCode: 200, headers, body: JSON.stringify(event.headers) };
// }

const UAParser = require("ua-parser-js");

exports.handler = async (event, context) => {
    const getHighEntropyValues =
        "Sec-CH-UA-Full-Version-List, Sec-CH-UA-Mobile, Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Arch, Sec-CH-UA-Bitness";

    // Parse browser data using UAParser
    const parser = UAParser(event.headers).withClientHints();

    // const result = {
    //     browser: parser.getBrowser(),
    //     device: parser.getDevice(),
    //     os: parser.getOS(),
    //     cpu: parser.getCPU(),
    //     headersReceived: event.headers
    // };

    return {
        statusCode: 200,
        // headers: {
        //     "Access-Control-Allow-Origin": "*",
        //     "Accept-CH": getHighEntropyValues,
        //     "Critical-CH": getHighEntropyValues,
        // },
        headers,
        body: JSON.stringify(parser, null, 2)
    };
};
