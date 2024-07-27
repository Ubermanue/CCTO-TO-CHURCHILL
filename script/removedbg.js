const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "removebg",
    version: "1.0.0",
    role: 0,
    credits: "chilli",
    description: "Remove background from an image",
    hasPrefix: true,
    aliases: ["removebg"],
    usage: "[removebg]",
    cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
    try {
        const attachment = event.attachments[0];
        if (!attachment || attachment.type !== 'photo') {
            api.sendMessage("Please reply this to the image -removedbg-.", event.threadID);
            return;
        }

        const imageUrl = attachment.url;
        const apiUrl = `https://markdevs-last-api-2epw.onrender.com/api/removebg?imageUrl=${encodeURIComponent(imageUrl)}`;

        api.sendMessage("Removing background, please wait...", event.threadID);

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        const outputPath = path.join(__dirname, 'removedbg.png');
        fs.writeFileSync(outputPath, response.data);

        api.sendMessage({
            body: "Background removed successfully.",
            attachment: fs.createReadStream(outputPath)
        }, event.threadID, () => {
            fs.unlinkSync(outputPath); // Delete the file after sending it
        });
    } catch (error) {
        console.error(error);
        api.sendMessage("Failed to remove background from the image. Please try again.", event.threadID);
    }
};
