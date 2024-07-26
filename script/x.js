module.exports.config = {
	name: "x",
	version: "1.0.0",
	role: 0,
	credits: "Churchill", 
	description: "X video search",
	hasPrefix: false,
	aliases: ["x"],
	usage: "[x <query>]",
	cooldown: 5, 
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
	try {
		const searchQuery = args.join(" ");
		if (!searchQuery) {
			api.sendMessage("Usage: xsearch <search text>", event.threadID);
			return;
		}

		api.sendMessage("😏 | Searching, please wait...", event.threadID);

		const response = await axios.get(`https://joshweb.click/api/xsearch?q=${encodeURIComponent(searchQuery)}`);
		const videos = response.data.result.result;

		if (!videos || videos.length === 0) {
			api.sendMessage("No videos found for the given search query.", event.threadID);
			return;
		}

		const videoData = videos[0];
		const videoUrl = videoData.link;
		const title = videoData.title;
		const info = videoData.info;

		api.sendMessage(`📹 | Found video: ${title}\n${info}\n\nDownloading, please wait...`, event.threadID);

		const dlResponse = await axios({
			method: 'get',
			url: `https://joshweb.click/api/xdl?q=${encodeURIComponent(videoUrl)}`,
			responseType: 'stream'
		});

		const filePath = path.join(__dirname, `/cache/x_video.mp4`);
		const writer = fs.createWriteStream(filePath);
		dlResponse.data.pipe(writer);

		writer.on('finish', () => {
			api.sendMessage(
				{ body: `📹 | Here is your video:\n${title}\n${info}`, attachment: fs.createReadStream(filePath) },
				event.threadID,
				() => fs.unlinkSync(filePath)
			);
		});

		writer.on('error', (err) => {
			console.error('Error:', err);
			api.sendMessage("An error occurred while downloading the video.", event.threadID);
		});

	} catch (error) {
		console.error('Error:', error);
		api.sendMessage("An error occurred while processing the request.", event.threadID);
	}
};
