const axios = require("axios");

module.exports = {
  config: {
    name: "goatmart",
    aliases: ["market"],
    shortDescription: {
      en: "View items available in the goatmart."
    },
    category: "market",
    usage: "ã€– ð—šð—¼ð—®ð˜ð— ð—®ð—¿ð˜ ã€—\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\nðŸ‘‘ Available Choices:\n-> ${event.body} page < page number >\n-> ${event.body} code < item ID >\n-> ${event.body} author < name >\n-> ${event.body} show < item ID >\n-> ${event.body} search < item name >\n-> ${event.body} edit < item ID >\n-> ${event.body} upload < item details in JSON format >",
    version: "10.5",
    role: 0,
    author: "LiANE | ArYAN",
  },
  onStart: async ({ api, event, args, message }) => {
    const serverURL = "https://official-goatmart.onrender.com";

    try {
      if (!args[0]) {
        api.sendMessage(`ã€– ð—šð—¼ð—®ð˜ð— ð—®ð—¿ð˜ ã€—\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\nðŸ‘‘ Available Choices:\n-> ${event.body} page < page number >\n-> ${event.body} author < name >\n-> ${event.body} code < item ID >\n-> ${event.body} show < item ID >\n-> ${event.body} search < item name >\n-> ${event.body} edit < item ID >\n-> ${event.body} upload < item details in JSON format >`, event.threadID, event.messageID);
      } else if (args[0] === "code") {
        const itemID = isNaN(args[1]) ? args[1] : parseInt(args[1]);
        const response = await axios.get(`${serverURL}/api/items/${itemID}`);
        const codeX = await axios.get(response.data.pastebinLink);
        const codeExtracted = codeX.data;

        if (codeExtracted) {
          message.reply(`ã€– ð—šð—¼ð—®ð˜ð— ð—®ð—¿ð˜ ã€—\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\nðŸ‘‘ ð—œð˜ð—²ð—º ð—¡ð—®ð—ºð—²: ${response.data.itemName}\nðŸ†” ð—œð˜ð—²ð—º ð—œð——: ${response.data.itemID}\nâš™ï¸ ð—œð˜ð—²ð—º ð—§ð˜†ð—½ð—²: ${response.data.type || 'Unknown' }\nðŸ’» ð—”ð˜‚ð˜ð—µð—¼ð—¿: ${response.data.authorName}\nðŸ“… ð—”ð—±ð—±ð—²ð—± ð—¼ð—»: ${new Date(response.data.timestamp).toLocaleString()}\nâœ… ð—œð˜ð—²ð—º ð—–ð—¼ð—±ð—²\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n${codeExtracted }`);
        } else {
          api.sendMessage("ã€– ð—šð—¼ð—®ð˜ð— ð—®ð—¿ð˜ ã€—\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\nItem not found.", event.threadID, event.messageID);
        }
      } else if (args[0] === "author") {
        const authorName = args[1];
        const response = await axios.get(`${serverURL}/api/items/author/${authorName}`);
        const authorItems = response.data;

        if (authorItems.length > 0) {
          const itemDescriptions = authorItems.map(
            (item) =>
              `\nðŸ‘‘ ð—œð˜ð—²ð—º ð—¡ð—®ð—ºð—²: ${item.itemName}
ðŸ†” ð—œð˜ð—²ð—º ð—œð—— : ${item.itemID}
âš™ï¸ ð—œð˜ð—²ð—º ð—§ð˜†ð—½ð—²: ${item.type || "Unknown"}
ðŸ“ ð——ð—²ð˜€ð—°ð—¿ð—¶ð—½ð˜ð—¶ð—¼ð—»: ${item.description}
ðŸ“… ð—”ð—±ð—±ð—²ð—± ð—¢ð—»: ${new Date(item.timestamp).toLocaleString()}\n\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
`
          );
          const itemInfo = itemDescriptions.join("\n");

          message.reply(`ã€– ð—šð—¼ð—®ð˜ð— ð—®ð—¿ð˜ ã€—\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n\nð—œð˜ð—²ð—ºð˜€ ð—•ð˜†: ${authorName}\n\n${itemInfo}`);
        } else {
          api.sendMessage(`ã€– ð—šð—¼ð—®ð˜ð— ð—®ð—¿ð˜ ã€—\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n\nNo items found for this author.`, message.threadID);
        }
      } else if (args[0] === "page") {
        const pageNumber = parseInt(args[1]);
        const response = await axios.get(`${serverURL}/api/items`);
        const items = response.data;
        const totalPages = Math.ceil(items.length / 5);
        const offset = (pageNumber - 1) * 5;

        if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
          api.sendMessage("ã€– ð—šð—¼ð—®ð˜ð— ð—®ð—¿ð˜ ã€—\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\nInvalid page number.", event.threadID, event.messageID);
        } else {
          const pageItems = items.slice(offset, offset + 5);

          const itemDescriptions = pageItems.map(
            (item) =>
              `ðŸ‘‘ ð—œð˜ð—²ð—º ð—¡ð—®ð—ºð—²: ${item.itemName}\nðŸ†” ð—œð˜ð—²ð—º ð—œð——: ${item.itemID}\nâš™ï¸ ð—œð˜ð—²ð—º ð—§ð˜†ð—½ð—²: ${item.type || "Unknown"}\nðŸ“ ð——ð—²ð˜€ð—°ð—¿ð—¶ð—½ð˜ð—¶ð—¼ð—»: ${item.description}\nðŸ’» ð—”ð˜‚ð˜ð—µð—¼ð—¿: ${item.authorName}\nðŸ“… ð—”ð—±ð—±ð—²ð—± ð—¢ð—»: ${new Date(item.timestamp).toLocaleString()}\n\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n`
          );

          const itemInfo = itemDescriptions.join("\n");

          message.reply(`ã€– ð—šð—¼ð—®ð˜ð— ð—®ð—¿ð˜ ã€—\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\nItems available in the market:\n\n${itemInfo}ðŸ“ ð—¨ð˜€ð—² ${event.body.split(" ")[0]} [ show | code ] <item id> to view pastebin link or code.\n\nðŸ‘‘ ð—£ð—®ð—´ð—²ð˜€: [ ${pageNumber} / ${totalPages} ]`);
        }
      } else if (args[0] === "show") {
        const itemID = isNaN(args[1]) ? args[1] : parseInt(args[1]); 
        const response = await axios.get(`${serverURL}/api/items/${itemID}`);
        const item = response.data;

        if (item && itemID) {
          message.reply(`ã€– ð—šð—¼ð—®ð˜ð— ð—®ð—¿ð˜ ã€—\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\nðŸ‘‘ ð—œð˜ð—²ð—º ð—¡ð—®ð—ºð—²: ${item.itemName}\nðŸ†” ð—œð˜ð—²ð—º ð—œð——: ${item.itemID}\nðŸ“ ð——ð—²ð˜€ð—°ð—¿ð—¶ð—½ð˜ð—¶ð—¼ð—»: ${item.description}\nðŸ–‡ï¸ ð—œð˜ð—²ð—º ð—Ÿð—¶ð—»ð—¸: ${item.pastebinLink}`);
        } else {
          api.sendMessage("ã€– ð—šð—¼ð—®ð˜ð— ð—®ð—¿ð˜ ã€—\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\nItem not found.", event.threadID, event.messageID);
        }
      } else if (args[0] === "search") {
        const searchTerm = args.slice(1).join(" ").toLowerCase();
        const response = await axios.get(`${serverURL}/api/items`);
        const items = response.data;
        const matchingItems = items.filter(item => item.itemName.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm));

        if (matchingItems.length > 0) {
          const itemDescriptions = matchingItems.map(item => `\nðŸ‘‘ ð—œð˜ð—²ð—º ð—¡ð—®ð—ºð—²: ${item.itemName}\nðŸ†” ð—œð˜ð—²ð—º ð—œð——: ${item.itemID}\nâš™ï¸ ð—œð˜ð—²ð—º ð—§ð˜†ð—½ð—²: ${item.type || "Unknown"}\nðŸ“ ð——ð—²ð˜€ð—°ð—¿ð—¶ð—½ð˜ð—¶ð—¼ð—»: ${item.description}\nðŸ’» ð—”ð˜‚ð˜ð—µð—¼ð—¿: ${item.authorName}\nðŸ“… ð—”ð—±ð—±ð—²ð—± ð—¢ð—»: ${new Date(item.timestamp).toLocaleString()}\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n`);
          const itemInfo = itemDescriptions.join("\n");

          message.reply(`ã€– ð—šð—¼ð—®ð˜ð— ð—®ð—¿ð˜ ã€—\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n\nâœ… Search Results for ${searchTerm}\n\n${itemInfo}`);
        } else {
          api.sendMessage("ã€– ð—šð—¼ð—®ð˜ð— ð—®ð—¿ð˜ ã€—\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n\nNo items found matching the search term.", event.threadID, event.messageID);
        }
      } else if (args[0] === "edit") {
        const itemID = isNaN(args[1]) ? args[1] : parseInt(args[1]); 
        const newItemDetails = JSON.parse(args.slice(2).join(" "));
        const response = await axios.put(`${serverURL}/api/items/${itemID}`, newItemDetails);
        message.reply(`ã€– ð—šð—¼ð—®ð˜ð— ð—®ð—¿ð˜ ã€—\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n\nâœ… Item edited successfully\nðŸ‘‘ ð—œð˜ð—²ð—º ð—¡ð—®ð—ºð—²: ${response.data.itemName}\nðŸ†” ð—œð˜ð—²ð—º ð—œð——: ${response.data.itemID}`);
      } else if (args[0] === "upload") {
        const itemDetails = JSON.parse(args.slice(1).join(" "));
        const response = await axios.post(`${serverURL}/api/items`, itemDetails);
        message.reply(`ã€– ð—šð—¼ð—®ð˜ð— ð—®ð—¿ð˜ ã€—\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n\nâœ… Item uploaded successfully\nðŸ‘‘ ð—œð˜ð—²ð—º ð—¡ð—®ð—ºð—²: ${response.data.itemName}\nðŸ†” ð—œð˜ð—²ð—º ð—œð——: ${response.data.itemID}\nâš™ï¸ ð—œð˜ð—²ð—º ð—§ð˜†ð—½ð—²: ${response.data.type || "Unknown"}`);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      api.sendMessage("âŒ Invalid Item ID or JSON format: " + error.message, event.threadID);
    }
  },
};
