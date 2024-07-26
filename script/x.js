const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'x',
  version: '1.0.0',
  role: 0,
  credits: 'deku convert by chilli',
  description: 'X',
  hasPrefix: true,
  aliases: ['x'],
  usage: 'x [search]',
  cooldown: 5,
};

let r;

module.exports.run = async function({ api, event, args }) {
  try {
    function remove(url) {
      return url.replace(/\./g, '(.)');
    }
    const q = args.join(' ');
    if (!q) return api.sendMessage('Please enter a search query.', event.threadID, event.messageID);

    api.sendMessage('Searching...', event.threadID, async function (err, info) {
      if (err) return;

      const res = (await axios.get(`https://joshweb.click/api/xsearch?q=${encodeURIComponent(q)}`)).data;
      const data = res.result.result;
      r = data;
      let msg = '[ XNXX SEARCH ]\n\n',
          count = 0;

      for (let i = 0; i < data.length; i++) {
        let links = remove(data[i].link);
        msg += `${(count += 1)}. 📝Title: ${data[i].title}\n\n🔗Link: ${links}\n\n📜Info: ${data[i].info}\n\n`;
      }

      msg += '\nReply to this message with number you selected.\nNOTE: To avoid error, please choose only 6-10 minutes videos.\n\n[ XNXX SEARCH ]';
      api.sendMessage(msg, event.threadID, event.messageID);

      global.handle.replies[info.messageID] = {
        cmdname: module.exports.config.name,
        tid: event.threadID,
        mid: event.messageID,
        uid: event.senderID,
        this_mid: info.messageID,
        this_tid: event.threadID,
        step: 'search',
      };
    });
  } catch (e) {
    api.sendMessage('Error occurred: ' + e.message, event.threadID, event.messageID);
  }
};

module.exports.runReply = async function({ api, event, reply }) {
  if (!r) return api.sendMessage('No results found.', reply.tid, reply.mid);

  if (reply.step === 'search') {
    const num = parseInt(event.body);
    if (isNaN(num)) return api.sendMessage('Please provide a valid number', reply.tid, reply.mid);
    if (num < 1 || num > r.length) return api.sendMessage('Invalid number', reply.tid, reply.mid);

    const result = r[num - 1];
    api.sendMessage('Downloading...', reply.tid, reply.mid);

    const link = result.link;
    const dl = await axios.get(`https://joshweb.click/api/xdl?q=${encodeURIComponent(link)}`);
    const links = dl.data.result.files.high;
    const videoPath = path.join(__dirname, 'cache', 'x.mp4');
    const writer = fs.createWriteStream(videoPath);

    const videoResponse = await axios({
      method: 'get',
      url: encodeURI(links),
      responseType: 'stream'
    });

    videoResponse.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage(
        { attachment: fs.createReadStream(videoPath) },
        reply.tid,
        reply.mid,
        () => fs.unlinkSync(videoPath)
      );
    });

    writer.on('error', () => {
      api.sendMessage('Error downloading the video.', reply.tid, reply.mid);
    });
  }
};
