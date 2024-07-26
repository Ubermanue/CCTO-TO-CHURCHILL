module.exports.config = {
	name: "x",
	version: "1.0.0",
	role: 0,
	credits: "Your Name", 
	description: "X video search",
	hasPrefix: false,
	aliases: ["x"],
	usage: "[x <query>]",
	cooldown: 10, 
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
	try {
		const searchQuery = args.join(" ");
		if (!searchQuery) {
			api.sendMessage("Usage: x <search text>", event.threadID);
			return;
		}

		api.sendMessage("🔍 | Searching, please wait...", event.threadID);

		const response = await axios.get(`https://joshweb.click/api/xsearch?q=${encodeURIComponent(searchQuery)}`);
		const videos = response.data.result.result;

		if (!videos || videos.length === 0) {
			api.sendMessage("No videos found for the given search query.", event.threadID);
			return;
		}

		let msg = "[XNXX SEARCH]\n\n", count = 0;
		videos.forEach(video => {
			msg += `${++count}. 📝Title: ${video.title}\n🔗Link: ${video.link}\n📜Info: ${video.info}\n\n`;
		});

		msg += "\nReply to this message with the number you selected. NOTE: To avoid errors, please choose only 6-10 minute videos.\n\n[XNXX SEARCH]";
		api.sendMessage(msg, event.threadID, (err, info) => {
			if (err) return;
			global.handle.replies[info.messageID] = {
				cmdname: module.exports.config.name,
				tid: event.threadID,
				mid: event.messageID,
				uid: event.senderID,
				this_mid: info.messageID,
				this_tid: info.threadID,
				step: "search",
			};
			r = videos;
		}, event.messageID);

	} catch (error) {
		console.error('Error:', error);
		api.sendMessage("An error occurred while processing the request.", event.threadID);
	}
};

module.exports.handleReply = async function({ api, event, handleReply }) {
	const replier = handleReply;
	if (!r) {
		api.sendMessage("No results found.", replier.tid, replier.mid);
		return;
	}

	if (replier.step === "search") {
		const num = parseInt(event.body);
		if (isNaN(num) || num < 1 || num > r.length) {
			api.sendMessage("Please provide a valid number.", replier.tid, replier.mid);
			return;
		}

		const result = r[num - 1];
		api.sendMessage("Downloading...", replier.tid, replier.mid);

		const link = result.link;
		const dlResponse = await axios({
			method: 'get',
			url: `https://joshweb.click/api/xdl?q=${encodeURIComponent(link)}`,
			responseType: 'stream'
		});

		const filePath = path.join(__dirname, `/cache/x_video.mp4`);
		const writer = fs.createWriteStream(filePath);
		dlResponse.data.pipe(writer);

		writer.on('finish', () => {
			api.sendMessage(
				{ body: `📹 | Here is your video:\n${result.title}\n${result.info}`, attachment: fs.createReadStream(filePath) },
				replier.tid,
				() => fs.unlinkSync(filePath)
			);
		});

		writer.on('error', (err) => {
			console.error('Error:', err);
			api.sendMessage("An error occurred while downloading the video.", replier.tid, replier.mid);
		});
	}
};
