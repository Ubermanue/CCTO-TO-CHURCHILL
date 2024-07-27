const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "x",
    version: "1.0.0",
    role: 0,
    credits: "chilli",
    description: "Search and download a video",
    hasPrefix: true,
    aliases: ["x"],
    usage: "[x <query>]",
    cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
    try {
        if (args.length === 0) {
            api.sendMessage("Please provide a search query: ex: x Lexi Lore", event.threadID);
            return;
        }

        const query = args.join("%20");
        const searchUrl = `https://joshweb.click/api/xsearch?q=${query}`;
        const searchResponse = await axios.get(searchUrl);

        const videos = searchResponse.data.result.result;
        const filteredVideos = videos.filter(video => {
            const info = video.info.match(/\d+min/);
            if (info) {
                const duration = parseInt(info[0]);
                return duration >= 6 && duration <= 10;
            }
            return false;
        });

        if (filteredVideos.length === 0) {
            api.sendMessage("No videos found with the specified length.", event.threadID);
            return;
        }

        const video = filteredVideos[0];
        const downloadUrl = `https://joshweb.click/api/xdl?q=${encodeURIComponent(video.link)}`;
        const downloadResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        
        const filePath = path.join(__dirname, 'video.mp4');
        fs.writeFileSync(filePath, downloadResponse.data);

        api.sendMessage({
            attachment: fs.createReadStream(filePath)
        }, event.threadID, () => {
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};
