const fs = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');
const path = require('path');
const winston = require('winston');
const { exec } = require('child_process');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: './src/output/process.log' })],
});

ffmpeg.setFfprobePath(ffprobeStatic.path);

function countImages(directory, filetype) {
  return fs
    .readdir(directory)
    .then((files) => {
      const numImages = files.filter((file) => file.endsWith(`.${filetype}`)).length;
      logger.info(`Number of image counted: ${numImages} - directory: ${directory}`);
      return numImages;
    })
    .catch((err) => {
      logger.error(`Failed to read directory - directory: ${directory}, error: ${err}`);
      throw err;
    });
}

function getAudioDuration(audioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        logger.error(`Error getting audio metadata - audioPath: ${audioPath}, error: ${err}`);
        return reject(err);
      }
      const duration = metadata.format.duration;
      logger.info(`Audio duration obtained - audioPath: ${audioPath}, duration: ${duration}`);
      resolve(duration);
    });
  });
}

// **

async function splitVideoIntoParts(videoPath, outputDir) {
  try {
    await fs.promises.mkdir(outputDir, { recursive: true });

    const duration = await getVideoDuration(videoPath);
    logger.info(`Video duration obtained: ${duration} - videoPath: ${videoPath}`);

    const minPartDuration = 35;
    const maxPartDuration = 60;

    let partDuration = maxPartDuration;
    let numParts = Math.ceil(duration / partDuration);

    for (let testDuration = maxPartDuration; testDuration >= minPartDuration; testDuration--) {
      const testParts = Math.ceil(duration / testDuration);
      if (testParts * testDuration >= duration && (duration % testDuration >= minPartDuration || duration % testDuration === 0)) {
        partDuration = testDuration;
        numParts = testParts;
        break;
      }
    }

    logger.info(`Splitting video into parts - videoPath: ${videoPath}, outputDir: ${outputDir}, duration: ${duration}, partDuration: ${partDuration}, numParts: ${numParts}`);

    for (let i = 0, start = 0; i < numParts; i++) {
      const startSeconds = i * partDuration;
      let endSeconds = startSeconds + partDuration;
      if (endSeconds > duration) {
        endSeconds = duration;
      }

      logger.info(`Splitting part ${i + 1}: Start at ${startSeconds} seconds, end at ${endSeconds} seconds`);
    }

    for (let i = 0, start = 0; start < duration; i++) {
      const startSeconds = i * partDuration;
      let endSeconds = startSeconds + partDuration;
      if (endSeconds > duration) {
        endSeconds = duration;
      }
      const outputPath = path.join(outputDir, `part-${i + 1}.mp4`);

      await splitAndAddText(videoPath, startSeconds, partDuration, outputPath, i + 1);
      start += partDuration;
    }
    logger.info('All parts processed successfully.');
  } catch (error) {
    logger.error(`Error processing video parts: ${error}`);
    throw error;
  }
}

function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        logger.error(`Error getting video metadata - videoPath: ${videoPath}, error: ${err}`);
        return reject(err);
      }
      const duration = metadata.format.duration;
      resolve(duration);
    });
  });
}

function splitAndAddText(videoPath, start, duration, outputPath, partNumber) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(start)
      .duration(duration)
      .videoFilters({
        filter: 'drawtext',
        options: {
          text: `#part-${partNumber}`,
          fontsize: 30,
          fontcolor: 'white',
          x: 10,
          y: 55,
          enable: 'between(t,0,10)',
        },
      })
      .outputOptions('-c:v libx264')
      .output(outputPath)
      .on('end', () => {
        logger.info(`Processed part #${partNumber} successfully: ${outputPath}`);
        resolve();
      })
      .on('error', (err, stdout, stderr) => {
        logger.error(`Error creating video part - error: ${err.message}, stdout: ${stdout}, stderr: ${stderr}`);
        reject(err);
      })
      .run();
  });
}

function createVideoFromImages(imagesDir, audioPath, outputFilePath, numImages, audioDuration, filetype, channel) {
  const imageDisplayDuration = channel === 'StorySynth' ? Math.ceil(audioDuration / numImages) : (audioDuration / numImages + 1);
  const totalImagesTime = numImages * imageDisplayDuration + 1;
  // const loopCount = Math.ceil(audioDuration / totalImagesTime); // Calculate loop count needed to cover audio duration
  const loopCount = Math.ceil(audioDuration / totalImagesTime); // Calculate loop count needed to cover audio duration

  const framerate = 1 / imageDisplayDuration; // Set framerate so each image lasts for 12 seconds

  console.log('Create Video', {
    imagesDir,
    audioPath,
    outputFilePath,
    numImages,
    audioDuration,
    framerate,
    loopCount,
    filetype,
    totalImagesTime,
    imageDisplayDuration,
    channel,
  });

  // Log the input and calculated values for troubleshooting
  logger.info(
    'Creating video: ' +
      JSON.stringify(
        {
          imagesDir,
          audioPath,
          imageDisplayDuration,
          totalImagesTime,
          outputFilePath,
          channel,
          numImages,
          audioDuration,
          framerate,
          filetype,
          loopCount,
          input: `${imagesDir}/*.${filetype}`,
          inputOptions: ['-pattern_type glob', `-stream_loop ${loopCount}`],
          inputFPS: framerate,
          inputAudio: audioPath,
          outputOptions: ['-c:v libx264', '-r 30', '-pix_fmt yuv420p', '-c:a aac', '-b:a 192k', '-shortest'],
        },
        null,
        2
      )
  ); // The `null, 2` arguments format the JSON for easier reading

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(`${imagesDir}/*.${filetype}`)
      .inputOptions(['-pattern_type glob'])
      .inputFPS(framerate)
      .input(audioPath)
      .complexFilter([
        // Scale and pad the video, and ensure it occupies the desired space
        `[0:v]scale=-2:ih*0.7, pad=iw:ih*1.4:(ow-iw)/2:(oh-ih)/2:color=black[video]`, // output is labeled [video]
      ])
      .outputOptions([
        '-map',
        '[video]', // Map the video output from the filtered output
        '-map',
        '1:a', // Map the audio from the second input (audioPath)
        '-c:v',
        'libx264',
        '-r',
        '30',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-shortest',
      ])
      .output(outputFilePath)
      .on('end', () => {
        logger.info('Video created successfully', { outputFilePath });
        resolve(outputFilePath); // Resolve with the output file path
      })
      .on('error', (err, stdout, stderr) => {
        logger.error('Error creating video', { error: err.message, stdout, stderr });
        reject(err);
      })
      .run();
  });
}





function addLogoAndTitle(videoPath, logoPath, title, finalOutputPath, filetype, character, channel) {
  return new Promise((resolve, reject) => {
    const log = JSON.stringify({
      videoPath,
      logoPath,
      title,
      finalOutputPath,
      filetype,
      character,
      videoDuration: getVideoDuration(videoPath).then((duration) => duration), 
      channel
    },
    null,
    2);
    logger.info(`Adding logo and title to video: ${log}`);
    ffmpeg(videoPath) // Start with the main video input
      .input(logoPath) // Add the logo as the second input
      .complexFilter([
        // Define the filter chain with correct input and output pad references
        `[1:v] scale=100:100 [logo]`, // Scale the logo and label it as [logo]
        `[0:v][logo] overlay=W-w-10:10 [videoWithLogo]`, // Overlay logo on the video and output to [videoWithLogo]
        {
          filter: 'drawtext',
          options: {
            // fontfile: "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
            fontfile: '/usr/share/fonts/truetype/roboto/Roboto-Bold.ttf',
            text: title,
            // fontcolor: "yellow@1.0",
            fontcolor: '#F3E778',
            fontsize: channel === 'StorySynth' ? 40 : 25,
            x: '(W-text_w)/2',
            y: 25,
            box: 1, // Enable background box
            boxcolor: 'black@0.5', // White background with 50% opacity
            boxborderw: 5, // Optional border width
          },
          inputs: 'videoWithLogo', // Input from the overlay output
          outputs: 'videoWithTitle', // Output to videoWithTitle for further processing
        },

        {
          filter: 'drawtext',
          options: {
            // fontfile: "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
            fontfile: '/usr/share/fonts/truetype/roboto/Roboto-Bold.ttf',
            text: character,
            // fontcolor: "yellow@1.0",
            fontcolor: '#E4E5E8',
            fontsize: channel === 'StorySynth' ? 25 : 35,
            x: '(W-text_w)/2', // Center horizontally
            y: 95, // Position 30 pixels above the bottom
            box: 1, // Enable background box
            boxcolor: 'black@0.5', // White background with 50% opacity
            boxborderw: 5, // Optional border width
          },
          inputs: 'videoWithTitle', // Input from the overlay output
          outputs: 'videoWithTitle1', // Output to videoWithTitle for further processing
        },

        {
          filter: 'drawtext',
          options: {
            // fontfile: "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
            fontfile: '/usr/share/fonts/truetype/roboto/Roboto-Bold.ttf',
            text: channel === 'StorySynth' ? '#StorySynth' : '',
            // fontcolor: "lightblue@1.0",
            fontcolor: '#FFF2DF',
            fontsize: 20,
            x: 580,
            y: 105,
            box: 1, // Enable background box
            boxcolor: 'black@0.5', // White background with 50% opacity
            boxborderw: 5, // Optional border width
          },
          inputs: 'videoWithTitle1', // Input from the previous drawtext output
        },
      ])
      .output(finalOutputPath)
      .on('end', () => {
        logger.info('Final video with logo and title added successfully');
        logger.info('Video duration after adding logo and title:'+ getVideoDuration(finalOutputPath).then((duration) => duration));
        // find the length of final video
        ffmpeg.ffprobe(finalOutputPath, (err, metadata) => {
          if (err) {
            logger.error('Error getting final video metadata' + JSON.stringify({ finalOutputPath, error: err }, null, 2));
            return reject(err);
          }
          const duration = metadata.format.duration;
          console.log('Final video duration obtained', {
            finalOutputPath,
            duration,
          });

          logger.info(
            'Final video duration obtained' + 
            JSON.stringify({
              finalOutputPath,
              duration,
            },
            null,
            2         
          )
          );
        });
        resolve();
      })
      .on('error', function (err, stdout, stderr) {
        logger.error(err);
        logger.error('Error adding logo and title to video' + JSON.stringify({ error: err.message, stdout, stderr }, null, 2));
        reject(err);
      })
      .run();
  });
}

/**
 * Add background music to a video file, looping the background music to match the video duration.
 * @param {string} videoPath - Path to the original video file.
 * @param {string} musicPath - Path to the background music file.
 * @param {string} outputPath - Path where the output should be saved.
 */
function addBackgroundMusic(videoPath, musicPath, outputPath) {
  return new Promise((resolve, reject) => {
    logger.info('Adding background music to video' +  JSON.stringify({ videoPath, musicPath, outputPath }, null, 2));

    ffmpeg()
      .input(videoPath) // Input video file
      .input(musicPath) // Input background music file
      .inputOption('-stream_loop -1') // Loop the background music infinitely
      .complexFilter([
        // Adjust audio levels: original audio (a:0) at higher volume, background music (a:1) at lower volume
        '[0:a]volume=1.7[audio1]', // Increase volume of the original audio by 70%
        '[1:a]volume=0.1[audio2]', // Decrease volume of the background music by 90%
        '[audio1][audio2]amix=inputs=2:duration=shortest:dropout_transition=0[out]', // Mix audio streams, label output as 'out'
      ])
      .outputOptions([
        '-map',
        '0:v', // Map video from the first input
        '-map',
        '[out]', // Map the mixed audio output from the complex filter using the 'out' label
        '-c:v',
        'copy', // Copy video codec
        '-c:a',
        'aac', // Use AAC codec for audio
        '-strict',
        'experimental', // Some features require experimental flag
        '-shortest', // Output should be the shortest of video or audio length
      ])
      .output(outputPath) // Specify output path
      .on('end', () => {
        logger.info(`Background music added successfully: ${ outputPath }`);
        resolve(outputPath);
      })
      .on('error', (err, stdout, stderr) => {
        logger.error('Error adding background music'+ JSON.stringify({ error: err.message, stdout, stderr }, null, 2));
        reject(err);
      })
      .run();
  });
}

// A function that takes in the start and end time, and a video  input and cuts the video from the start to the end time and saves it to the output path provided as an argument to the function. 
function cutVideo(videoPath, start, end, outputPath) {

  // write logger in jsonify template string literal format
  logger.info(`Cutting video from ${start} to ${end} seconds - videoPath: ${videoPath}, outputPath: ${outputPath}`);
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(start)
      .setDuration(end - start)
      .output(outputPath)
      .on('end', () => {
        logger.info('Video cut successfully', { outputPath });
        resolve(outputPath);
      })
      .on('error', (err, stdout, stderr) => {
        logger.error('Error cutting video', { error: err.message, stdout, stderr });
        reject(err);
      })
      .run();
  });
}





// loop the cideo to make time of the video equal to the audio file and cut the video if it is longer than the audio file


// WIP
function loopOrCutVideo(videoPath, outputPath, audioDuration) {
  // write logger in jsonify template string literal format
  logger.info(`Looping or cutting video to match audio length - videoPath: ${videoPath}, outputPath: ${outputPath}, audioDuration: ${audioDuration}`);
  const targetDuration = audioDuration + 1;
  return new Promise((resolve, reject) => {
    ffmpeg()
    .input(videoPath)
    .inputOptions(['-stream_loop -1'])  // Loop video indefinitely
    .complexFilter([
        `[0:v]setpts=N/FRAME_RATE/TB,trim=duration=${targetDuration},setpts=N/FRAME_RATE/TB[v]`  // Loop and trim the video
    ])
    .outputOptions([
        '-map', '[v]',
        '-c:v', 'libx264',
        '-an'  // Remove any audio from the video stream
    ])
    .output(outputPath)
    .on('end', () => {
        logger.info(`Video processed successfully - outputPath: ${outputPath}`);
        resolve(outputPath);
    })
    .on('error', (err, stdout, stderr) => {
        logger.error(`Error processing video - error: ${err.message}, stdout: ${stdout}, stderr: ${stderr}`);
        reject(err);
    })
    .run();
  });
}

function concatenateVideos(inputDir, outputFile) {
  logger.info(`Concatenating videos in ${inputDir} to ${outputFile}`);

  // Read all MP4 files from the directory
  const videoFiles = fs.readdirSync(inputDir).filter(file => file.endsWith('.mp4'));

  // Sort files numerically
  const sortedFiles = videoFiles.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0], 10);
    const numB = parseInt(b.match(/\d+/)[0], 10);
    return numA - numB;
  });

  // Generate filelist.txt
  const filelist = path.join(inputDir, 'filelist.txt');
  let fileContent = sortedFiles.map(file => `file '${path.join(inputDir, file)}'`).join('\n');
  
  fs.writeFileSync(filelist, fileContent);
  logger.info(`File list created successfully at ${filelist}, containing ${sortedFiles.length} files.`);

  // Use Promise to handle FFmpeg processing
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(filelist)
      .inputOptions(['-f concat', '-safe 0']) // Explicitly set concat demuxer options
      .outputOptions(['-c:v copy', '-an']) // Copy video codec, disable audio stream
      .output(outputFile)
      .on('end', () => {
        logger.info('Videos concatenated successfully', { outputFile });
        // log the duration and outputname etc 
        getVideoDuration(outputFile).then((duration) => {
          logger.info(`Concatenated video duration: ${duration} seconds`);
        })
        logger.info(`Merged Video Output file: ${outputFile}`);
        resolve(outputFile);
      })
      .on('error', (err, stdout, stderr) => {
        logger.error('Error concatenating videos', { error: err.message, stdout, stderr });
        reject(err);
      })
      .run();
  });
}


// write a function that takes inout video and audio, calculates the audio length and video length and if the video length is lower than
// audio length it loops the video until the result is equal to the audio length and if the video length is greater than the audio length it cuts the video to match the audio length.  

/*
  Sync audio and video length
  - If video duration < audio duration, loop the video to match audio length
  - If video duration > audio duration, cut the video to match audio length
  - If video duration = audio duration, no action needed

*/
function syncAudioVideoLength(videoPath, audioPath, outputPath) {
  return new Promise((resolve, reject) => {
    logger.info(`Syncing audio and video length - videoPath: ${videoPath}, audioPath: ${audioPath}, outputPath: ${outputPath}`);

    const videoDuration = getVideoDuration(videoPath);
    const audioDuration = getAudioDuration(audioPath);

    Promise.all([videoDuration, audioDuration])
      .then(([videoDuration, audioDuration]) => {
        logger.info(`Video duration: ${videoDuration}, Audio duration: ${audioDuration}`);
        if (videoDuration < audioDuration) {
          // Loop the video to match audio length
          loopOrCutVideo(videoPath, outputPath, audioDuration)
            .then(resolve)
            .catch(reject);
        } else if (videoDuration > audioDuration) {
          // Cut the video to match audio length
          cutVideo(videoPath, 0, audioDuration, outputPath)
            .then(resolve)
            .catch(reject);
        } else {
          // Video and audio are of equal length
          resolve(videoPath);
        }
      })
      .catch(reject);
  });
}



function addAudioToVideo(videoPath, audioPath, outputPath) {
  logger.info(`Adding audio to video - Video Path: ${videoPath}, Audio Path: ${audioPath}, Output Path: ${outputPath}`);

  return new Promise((resolve, reject) => {
      ffmpeg(videoPath) // Input video
          .input(audioPath) // Input audio
          .outputOptions([
              '-c:v copy', // Copy video codec
              '-c:a aac', // Convert audio to AAC
              '-strict experimental' // Allow experimental codecs, if needed (may be necessary for certain audio codecs)
          ])
          .output(outputPath) // Set the output file path
          .on('end', () => {
              logger.info('Audio added to video successfully' +  JSON.stringify({ outputPath }));
              resolve(outputPath); // Resolve the promise with the output path
          })
          .on('error', (err, stdout, stderr) => {
              logger.error('Error adding audio to video' + JSON.stringify({ error: err.message, stdout, stderr }));
              reject(err); // Reject the promise if an error occurs
          })
          .run();
  });
}


async function moveContents(srcDir, destDir) {
  try {
    // Ensure the destination directory exists
    await fs.ensureDir(destDir);

    // Read all the files in the source directory
    const files = await fs.readdir(srcDir);

    // Move each file to the destination directory
    for (const file of files) {
      const srcFile = path.join(srcDir, file);
      const destFile = path.join(destDir, file);
      await fs.move(srcFile, destFile, { overwrite: true });
    }
    logger.info(`Moved files from ${srcDir} to ${destDir}`);
  } catch (error) {
    logger.error('Failed to move files'+ JSON.stringify({ srcDir, destDir, error }, null, 2));
    logger.error(error.message);
    throw error; // Rethrow to handle in the calling context
  }
}

// Adjust paths for Docker environment
const BASE_DIR = '/app'; // Base directory inside the Docker container
async function publicSplitVideoIntoParts(id, videoPath) {
  try {
    const outputDir = path.join(BASE_DIR, 'output', id);
    await splitVideoIntoParts(videoPath, outputDir);
    return outputDir;
  } catch (error) {
    logger.error('Error splitting video into parts' + JSON.stringify({ id, videoPath }, null, 2) ) ;
    throw error;
  }
}

async function addSubtitle(videoPath, outputPath) {
  // create a new subtitled directory in ouuputpath
  const subtitledDir = path.join(outputPath, 'subtitled');
  if (!fs.existsSync(subtitledDir)) {
    fs.mkdirSync(subtitledDir, { recursive: true });
  }

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  if (!fs.existsSync(videoPath)) {
    throw new Error('Video file not found');
  }
  logger.info('Adding subtitles to video:' + JSON.stringify({ videoPath, subtitledDir }, null, 2));
  console.log('Adding subtitles to video:', { videoPath, subtitledDir });
  return new Promise((resolve, reject) => {
    const command = `auto_subtitle "${videoPath}" -o "${subtitledDir}"`;
    try {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error('Failed to add subtitles:'+ JSON.stringify({ error: error.message }, null, 2));
          // return res.status(500).send('Failed to add subtitles.');
        }
        logger.info('Subtitles added successfully:' + JSON.stringify({ subtitledDir }, null, 2));
        resolve(subtitledDir);
      });
    } catch (error) {
      logger.error('Failed to add subtitles:'+ JSON.stringify({ error: error.message }, null, 2));
    }
  });
}


/**
 * Adjusts the playback speed of an audio file and saves it to the specified directory.
 * @param {string} audioFilePath Path to the original audio file.
 * @param {string} outputAudioPath Path where the output audio file should be saved.
 * @param {number} speed The speed multiplier (e.g., 1.25).
 */
async function adjustAudioSpeed(audioFilePath, outputAudioPath, speed) {
  // Ensure the output directory exists
  // await fs.ensureDir(outputAudioPath);

  // Define the output file path
  // const outputFilePath = path.join(outputAudioPath, 'speedchanged.mp3');

  // Log the process start
  // logger.info(`Starting audio speed adjustment - Input: ${audioFilePath}, Output: ${outputFilePath}, Speed: ${speed}`);

  logger.info(`Adjusting audio speed - Input: ${audioFilePath}, Output: ${outputAudioPath}, Speed: ${speed}`);
  // get and log the duration of the audio file
  const duration = await getAudioDuration(audioFilePath);
  logger.info(`Input Audio duration: ${duration}`);

  return new Promise((resolve, reject) => {
    ffmpeg(audioFilePath)
      .audioFilters(`atempo=${speed}`)
      .output(outputAudioPath)
      .on('end', () => {
        logger.info(`Audio speed adjusted successfully - Saved to ${outputAudioPath}`);
        resolve(outputAudioPath);
      })
      .on('error', (err, stdout, stderr) => {
        logger.error(`Error adjusting audio speed - Error: ${err.message}, Stdout: ${stdout}, Stderr: ${stderr}`);
        reject(err);
      })
      .run();
  });
}


async function processMedia(id, title = ' ', filetype = 'png', character, genre = "suspense", channel = "StorySynth", isYoutube = false) {
  try {
    const directoryPath = path.join(__dirname, `../output/video/${channel}`, id);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    logger.info('Processing media' + JSON.stringify( { id, title, filetype, character, genre, channel, isYoutube }, null, 2));
    // const imagesDir = path.join(__dirname, '../input/image', id);
    // const audioPath = path.join(__dirname, '../input/audio', id);
    // const outputDir = path.join(__dirname, '../output/video', id);
    // const outputImagesDir = path.join(__dirname, '../output/image', id);
    // const outputAudioDir = path.join(__dirname, '../output/audio', id);
    const imagesDir = path.join(__dirname, `../input/image/${channel}`, id);
    const audioPath = path.join(__dirname, `../input/audio/${channel}`, id);
    const outputDir = path.join(__dirname, `../output/video/${channel}`, id);
    const outputImagesDir = path.join(__dirname, `../output/image/${channel}`, id);
    const outputAudioDir = path.join(__dirname, `../output/audio/${channel}`, id);


    const audioFilePath = path.join(audioPath, `${id}.mp3`);
    const numImages = isYoutube ? 0 :await countImages(imagesDir, filetype);
    const audioDuration = await getAudioDuration(audioFilePath);
    const videoPath = path.join(outputDir, `${id}.mp4`); // Ensure final video is in output directory
    // const logoPath = path.join(imagesDir, "logo2.png"); // Ensure logo2.png is in image directory
    // const logoPath = path.join(__dirname, '../input/image', 'logo2.png');
    const logoPath = path.join(__dirname, `../input/image/${channel}`, 'logo.png');
    const finalOutputPath = path.join(outputDir, `${id}-final.mp4`);
    const backgroundMusicFinalVideoPath = path.join(outputDir, `${id}-final-bg.mp4`);
    const subtitledVideoPath = path.join(outputDir, 'subtitled', `${id}-final.mp4`);

    if (!isYoutube) {
      await createVideoFromImages(imagesDir, audioFilePath, videoPath, numImages, audioDuration, filetype, channel);
    } else {
      let temporaryOutputPath = path.join(outputDir, `${id}-temp.mp4`);
      const youtubeVideoPath = path.join(__dirname, `../output/video/${channel}/${id}/${id}-final-Vonly.mp4`);
      // await syncAudioVideoLength(youtubeVideoPath, audioFilePath, videoPath);
      await syncAudioVideoLength(youtubeVideoPath, audioFilePath, temporaryOutputPath);
      await addAudioToVideo(temporaryOutputPath, audioFilePath, videoPath);
    }
    await addLogoAndTitle(videoPath, logoPath, title, finalOutputPath, filetype, character, channel);
    // const backgroundMusicPath = path.join(__dirname, '../input/audio/background', 'background-suspense.mp3');
    const backgroundMusicPath = path.join(__dirname, '../input/audio/background', `background-${genre}.mp3`);
    await addSubtitle(finalOutputPath, outputDir);
    // await addBackgroundMusic(finalOutputPath, backgroundMusicPath, backgroundMusicFinalVideoPath);
    await addBackgroundMusic(subtitledVideoPath, backgroundMusicPath, backgroundMusicFinalVideoPath);

    await splitVideoIntoParts(backgroundMusicFinalVideoPath, outputDir);

    // await moveContents(imagesDir, path.join(outputImagesDir));
    // await moveContents(audioPath, path.join(outputAudioDir));

    logger.info('Media processing completed successfully');
    // return videoPath;
    // return finalOutputPath;
    return backgroundMusicFinalVideoPath;
  } catch (error) {
    logger.error('An error occurred during media processing' + JSON.stringify({error}, null, 2));
    logger.error(error.message);
    throw error; // Rethrow for further handling if necessary
  }
}

// Function to handle image conversion
async function convertImage(inputType, inputAddress, outputType = 'png', outputAddress) {
  let img;
  try {
    if (inputType === 'base64') {
      // Handle base64 encoded image
      const base64Data = inputAddress.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      img = await loadImage(buffer);
    } else if (inputType === 'url') {
      // Handle image URL
      const response = await axios.get(inputAddress, { responseType: 'arraybuffer' });
      img = await loadImage(response.data);
    } else {
      throw new Error('Unsupported input type');
    }

    // Create a canvas and draw the image onto it
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const buffer = canvas.toBuffer(`image/${outputType}`);

    // Write file to the specified path
    await fs.outputFile(`${outputAddress}.${outputType}`, buffer);
    console.log(`Saved image as ${outputAddress}.${outputType}`);
  } catch (error) {
    console.error('Failed to process and save the image:', error);
    throw error; // Rethrow for further handling if necessary
  }
}

// Call the function with correct relative paths
// processMedia("image", "audio", "output", "This is a test title");
// const args = process.argv.slice(2); // This slices off the first two default entries.
// if(args.length < 5) {
//   console.log('Usage: node script.js <imageDir> <audioFile> <outputDir> <title> <filetype>');
//   process.exit(1);
// }
// // Provide defaults or use what's passed in
// const imageDir = args[0] || './image';
// const audioDir = args[1] || './audio';
// const outputDir = args[2] || './output';
// const title = args[3] || 'This is a test title';
// const filetype = args[4] || 'jpg';

// logger.info('Starting media processing', {args[0], audioFile, outputDir, title });
// logger.info(args)

// processMedia(imageDir, audioFile, outputDir, title, filetype);
module.exports = {
  cutVideo,
  concatenateVideos,
  processMedia,
  adjustAudioSpeed,
};
