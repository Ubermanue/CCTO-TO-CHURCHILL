module.exports.config = {
    name: "ytsearch",
    version: "1.0.0",
    role: 0,
    credits: "churchill",
    description: "Search YouTube videos",
    hasPrefix: false,
    aliases: ["yt"],
    usage: "[Ytsearch <search>]",
    cooldown: 5,
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const searchQuery = args.join(" ");
        if (!searchQuery) {
            api.sendMessage("Usage: ytsearch <search text>", event.threadID);
            return;
        }

        api.sendMessage("🔍 | Searching, please wait...", event.threadID);

        // Make an HTTP request
        const response = await axios.get(`https://hiroshi-rest-api.replit.app/search/youtube?q=${encodeURIComponent(searchQuery)}`);

        const videos = response.data.results;

        if (!videos || videos.length === 0) {
            api.sendMessage("No videos found for the given search query.", event.threadID);
            return;
        }

        const videoData = videos[0];
        const videoUrl = videoData.link;

        // Download the video
        const videoResponse = await axios({
            method: 'get',
            url: videoUrl,
            responseType: 'stream'
        });

        const filePath = path.join(__dirname, `/cache/youtube_video.mp4`);
        const writer = fs.createWriteStream(filePath);

        videoResponse.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: `🎥 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐑𝐞𝐬𝐮𝐥𝐭 🎥\n\n𝐓𝐢𝐭𝐥𝐞: ${videoData.title}\n𝐔𝐩𝐥𝐨𝐚𝐝𝐞𝐝 𝐛𝐲: ${videoData.author.name}\n𝐂𝐡𝐚𝐧𝐧𝐞𝐥: ${videoData.author.channel}\n𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${videoData.duration}\n𝐕𝐢𝐞𝐰𝐬: ${videoData.views}\n\n𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧: ${videoData.description}`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => {
                fs.unlinkSync(filePath); 
            });
        });

        writer.on('error', (err) => {
            console.error('Download error:', err);
            api.sendMessage("An error occurred while downloading the video.", event.threadID);
        });

    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};
