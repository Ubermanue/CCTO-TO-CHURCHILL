const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
	name: "war",
	version: "1.0.0",
	role: 0,
	credits: "cliff",
	description: "War in the chat box",
	hasPrefix: false,
	usages: "war start",
	cooldown: 10,
};

let isWarModeActive = false;
let messageTimeouts = [];
let autoDeactivateTimeout;

function clearMessageTimeouts() {
	messageTimeouts.forEach(timeout => clearTimeout(timeout));
	messageTimeouts = [];
}

function startWar(api, event) {
	const messages = [
                "Bat love?",
		"i love youuuuuuuuuuu",
		"my honey bunche sugar plum ",
		"Cute ng baby ko pakiss nga",
		"tara sex love",
		"tamo pag ako na matay 🙁",
		"eat na love magagalit ako pag d ka mag eat",
		"i like you alot love",
		"ganda mo naman love",
		"jakolan moko love",
		"gabi napala, ilove you baby",
		"missyoubaby",
		"iloveyou alot love",
		"love tirahin na kita",
		"pa kiss ng tt ko love",
		"manyak ako right now love",
		"love pink bayan",
		"gagi miss nanaman kita",
		"i hug kita halika dito",
		"love cuddle tayo",
		"hehe your cute",
		"please don't be angry po i eat your lunch I'm sorry 🙁",
		"love miss na kita balik kana",
		"halika dito k ba baby kita loveyou",
		"please i baby mo ako",
		"Loveeee youuuuu pooo",
		"inaway ka love halika d natin sila bati ",
		"stop crying na I'm sorry",
		"Sleep na baby",
		"treat ko baby, ano gusto mo?",
		"baby bye"
	];
	
	messages.forEach((msg, index) => {
		const timeout = setTimeout(() => {
			if (isWarModeActive) {
				api.sendMessage(msg, event.threadID);
			}
		}, index * 5000);
		messageTimeouts.push(timeout);
	});

	// Automatically deactivate war mode after 5 minutes (300000 milliseconds)
	autoDeactivateTimeout = setTimeout(() => {
		if (isWarModeActive) {
			isWarModeActive = false;
			clearMessageTimeouts();
			api.sendMessage("War mode automatically deactivated after 5 minutes.", event.threadID);
		}
	}, 300000);
}

module.exports.run = async function({ api, args, event, admin }) {
	if (args.length === 0) {
		api.sendMessage("Type 'war on' to activate war mode or 'war off' to deactivate war mode.", event.threadID);
		return;
	}
	
	const command = args[0].toLowerCase();
	
	if (command === "on") {
		if (isWarModeActive) {
			api.sendMessage("War is already active!", event.threadID);
		} else {
			isWarModeActive = true;
			api.sendMessage("War mode activated!", event.threadID);
			startWar(api, event);
		}
	} else if (command === "off") {
		if (isWarModeActive) {
			isWarModeActive = false;
			clearTimeout(autoDeactivateTimeout);
			clearMessageTimeouts();
			api.sendMessage("War mode deactivated!", event.threadID);
		} else {
			api.sendMessage("War mode is not active!", event.threadID);
		}
	} else {
		api.sendMessage("Invalid command! Use 'war on' to start and 'war off' to stop.", event.threadID);
	}
};
