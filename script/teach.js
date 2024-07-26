const axios = require("axios");

module.exports.config = {
    name: "teach",
    version: "1.0.0",
    role: 0,
    credits: "chill",
    description: "Teach SimSimi a new response",
    hasPrefix: false,
    aliases: ["teach"],
    usage: "[teach question | response]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    try {
        const input = args.join(" ");
        const [question, response] = input.split(" | ");

        if (!question || !response) {
            return api.sendMessage("Please provide both a question and a response in the format: teach question | response", event.threadID);
        }

        const apiUrl = `https://markdevs-last-api-2epw.onrender.com/teach?q=${encodeURIComponent(question)}&r=${encodeURIComponent(response)}`;

        const apiResponse = await axios.get(apiUrl);
        const message = apiResponse.data.message;

        api.sendMessage(message, event.threadID);
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};
