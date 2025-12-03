exports.handler = async (event) => {

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

    return { statusCode: 200, body: JSON.stringify(xml) };
}
