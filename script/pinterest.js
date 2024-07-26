const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'pinterest',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: ['pin'],
    description: "Fetch images from Pinterest",
    usage: "pinterest <image> - <count>",
    credits: 'chill',
};

module.exports.run = async function ({ api, event, args }) {
    const input = args.join(' ').split(' - ');
    const searchQuery = input[0];
    const count = input[1] ? Math.min(parseInt(input[1]), 10) : 10; // Default count is 10, max is 10

    if (!searchQuery) {
        return api.sendMessage('Please provide a search query. ex: pin cat - 5', event.threadID, event.messageID);
    }

    const apiUrl = `https://hiroshi-rest-api.replit.app/search/pinterest?search=${encodeURIComponent(searchQuery)}&limit=${count}`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data.count > 0) {
            const imagePaths = await Promise.all(data.data.map(async (url, index) => {
                const imagePath = path.resolve(__dirname, `temp_image_${index}.jpg`);
                const writer = fs.createWriteStream(imagePath);

                const imageResponse = await axios({
                    url,
                    method: 'GET',
                    responseType: 'stream'
                });

                imageResponse.data.pipe(writer);

                return new Promise((resolve, reject) => {
                    writer.on('finish', () => resolve(imagePath));
                    writer.on('error', reject);
                });
            }));

            const attachments = imagePaths.map(imagePath => ({
                attachment: fs.createReadStream(imagePath),
                name: path.basename(imagePath)
            }));

            await api.sendMessage({
                body: `Here are your ${searchQuery} images:`,
                attachment: attachments
            }, event.threadID, () => {
                // Clean up: delete downloaded images
                imagePaths.forEach(imagePath => fs.unlinkSync(imagePath));
            });
        } else {
            api.sendMessage('No results found.', event.threadID, event.messageID);
        }
    } catch (error) {
        console.error(error);
        api.sendMessage('An error occurred while fetching Pinterest data.', event.threadID, event.messageID);
    }
};
