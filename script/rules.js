module.exports.config = {
  name: "rules",
  version: "1.0.2",
  role: 2,
  credits: "cliff",
  description: "Rules of the group",
  hasPrefix: false,
  cooldowns: 5,
  aliases: [],
};

const rules = `
Your group rules:
1. Do not buy/sell in group
2. Do not change the box information
3. No pedophilia/18+
4. LGBTQ+ SUPPORT IS STRICTLY PROHIBITED
5. Do not use disrespectful words to each other
6. Error reports must be included with photos or videos
7. Please do not use languages other than tagalog and English
8. No simping allowed
9. Don't mention @everyone
10. Don't talk about other bots without admin's permission
11. Using the command "Shortcut/Shorts" is restricted
12. Criticizing other races/people/groups is not allowed at all
13. Do not share any political memes or photos
14. If you're having fun, take other people's actions as fun as well
15. Pretending to be a bot is prohibited
16. Don't use Gemini for games
17. Don't create or make albums without explicit permission
18. No 18+
19. Don't mention vixvus at night`;

module.exports.run = async function ({ api, event }) {
  api.sendMessage(rules, event.threadID, event.messageID);
};
