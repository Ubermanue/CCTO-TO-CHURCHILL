const axios = require('axios');

module.exports.config = {
  name: 'testai',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['testai'],
  description: "AI",
  usage: "ai [prompt]",
  credits: 'churchill',
  cooldown: 3,
};

const ongoingConversations = {};

module.exports.run = async function({ api, event, args }) {
  const prompt = args.join(" ");
  const userID = "100";
  const threadID = event.threadID;
  const senderID = event.senderID;
  const messageID = event.messageID;

  const handleAIResponse = async (prompt, sendMessageID) => {
    const apiUrl = `https://markdevs-last-api-as2j.onrender.com/gpt4?prompt=${encodeURIComponent(prompt)}&uid=${encodeURIComponent(userID)}`;

    try {
      const startTime = Date.now();
      const response = await axios.get(apiUrl);
      const result = response.data;
      const aiResponse = result.gpt4;
      const endTime = Date.now();
      const responseTime = ((endTime - startTime) / 1000).toFixed(2);

      api.getUserInfo(senderID, async (err, ret) => {
        if (err) {
          console.error('Error fetching user info:', err);
          await api.editMessage('Error fetching user info.', sendMessageID);
          return;
        }

        const userName = ret[senderID].name;
        const formattedResponse = `🤖 𝙶𝙿𝚃4+ 𝙲𝙾𝙽𝚃𝙸𝙽𝚄𝙴𝚂 𝙰𝙸
━━━━━━━━━━━━━━━━━━
${aiResponse}
━━━━━━━━━━━━━━━━━━
🗣 Asked by: ${userName}
⏰ Respond Time: ${responseTime}s
━━━━━━━━━━━━━━━━━━
𝙸𝚏 𝚎𝚛𝚛𝚘𝚛 𝚃𝚛𝚢 𝚄𝚜𝚎 "𝙶𝙿𝚃4" 𝙲𝙼𝙳`;

        try {
          await api.editMessage(formattedResponse, sendMessageID);
          api.setMessageReaction("✅", sendMessageID, (err) => {
            if (err) console.error('Error setting reaction:', err);
          });
        } catch (error) {
          console.error('Error editing message:', error);
          api.sendMessage('Error editing message: ' + error.message, threadID, event.messageID);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      await api.editMessage('Error: ' + error.message, sendMessageID);
    }
  };

  if (args.length === 0 && ongoingConversations[threadID] && ongoingConversations[threadID].senderID === senderID) {
    // If there's an ongoing conversation and the message is a reply, handle it as a follow-up
    const conversation = ongoingConversations[threadID];
    await handleAIResponse(event.body, conversation.sendMessageID);
  } else {
    // Start a new conversation
    if (!prompt) {
      api.sendMessage('Please provide a question ex: ai what is n1gga?', threadID, messageID);
      return;
    }

    const chill = await new Promise(resolve => {
      api.sendMessage('🤖 𝘎𝘗𝘛4 𝘈𝘕𝘚𝘞𝘌𝘙𝘐𝘕𝘎...', threadID, (err, info) => {
        if (err) {
          console.error('Error sending message:', err);
          return;
        }
        api.setMessageReaction("⏳", info.messageID, (err) => {
          if (err) console.error('Error setting reaction:', err);
        });
        resolve(info);
      });
    });

    ongoingConversations[threadID] = { sendMessageID: chill.messageID, senderID: senderID };
    await handleAIResponse(prompt, chill.messageID);
  }
};
