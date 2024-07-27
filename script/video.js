const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "video",
    version: "1.0.0",
    role: 0,
    credits: "chill",
    description: "dailymotioon vid",
    hasPrefix: false,
    aliases: ["dm"],
    usage: "[dm <query>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    try {
        const query = args.join(" ");
        if (!query) {
            return api.sendMessage("Please provide a search query.", event.threadID);
        }

        const apiUrl = `https://nash-rest-api.vercel.app/dailymotion-video?query=${encodeURIComponent(query)}`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.list && response.data.list.length > 0) {
            const firstVideo = response.data.list[0];
            const videoTitle = firstVideo.title;
            const videoUrl = firstVideo.url;

            api.sendMessage("Sending video... please wait...", event.threadID);

            // Download the video
            const videoPath = path.join(__dirname, "video.mp4");
            const videoResponse = await axios({
                method: "get",
                url: videoUrl,
                responseType: "stream"
            });

            const writer = fs.createWriteStream(videoPath);
            videoResponse.data.pipe(writer);

            writer.on('finish', () => {
                api.sendMessage({
                    body: `Here's ur dailymotionvid "${query}": ${videoTitle}`,
                    attachment: fs.createReadStream(videoPath)
                }, event.threadID, () => {
                    fs.unlinkSync(videoPath); // Delete the video file after sending
                });
            });

            writer.on('error', (err) => {
                console.error('Error writing video file:', err);
                api.sendMessage("An error occurred while processing the video.", event.threadID);
            });

        } else {
            api.sendMessage("No videos found for your query.", event.threadID);
        }
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};
