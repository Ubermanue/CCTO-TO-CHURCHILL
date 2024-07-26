module.exports.config = {
	name: "google",
	version: "1.0.0",
	role: 0,
	credits: "Your Name", 
	description: "Google search using custom API",
	hasPrefix: true,
	aliases: ["g"],
	usage: "[google <query>]",
	cooldown: 10, 
};

const axios = require("axios");

module.exports.run = async function({ api, event, args }) {
	const searchQuery = args.join(" ");
	const senderID = event.senderID;  
	const userProfile = await api.getUserInfo(senderID);
	const userName = userProfile[senderID].name;

	if (!searchQuery) {
		api.sendMessage("Usage: google urquestion", event.threadID);
		return;
	}

	api.sendMessage(`🔍 | ${userName} is asking: ${searchQuery}\n\n⏳ Generating answer... 0%`, event.threadID, (err, info) => {
		if (err) return;

		const messageID = info.messageID;

		// Simulating a progress bar
		let progress = 0;
		const progressBar = setInterval(() => {
			progress += 20;
			api.editMessage(`🔍 | ${userName} is asking: ${searchQuery}\n\n⏳ Generating answer... ${progress}%`, event.threadID, messageID);
			if (progress >= 100) clearInterval(progressBar);
		}, 1000);

		axios.get(`https://joshweb.click/api/palm2?q=${encodeURIComponent(searchQuery)}`)
			.then(response => {
				clearInterval(progressBar); // Stop progress bar
				const apiResponse = response.data.result;

				// Final formatted message
				const newMessage = `🕳  𝙶𝙾𝙾𝙶𝙻𝙴  𝙰𝙸\n━━━━━━━━━━━━━━━━━━\n${apiResponse}\n━━━━━━━━━━━━━━━━━━\n🗣 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${userName}`;

				api.editMessage(newMessage, event.threadID, messageID);
			})
			.catch(error => {
				clearInterval(progressBar); // Stop progress bar
				console.error('Error:', error);
				api.editMessage("An error occurred while processing the request.", event.threadID, messageID);
			});
	});
};
