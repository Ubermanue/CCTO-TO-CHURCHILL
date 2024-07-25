const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "cdp",
    version: "1.0.0",
    role: 0,
    credits: "chill",
    description: "Send a cdpimg",
    hasPrefix: false,
    aliases: ["cdp", "randimg"],
    usage: "[cdp]",
    cooldown: 5
};

module.exports.run = async function({ api, event }) {
    try {
        const apiUrl = 'https://joshweb.click/cdp';
        api.sendMessage("𝚂𝙴𝙽𝙳𝙸𝙽𝙶 𝙲𝙾𝚄𝙿𝙻𝙴 𝙳𝙿...", event.threadID);

        const response = await axios.get(apiUrl);
        const imageUrls = response.data.result;
        
        const imageUrl = Math.random() < 0.5 ? imageUrls.one : imageUrls.two;

        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imagePath = path.join(__dirname, "randomImage.jpeg");

        fs.writeFileSync(imagePath, imageResponse.data);

        api.sendMessage({
            body: "Here's a random cdp for u guys!",
            attachment: fs.createReadStream(imagePath)
        }, event.threadID, () => {
            fs.unlinkSync(imagePath);
        });
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while fetching the image.", event.threadID);
    }
};
