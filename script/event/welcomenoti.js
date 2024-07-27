const axios = require('axios');
const fs = require('fs');

module.exports.config = {
    name: "welcomenoti",
    version: "1.0.0",
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType === "log:subscribe") {
        const addedParticipants = event.logMessageData.addedParticipants;
        const senderID = addedParticipants[0].userFbId;
        let name = await api.getUserInfo(senderID).then(info => info[senderID].name);

        // Truncate name if it's too long
        const maxLength = 15;
        if (name.length > maxLength) {
            name = name.substring(0, maxLength - 3) + '...';
        }

        // Fetching the group photo URL and thread name
        const groupInfo = await api.getThreadInfo(event.threadID);
        const groupIcon = groupInfo.imageSrc || "https://i.ibb.co/G5mJZxs/rin.jpg"; // Fallback image URL if group has no photo
        const memberCount = groupInfo.participantIDs.length;
        const groupName = groupInfo.threadName || "this group"; // Ensure a fallback value

        const background = groupInfo.imageSrc || "https://i.ibb.co/4YBNyvP/images-76.jpg"; // Use group image if available, otherwise default background

        const url = `https://joshweb.click/canvas/welcome?name=${encodeURIComponent(name)}&groupname=${encodeURIComponent(groupName)}&groupicon=${encodeURIComponent(groupIcon)}&member=${memberCount}&uid=${senderID}&background=${encodeURIComponent(background)}`;

        try {
            const { data } = await axios.get(url, { responseType: 'arraybuffer' });
            const filePath = './script/cache/welcome_image.jpg';
            fs.writeFileSync(filePath, Buffer.from(data));

            api.sendMessage({
                body: `Everyone welcome the new member ${name} to ${groupName}!\n\n**𝙶𝚁𝙾𝚄𝙿 𝙲𝙷𝙰𝚃 𝚁𝚄𝙻𝙴𝚂**\n\n1. Respect Each Other\n* Treat others with kindness, respect, and understanding.\n* No personal attacks, insults, or harassment will be tolerated.\n\n2. Stay On Topic\n* Keep conversations relevant to the group's purpose or topic.\n* Avoid spamming or posting unrelated content.\n\n3. No Self-Promotion\n* Refrain from promoting personal businesses, products, or services without permission from the group admin.\n* This is a social group, not a marketing platform.\n\n4. Keep it Family-Friendly\n* Avoid sharing explicit, offensive, or inappropriate content.\n* Keep the conversation PG-13 and respectful of all members.\n\n5. No Drama or Gossip\n* Refrain from spreading rumors, gossip, or drama.\n* Focus on positive and uplifting conversations.\n\n6. Be Mindful of Language\n* Avoid using profanity, hate speech, or discriminatory language.\n* Be respectful of cultural and linguistic differences.\n\n7. Respect Privacy\n* Do not share personal information or photos without permission.\n* Keep confidential matters confidential.\n\n8. No Spam or Scams\n* Do not share suspicious links, phishing scams, or spam messages.\n* Be cautious when clicking on links or downloading attachments.\n\n9. Admin Decisions are Final\n* The group admin reserves the right to remove or edit posts, as well as remove members who violate these rules.\n* Admin decisions are final and binding.\n\n10. Have Fun!\n* This group is meant to be a positive and enjoyable space for all members.\n* Let's keep the conversation light-hearted and fun!\n\nConsequences of Not Following the Rules\n\n* First-time offenders will receive a warning from the group admin.\n* Repeat offenders may be removed from the group.\n\nBy following these rules, we can ensure a positive and respectful environment for all members. Let's work together to make this group chat a great place to connect and socialize!`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath));
        } catch (error) {
            console.error("Error fetching welcome image:", error);

            // Fallback message if fetching the image fails
            api.sendMessage({
                body: `Everyone welcome the new member ${name} to ${groupName}!\n\n**𝙶𝚁𝙾𝚄𝙿 𝙲𝙷𝙰𝚃 𝚁𝚄𝙻𝙴𝚂**\n\n1. Respect Each Other\n* Treat others with kindness, respect, and understanding.\n* No personal attacks, insults, or harassment will be tolerated.\n\n2. Stay On Topic\n* Keep conversations relevant to the group's purpose or topic.\n* Avoid spamming or posting unrelated content.\n\n3. No Self-Promotion\n* Refrain from promoting personal businesses, products, or services without permission from the group admin.\n* This is a social group, not a marketing platform.\n\n4. Keep it Family-Friendly\n* Avoid sharing explicit, offensive, or inappropriate content.\n* Keep the conversation PG-13 and respectful of all members.\n\n5. No Drama or Gossip\n* Refrain from spreading rumors, gossip, or drama.\n* Focus on positive and uplifting conversations.\n\n6. Be Mindful of Language\n* Avoid using profanity, hate speech, or discriminatory language.\n* Be respectful of cultural and linguistic differences.\n\n7. Respect Privacy\n* Do not share personal information or photos without permission.\n* Keep confidential matters confidential.\n\n8. No Spam or Scams\n* Do not share suspicious links, phishing scams, or spam messages.\n* Be cautious when clicking on links or downloading attachments.\n\n9. Admin Decisions are Final\n* The group admin reserves the right to remove or edit posts, as well as remove members who violate these rules.\n* Admin decisions are final and binding.\n\n10. Have Fun!\n* This group is meant to be a positive and enjoyable space for all members.\n* Let's keep the conversation light-hearted and fun!\n\nConsequences of Not Following the Rules\n\n* First-time offenders will receive a warning from the group admin.\n* Repeat offenders may be removed from the group.\n\nBy following these rules, we can ensure a positive and respectful environment for all members. Let's work together to make this group chat a great place to connect and socialize!`
            }, event.threadID);
        }
    }
};
