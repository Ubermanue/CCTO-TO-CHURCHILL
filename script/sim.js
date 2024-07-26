const axios = require("axios");

module.exports.config = {
    name: "sim",
    version: "1.0.0",
    role: 0,
    credits: "chill",
    description: "Interact with SimSimi",
    hasPrefix: false,
    aliases: ["sim"],
    usage: "[sim <question>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    try {
        const query = args.join(" ");
        
        if (!query) {
            return api.sendMessage("format: sim niggakaba?.", event.threadID);
        }

        const apiUrl = `https://markdevs-last-api-2epw.onrender.com/sim?q=${encodeURIComponent(query)}`;

        const response = await axios.get(apiUrl);
        const answer = response.data.answer;

        api.sendMessage(answer, event.threadID);
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};
