module.exports.config = {
    name: "xvideos",
    version: "1.0.0",
    role: 0,
    credits: "chill",
    description: "Search xx",
    hasPrefix: false,
    aliases: ["xvid"],
    usage: "[Xvideos <search>]",
    cooldown: 5,
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const searchQuery = args.join(" ");
        if (!searchQuery) {
            api.sendMessage("Usage: xvideos <search text>", event.threadID);
            return;
        }

        api.sendMessage("🔍 | Searching, please wait...", event.threadID);

        // Search for the video using the provided API
        const searchResponse = await axios.get(`https://hiroshi-rest-api.replit.app/search/xvideos?q=${encodeURIComponent(searchQuery)}`);

        const videos = searchResponse.data.result;

        if (!videos || videos.length === 0) {
            api.sendMessage("No videos found for the given search query.", event.threadID);
            return;
        }

        const videoData = videos[0];
        const videoUrl = videoData.video;

        // Download the video using the second API
        const downloadResponse = await axios.get(`https://markdevs-last-api-2epw.onrender.com/xnxx/download?url=${encodeURIComponent(videoUrl)}`);
        const downloadUrl = downloadResponse.data.download_url;

        // Download the video file
        const videoResponse = await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream'
        });

        const filePath = path.join(__dirname, `/cache/xvideos_video.mp4`);
        const writer = fs.createWriteStream(filePath);

        videoResponse.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: `🎥 𝐗𝐯𝐢𝐝𝐞𝐨𝐬 𝐑𝐞𝐬𝐮𝐥𝐭 🎥\n\n𝐓𝐢𝐭𝐥𝐞: ${videoData.title}\n𝐔𝐩𝐥𝐨𝐚𝐝𝐞𝐝 𝐛𝐲: ${videoData.uploaderName}\n\n𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${videoData.duration}\n\n𝐓𝐡𝐮𝐦𝐛𝐧𝐚𝐢𝐥: ${videoData.thumbnail}`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => {
                fs.unlinkSync(filePath); // Delete the video file after sending
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
