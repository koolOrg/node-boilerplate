const ffmpegUtils = require('./ffmpegUtils');
const fs = require('fs-extra');
const ffprobe = require('fluent-ffmpeg').ffprobe;
const path = require('path');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: './src/output/process.log' })],
});

/**
 * Converts a video to the specified resolution.
 * @param {string} videoPath Path to the original video file.
 * @param {number} width Desired width of the video.
 * @param {number} height Desired height of the video.
 * @returns {Promise<string>} Path to the converted video.
 */
async function convertVideoResolution(videoPath, width, height) {
  const outputPath = videoPath.replace(path.extname(videoPath), `_converted${path.extname(videoPath)}`);
  logger.info(`Converting video resolution - Source: ${videoPath}, Output: ${outputPath}, Resolution: ${width}x${height}`);

  return new Promise((resolve, reject) => {
    ffmpegUtils.ffmpeg(videoPath)
      .videoCodec('libx264')
      .size(`${width}x${height}`)
      .output(outputPath)
      .on('end', () => {
        logger.info(`Video resolution converted successfully - Output: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        logger.error(`Error converting video resolution - ${err.message}`);
        reject(err);
      })
      .run();
  });
}

/**
 * Retrieves file metadata.
 * @param {string} filePath Path to the file.
 * @returns {Promise<Object>} Metadata of the file.
 */
function getFileMetadata(filePath) {
  return new Promise((resolve, reject) => {
    const extension = path.extname(filePath).toLowerCase();
    logger.info(`Fetching metadata for file - Path: ${filePath}`);
    if (extension === '.mp3' || extension === '.mp4') {
      ffprobe(filePath, { path: ffmpegUtils.ffprobeStatic.path }, (err, metadata) => {
        if (err) {
          logger.error(`Error fetching metadata - ${err.message}`);
          reject(err);
        } else {
          logger.info(`Metadata fetched successfully for ${filePath}`);
          resolve(metadata);
        }
      });
    } else {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          logger.error(`Error fetching file stats - ${err.message}`);
          reject(err);
        } else {
          logger.info(`File stats fetched successfully for ${filePath}`);
          resolve(stats);
        }
      });
    }
  });
}

/**
 * Adds an image as a thumbnail to a video.
 * @param {string} videoPath Path to the video.
 * @param {string[]} imagePaths Array containing one or two image paths.
 * @returns {Promise<string>} Path to the video with the thumbnail added.
 */
async function addThumbnailToVideo(videoPath, imagePaths) {
  const outputPath = videoPath.replace(path.extname(videoPath), `_thumbnailed${path.extname(videoPath)}`);
  const complexFilter = [];
  logger.info(`Adding thumbnail to video - Video Path: ${videoPath}, Image Paths: ${imagePaths.join(', ')}, Output Path: ${outputPath}`);

  imagePaths.forEach((imagePath, index) => {
    complexFilter.push({
      filter: 'movie',
      options: imagePath,
      outputs: `img${index}`
    });
    complexFilter.push({
      filter: 'overlay',
      options: { x: 10, y: (index * 100) + 10 }, // Position each image differently
      inputs: [`[0]`, `img${index}`],
      outputs: 'out'
    });
  });

  return new Promise((resolve, reject) => {
    ffmpegUtils.ffmpeg(videoPath)
      .complexFilter(complexFilter, 'out')
      .output(outputPath)
      .on('end', () => {
        logger.info(`Thumbnail added successfully to video - Output Path: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        logger.error(`Error adding thumbnail to video - ${err.message}`);
        reject(err);
      })
      .run();
  });
}

module.exports = {
  convertVideoResolution,
  getFileMetadata,
  addThumbnailToVideo,
};
