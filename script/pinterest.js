const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin"],
    version: "1.0",
    author: "ArYAN",
    role: 0,
    countDown: 20,
    longDescription: {
      en: "This command allows you to search for images on Pinterest based on a given query and fetch a specified number of images."
    },
    category: "media",
    guide: {
      en: "{p}pinterest < search query > < number of images >"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      // Join the arguments to form the search query string
      const keySearch = args.join(" ");
      
      // Validate the search query format
      if (!keySearch.includes("-")) {
        return api.sendMessage(
          "â›” ð—œð—»ð˜ƒð—®ð—¹ð—¶ð—± ð—¨ð˜€ð—²\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n\nPlease enter the search query and number of images (1-99). Example: tomozaki -5",
          event.threadID,
          event.messageID
        );
      }

      // Extract the search term and the number of images
      const keySearchs = keySearch.substr(0, keySearch.indexOf('-')).trim();
      let numberSearch = parseInt(keySearch.split("-").pop().trim()) || 99;

      // Validate the number of images
      if (isNaN(numberSearch) || numberSearch < 1 || numberSearch > 99) {
        return api.sendMessage(
          "â›” ð—œð—»ð˜ƒð—®ð—¹ð—¶ð—± ð—¡ð˜‚ð—ºð—¯ð—²ð—¿\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n\nPlease enter a valid number of images (1-99). Example: tomozaki -5",
          event.threadID,
          event.messageID
        );
      }

      // Construct the API URL for fetching images
      const apiUrl = `https://itsaryan.onrender.com/api/pinterest?query=${encodeURIComponent(keySearchs)}&limits=${numberSearch}`;
      console.log(`Fetching data from API: ${apiUrl}`);
      
      // Fetch data from the API
      const res = await axios.get(apiUrl);
      const data = res.data;

      // Check if any data is returned
      if (!data || data.length === 0) {
        return api.sendMessage(
          `No results found for your query "${keySearchs}". Please try with a different query.`,
          event.threadID,
          event.messageID
        );
      }

      const imgData = [];
      
      // Fetch each image and save it to the cache directory
      for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
        console.log(`Fetching image ${i + 1} from URL: ${data[i]}`);
        const imgResponse = await axios.get(data[i], { responseType: "arraybuffer" });
        const imgPath = path.join(__dirname, "cache", `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
      }

      // Send the images as an attachment in the message
      await api.sendMessage({
        body: `ðŸ“¸ ð—£ð—¶ð—»ð˜ð—²ð—¿ð—²ð˜€ð˜\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n\nHere are the top ${numberSearch} results for your query "${keySearchs}"`,
        attachment: imgData,
      }, event.threadID, event.messageID);

      console.log(`Images successfully sent to thread ${event.threadID}`);
      
      // Clean up the cache directory
      await fs.remove(path.join(__dirname, "cache"));
      console.log("Cache directory cleaned up.");
      
    } catch (error) {
      // Log the error and inform the user
      console.error("Error fetching images from Pinterest:", error);
      return api.sendMessage(
        "An error occurred while fetching images. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
