const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "tempmail",
    aliases: [`tm`],
    version: "1.0.0",
    author: "UPoL | ArYAN",
    role: 0,
    countDown: 5,
    longDescription: {
      en: "Generate temporary email and check inbox"
    },
    category: "email",
    guide: {
      en: "{p}tempmail < subcommand >\n\nFor Example:\n{p}tempmail gen\n${p}tempmail inbox <tempmail>"
    }
  },
  onStart: async function ({ api, event, args }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(this.config.guide.en, event.threadID, event.messageID);
      }

      if (args[0] === "gen") {
        try {
          const response = await axios.get("https://itsaryan.onrender.com/api/tempmail/get");
          const responseData = response.data.tempmail;
          api.sendMessage(`ðŸ“®|ð—§ð—²ð—ºð—½ð—ºð—®ð—¶ð—¹\nâ”â”â”â”â”â”â”â”â”â”â”â”â”\n\nð–§ð–¾ð—‹ð–¾ ð—‚ð—Œ ð—’ð—ˆð—Žð—‹ ð—€ð–¾ð—‡ð–¾ð—‹ð–ºð—ð–¾ð–½ ð—ð–¾ð—†ð—‰ð—†ð–ºð—‚ð—…\n\nðŸ“|ð—˜ð—ºð—®ð—¶ð—¹\nâž¤ ${responseData}`, event.threadID, event.messageID);
        } catch (error) {
          console.error("âŒ | Error", error);
          api.sendMessage("âŒ|Unable to generate email address. Please try again later...", event.threadID, event.messageID);
        }
      } else if (args[0].toLowerCase() === "inbox" && args.length === 2) {
        const email = args[1];
        try {
          const response = await axios.get(`https://itsaryan.onrender.com/api/tempmail/inbox?email=${email}&apikey=aryan`);
          const data = response.data;
          const inboxMessages = data.map(({ from, subject, body, date }) => `ðŸ“|ð—§ð—²ð—ºð—ºð—®ð—¶ð—¹ ð—œð—»ð—¯ð—¼ð˜…\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n\nð–§ð–¾ð—‹ð–¾ ð—‚ð—Œ ð—’ð—ˆð—Žð—‹ ð—ð–¾ð—†ð—‰ð—†ð–ºð—‚ð—… ð—‚ð—‡ð–»ð—ˆð—‘\n\nðŸ”Ž ð—™ð—¿ð—¼ð—º\n${from}\nðŸ“­ ð—¦ð˜‚ð—¯ð—·ð—²ð—°ð˜\nâž¤ ${subject || 'Not Found'}\n\nðŸ“ ð— ð—²ð˜€ð˜€ð—®ð—´ð—²\nâž¤ ${body}\nðŸ—“ï¸ ð——ð—®ð˜ð—²\nâž¤ ${date}`).join('\n\n');
          api.sendMessage(inboxMessages, event.threadID, event.messageID);
        } catch (error) {
          console.error("ðŸ”´ Error", error);
          api.sendMessage("âŒ|Can't get any mail yet. Please send mail first.", event.threadID, event.messageID);
        }
      } else {
        api.sendMessage("âŒ | Use 'Tempmail gen' to generate email and 'Tempmail inbox {email}' to get the inbox emails.", event.threadID, event.messageID);
      }

    } catch (error) {
      console.error(error);
      return api.sendMessage(`An error occurred. Please try again later.`, event.threadID, event.messageID);
    }
  }
};
