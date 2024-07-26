// Define the module configuration
module.exports.config = {
    name: "pinterest",
    version: "1.0.0",
    role: 0,
    credits: "chill",
    description: "Search and return images from Pinterest",
    hasPrefix: false,
    aliases: ["pinterest"],
    usage: "[pinterest <query> - <number of images (1-10)>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        // Extract search term and number of images
        const input = args.join(" ");
        const [searchTerm, numImagesStr] = input.split(" - ");
        const numImages = parseInt(numImagesStr, 10);

        // Validate input
        if (!searchTerm || isNaN(numImages) || numImages < 1 || numImages > 10) {
            return api.sendMessage(" format: pinterest query - number of images 1to10 only", event.threadID);
        }

        // Query the Pinterest search API
        const apiUrl = `https://hiroshi-rest-api.replit.app/search/pinterest?search=${encodeURIComponent(searchTerm)}`;
        const response = await axios.get(apiUrl);

        // Validate API response
        if (response.data.count === 0) {
            return api.sendMessage("No results found for the given search term.", event.threadID);
        }

        // Get the image URLs from the response
        const imageUrls = response.data.data.slice(0, numImages);
        const attachments = [];

        for (let i = 0; i < imageUrls.length; i++) {
            const imageUrl = imageUrls[i];
            const imagePath = path.join(__dirname, `pinterestImage${i}.jpg`);

            // Download the image
            const imageResponse = await axios({
                url: imageUrl,
                method: 'GET',
                responseType: 'stream'
            });

            const writer = fs.createWriteStream(imagePath);
            imageResponse.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    attachments.push(fs.createReadStream(imagePath));
                    resolve();
                });

                writer.on('error', (err) => {
                    console.error('Stream writer error:', err);
                    api.sendMessage("An error occurred while processing the request.", event.threadID);
                    reject(err);
                });
            });
        }

        // Send the images to the user
        api.sendMessage({
            body: `Here are ${attachments.length} images from Pinterest for your search term "${searchTerm}":`,
            attachment: attachments
        }, event.threadID, () => {
            // Clean up temporary files
            attachments.forEach((_, index) => {
                fs.unlinkSync(path.join(__dirname, `pinterestImage${index}.jpg`));
            });
        });
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};
