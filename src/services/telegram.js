export async function send(text, photoFile, token, chatId) {
  const sendMsgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  
  const msgResponse = await fetch(sendMsgUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text
    })
  });

  if (!msgResponse.ok) {
    let errorDesc = msgResponse.statusText;
    try {
      const errData = await msgResponse.json();
      if (errData.description) errorDesc = errData.description;
    } catch (e) {}
    throw new Error(`Telegram Error: ${errorDesc}`);
  }

  const msgData = await msgResponse.json();
  
  if (!msgData.ok) {
    throw new Error(`Telegram Error: ${msgData.description}`);
  }

  const messageId = msgData.result.message_id;

  if (photoFile) {
    const sendPhotoUrl = `https://api.telegram.org/bot${token}/sendPhoto`;
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', photoFile);
    formData.append('reply_to_message_id', messageId);

    const photoResponse = await fetch(sendPhotoUrl, {
      method: 'POST',
      body: formData
    });

    if (!photoResponse.ok) {
      throw new Error(`Telegram sendPhoto failed: ${photoResponse.statusText}`);
    }
    
    const photoData = await photoResponse.json();
    if (!photoData.ok) {
      throw new Error(`Telegram sendPhoto error: ${photoData.description}`);
    }
    return photoData;
  }

  return msgData;
}
