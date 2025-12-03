export async function handler(event, context) {
    const body = JSON.parse(event.body);

    if (body.callback_query) {
        const chatId = body.callback_query.message.chat.id;
        const data = body.callback_query.data;

        await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: `You clicked: ${data}`
            })
        });
    }

    return { statusCode: 200, body: "OK" };
}
