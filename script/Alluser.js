module.exports.config = {
  name: "alluser",
  version: "1.0.5",
  permission: 0,
  role: 0,
  hasPrefix: false,
  credits: "Deku",
  description: "Get all uid and names in Group.",
  commandCategory: "without prefix",
  cooldowns: 2
};

module.exports.run = async function ({ api, event }) {

  async function getUserName(api, senderID) {
      try {
          const userInfo = await api.getUserInfo(senderID);
          return userInfo[senderID]?.name || "User";
      } catch (error) {
          console.log(error);
          return "User";
      }
  }

  async function reply(d) {
      api.sendMessage(d, event.threadID, event.messageID);
  }

  async function main() {
      try {
          const groupInfo = await api.getThreadInfo(event.threadID);
          var ep = groupInfo.participantIDs;
          var msg = "";
          var msgs = "";
          var m = 0;

          for (let i of ep) {
              m += 1;
              const name = await getUserName(api, i);
              msg += `${m}. ${name}\nUser id : ${i}\nFacebook link: https://facebook.com/${i}\n\n`;
          }

          msgs += "All users in this group:\n\n" + msg;
          await reply(msgs);
      } catch (error) {
          console.error("An error occurred:", error);
          await reply("Failed to get group info. Please try again.");
      }
  }

  await main();
};
