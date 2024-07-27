module.exports.config = {
    name: "bot",
    version: "1.0.0",
    role: 0,
    credits: "chiie",
    description: "Simulated conversation",
    hasPrefix: false,
    aliases: [],
    usage: "[bot <query>]",
    cooldown: 5,
};

const axios = require("axios");

module.exports.run = async function({ api, event, args }) {
    try {
        const query = args.join(" ");
        if (!query) {
            api.sendMessage("Usage: bot <query>", event.threadID);
            return;
        }

        const response = await axios.get(`https://markdevs-last-api-2epw.onrender.com/sim?q=${encodeURIComponent(query)}`);

        const simResponse = response.data.response;

        if (!simResponse) {
            api.sendMessage("No response found for the given query.", event.threadID);
            return;
        }

        api.sendMessage(simResponse, event.threadID);
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};
