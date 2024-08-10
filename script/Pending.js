module.exports.config = {
  name: "pending",
  version: "1.0.5",
  credits: "Mirai Team",
  hasPermssion: 2,
  role: 2,
  hasPrefix: false,
  description: "Manage bot's waiting messages",
  commandCategory: "system",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;

    var msg = "", index = 1;

    try {
    var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
    var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
  } catch (e) { 
        return api.sendMessage("Cannot get pending list", threadID, messageID); 
    }

  const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

    for (const single of list) {
        msg += `${index++}.  『${single.name} |•| ${single.threadID}』\n`;
    }

    if (list.length != 0) {
        return api.sendMessage(`»「PENDING」«❮ The whole number of threads to approve is: ${list.length} thread(s) ❯\n\n${msg}`, threadID, messageID);
    } else {
        return api.sendMessage("「PENDING」There is no thread in the pending list", threadID, messageID);
    }
};
