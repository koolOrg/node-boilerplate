// use node-yt-dlp to download video from youtube and return the path of the downloaded video
const ytdlp = require('node-yt-dlp');
const path = require('path');
const winston = require('winston');
const fs = require('fs-extra');
const { url } = require('inspector');


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [new winston.transports.Console(), new winston.transports.File({ filename: './src/output/processYT.log' })],
  });


const downloadVideo = async (outputPath, url) => {
    try {
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }
        const video = await ytdlp(url, { o: outputPath });
        logger.info(`Video downloaded to ${video}`);
        return video;
    } catch (error) {
        logger.error(`Error downloading video: ${error}`);
        return null;
    }
};

module.exports = downloadVideo;
``