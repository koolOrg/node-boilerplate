const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs-extra');
const ElevenLabs = require('elevenlabs-node');
// const ffmpegUtils  = require('../../utils/FfmpegUtils');
// print current path
// console.log(__dirname);
const ffmpegUtils = require('../../utils/FfmpegUtil');
const { createCanvas, loadImage } = require('canvas');
const { exec } = require('child_process');


// const { textToSpeechController, textGenerationController, imageGenerationController, visionController } = require('../controllers/openai.controller');
// const { validateTextToSpeech, validateTextGeneration, validateImageGeneration, validateVision } = require('../middlewares/openai.middleware');

// const openaiController = require('../../controllers/openai.controller');
// const openaiValidation = require('../../validations/openai.validation');
// const validate = require('../../middlewares/validate');

// import { textToSpeechController, textGenerationController, imageGenerationController, visionController } from '../controllers/openai.controller';
// import { validateTextToSpeech, validateTextGeneration, validateImageGeneration, validateVision } from '../middlewares/openai.middleware';

// import { textToSpeechController, textGenerationController, imageGenerationController, visionController } from '../controllers/openai.controller';
//import { validateTextToSpeech, validateTextGeneration, validateImageGeneration, validateVision } from '../middlewares/openai.middleware';

const router = express.Router();
// Setup your ElevenLabs API

const collectionToChannelMap = {
  costofliving: "CityCostCruise",
  serialkiller: "StorySynth",
}


function cleanText(text) {
  // Remove references (e.g., [1], [2], etc.)
  text = text.replace(/\[\d+\]/g, '');
  // Replace multiple spaces or newlines with a single space
  return text.replace(/\s+/g, ' ').trim();
}

router.get('/generate-audio-from-text', async (req, res) => {
  try {
    // Read text input from file
    const id = req.params.id;
    //print current path
    // console.log(__dirname);

    // const textInput = await fs.readFile('./input/sample3.txt', 'utf8');
    // const textInput = await fs.readfile()
    // read file from src > input> file > {id}.txt
    const directoryPath = path.join(__dirname, '../../input/text', id);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    const filePath = path.join(directoryPath, `${id}.txt`);
    const textInput = await fs.readFile(filePath, 'utf8');

    // const textInput = await fs.readFile(`./input/${id}.txt`, 'utf8')

    // print the type of text input
    console.log(typeof textInput);

    // Use ElevenLabs API to convert text to speech
    const response = await voice
      .textToSpeech({
        fileName: './output/audio12.mp3', // Path to save the audio file
        textInput: textInput, // Text to convert to speech
        stability: 0.7, // Optional: Stability setting
        similarityBoost: 0.75, // Optional: Similarity boost
        // modelId: "eleven_multilingual_v2", // Optional: Model ID
        style: 1, // Optional: Style exaggeration
        speakerBoost: true, // Optional: Speaker boost
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
    console.log(JSON.stringify(response));

    res.status(200).send('Audio generated successfully.');
  } catch (error) {
    res.status(500).send('Failed to generate audio: ' + error.message);
  }
});

router.post('/generate-audio-from-request', async (req, res) => {
  let { textInput, id, genre, channel } = req.body;
  console.log('ID:', id);
  console.log('Text:', textInput);
  console.log('Genre:', genre);
  // const channel = collectionToChannelMap[genre];

  let voice;
  if (genre === "costofliving"){
     voice = new ElevenLabs({
      
      apiKey: 'asdsa',
      // voiceId: 'XH9EfmIVCl4UzRIMWdMv' // A Voice ID from Elevenlabs
      // voiceId: 'aOcS60CY8CoaVaZfqqb5' // A Voice ID from Elevenlabs
        voiceId: 'aOcS60CY8CoaVaZfqqb5'
    })
  } else{
   voice = new ElevenLabs({
    apiKey: '', // Your API key from Elevenlabs
    voiceId: 'zfsvO8SZYZu8u1rv9Crz', // A Voice ID from Elevenlabs
  });
}
  // Trim the input text and ensure it's treated as a UTF-8 string
  textInput = textInput.trim();
  console.log('Received textInput:', textInput);

  // Define the path for the output based on the provided ID
  // const filePath = `./output/audio/${id}.mp3`;
  // const filePath = path.join(__dirname, `../../output/audio/${id}.mp3`);
  const directoryPath = path.join(__dirname, `../../input/audio/${channel}`, id);
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  const filePath = path.join(directoryPath, `${id}.mp3`);

  try {
    const response = await voice.textToSpeech({
      fileName: filePath,
      textInput: textInput,
      stability: 0.5,
      similarityBoost: 0.5,
      style: 1,
      speakerBoost: true,
    });

    console.log(response);

    // Set headers to inform the client about the type of content being sent
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.mp3"`);

    // Stream the audio file directly to the client
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Error during text-to-speech processing:', error);
    res.status(500).send('Failed to generate audio: ' + error.message);
  }
});

// final output path

router.post('/merge-and-convert', async (req, res) => {
  const { id, title, fileType, character, genre, channel, isYoutube } = req.body;
  console.log('ID:', id);
  console.log('Title:', title);
  console.log('Filetype:', fileType);
  console.log('Character:', character);
  console.log('Genre:', genre);
  console.log('Channel:', channel);
  console.log('Youtube:', isYoutube);
  // res.json({ finalOutputPath });


  try {
    // Merge the audio files and convert to the desired format
    const finalOutputPath = await ffmpegUtils.processMedia(id, title, fileType, character, genre, channel, isYoutube);

    // Set headers to inform the client about the type of content being sent
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${finalOutputPath}"`);

    // res.setHeader('Content-Disposition', `attachment; filename="${id}.${format}"`);

    // Stream the final video file directly to the client
    fs.createReadStream(finalOutputPath).pipe(res);
  } catch (error) {
    console.error('Error during audio processing:', error);
    res.status(500).send('Failed to process audio: ' + error.message);
  }
});


// expose a post route that takes id, url and makes a directory src/input/video/channel/id/youtube and downloads the video from the url and saves it in the directory
// it should call a docker container that has yt-dlp as docker run --rm yt-dlp-container output_video.mp4 'https://www.youtube.com/watch?v=exampleVideoID'

router.post('/download-video', async (req, res) => {
  const { id, url, channel } = req.body;
  console.log('ID:', id);
  console.log('URL:', url);
  console.log('Channel:', channel);

  try {
    // Make sure the input directory exists
    const directoryPath = path.join(__dirname, `../../input/video/${channel}`, id, 'youtube');
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    // Call the function to download the video + audio
    // const ytdlpCommand = `yt-dlp --ignore-config --no-continue --rm-cache-dir -f best -o ${directoryPath}/${id}.mp4 ${url}`;

    // this hasn't been tested. Output both audio + video
    // const ytdlpCommand = `yt-dlp --ignore-config --no-continue --rm-cache-dir -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" -o "${directoryPath}/${id}.mp4" ${url}`;


    //just video
    const ytdlpCommand = `yt-dlp --ignore-config --no-continue --rm-cache-dir -f bestvideo+bestaudio -o "${directoryPath}/${id}.mp4" ${url}`;


    console.log('YT-DLP Command:', ytdlpCommand);

    // Execute the command
    exec(ytdlpCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error downloading video: ${error}`);
        return res.status(500).send('Failed to download video.');
      }
      // return read steam of the video
      
      console.log('Video downloaded successfully:', stdout);
      const finalOutputPath = path.join(directoryPath, `${id}.mp4`);
      // Set headers to inform the client about the type of content being sent
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="${id}.mp4"`);
      // Stream the video file directly to the client
      fs.createReadStream(finalOutputPath).pipe(res);
      // res.send('Video downloaded successfully.');
    })

    // if (videoPath) {
      // res.send('Video downloaded successfully.');

    // } else {
      // res.status(500).send('Failed to download video.');  
    // }
  } catch (error) {
    console.error('Error during video download:', error);
    res.status(500).send('Failed to download video: ' + error.message);


  }
});


// create post route that takes id, starttime, endtime, as inout,  and ccalls the ffmpegutils cutVideo function and provides videoPath, starttime, endtime, and outputPath inout
// and returns the final output path to the client  and also sends the file to the client as a response 
router.post('/cut-video', async (req, res) => {
  const { id, startTime, endTime, channel, number } = req.body;
  console.log('ID:', id);
  console.log('Start Time:', startTime);
  console.log('End Time:', endTime);

  try {
    // the inputpath is /src/input/video/channel/id/youtube/{id}.mp4
    const inputPath = path.join(__dirname, `../../input/video/${channel}/${id}/youtube/${id}.mp4`);
    // const output is /src/output/video/channel/id/{id}-cut{number}.mp4
    const outputDir = path.join(__dirname, `../../output/video/${channel}/${id}/segment/`);
    const outputPath = path.join(outputDir, `${number}.mp4`);

    //make sure both the input and output path exists
    if (!fs.existsSync(inputPath)) {
      return res.status(404).send('Video not found.');
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    

    // Cut the video based on the provided start and end times
    await ffmpegUtils.cutVideo(inputPath, startTime, endTime, outputPath);

    // Set headers to inform the client about the type of content being sent
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename=${outputPath}`);

    // Stream the cut video file directly to the client
    fs.createReadStream(outputPath).pipe(res);
  } catch (error) {
    console.error('Error during video cutting:', error);
    res.status(500).send('Failed to cut video: ' + error.message);
  }
})


// create a get route that concatenates all the input segment from above to a final video and sends the final video to the client as a response
router.post('/concatenate-video', async (req, res) => {
  const { id, channel } = req.body;
  console.log('ID:', id);
  console.log('Channel:', channel);
  const inputDir = path.join(__dirname, `../../output/video/${channel}/${id}/segment`);

  // make sure the input path exists
  if (!fs.existsSync(inputDir)) {
    return res.status(404).send('Video segments not found.');
  }
  // const inputPath = path.join(inputDir, '*.mp4');
  const outputPath = path.join(__dirname, `../../output/video/${channel}/${id}/${id}-final-Vonly.mp4`);
  try {
    // Concatenate the video segments into a final video
    await ffmpegUtils.concatenateVideos(inputDir, outputPath);

    // Set headers to inform the client about the type of content being sent
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename=${outputPath}`);

    // Stream the final video file directly to the client
    fs.createReadStream(outputPath).pipe(res);
  } catch (error) {
    console.error('Error during video concatenation:', error);
    res.status(500).send('Failed to concatenate video: ' + error.message);
  }
})


// A post route that takes id, and speed number as input and calls the ffmpegutils adjustAudioSpeed function and provides audioPath, outputPath, and speed as input
// and returns the final output path to the client and also sends the file to the client as a response async function adjustAudioSpeed(audioFilePath, outputAudioDirPath, speed) 

router.post('/adjust-audio-speed', async (req, res) => {
  const { id, speed, channel } = req.body;
  console.log('ID:', id);
  console.log('Speed:', speed);
  console.log('Channel:', channel);

  try {
    // The input audio file path
    const audioFilePath = path.join(__dirname, `../../input/audio/${channel}/${id}/${id}.mp3`);
    // The output directory path
    const outputAudioPath = path.join(__dirname, `../../input/audio/${channel}/${id}/${speed}.mp3`);
    // The output audio file path

    // Make sure the input audio file exists
    if (!fs.existsSync(audioFilePath)) {
      return res.status(404).send('Audio file not found.');
    }

    // // Make sure the output directory exists
    // if (!fs.existsSync(outputAudioPath)) {
    //   return res.status(404).send('Output directory not found.');
    // }

    // Adjust the speed of the audio file
    await ffmpegUtils.adjustAudioSpeed(audioFilePath, outputAudioPath, speed);

    // Set headers to inform the client about the type of content being sent
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename=${outputAudioPath}`);

    // Stream the audio file directly to the client
    fs.createReadStream(outputAudioPath).pipe(res);
  } catch (error) {
    console.error('Error during audio speed adjustment:', error);
    res.status(500).send('Failed to adjust audio speed: ' + error.message);
  }

}
)

// A post route that takes id, channel, and speed number and goes into the input audio directory and changes the name of {id}.mp3 to orig-{id}.mp3 and {speed}.mp3 to {id}.mp3
// and sends the file to the client as a response
router.post('/replace-audio', async (req, res) => {
  const { id, speed, channel } = req.body;
  console.log('ID:', id);
  console.log('Speed:', speed);
  console.log('Channel:', channel);

  try {
    // The original audio file path
    const origAudioPath = path.join(__dirname, `../../input/audio/${channel}/${id}/${id}.mp3`);
    // The adjusted audio file path
    const adjustedAudioPath = path.join(__dirname, `../../input/audio/${channel}/${id}/${speed}.mp3`);

    console.log('Original Audio Path:', origAudioPath);
    console.log('Adjusted Audio Path:', adjustedAudioPath);
    // Make sure the original audio file exists
    if (!await fs.pathExists(origAudioPath)) {
      return res.status(404).send('Original audio file not found.');
    }

    // Make sure the adjusted audio file exists
    if (!await fs.pathExists(adjustedAudioPath)) {
      return res.status(404).send('Adjusted audio file not found.');
    }

    // Rename the original audio file to orig-{id}.mp3
    const origAudioPathRenamed = path.join(__dirname, `../../input/audio/${channel}/${id}/orig-${id}.mp3`);
    await fs.rename(origAudioPath, origAudioPathRenamed);

    // Rename the adjusted audio file to {id}.mp3
    await fs.rename(adjustedAudioPath, origAudioPath);

    // Set headers to inform the client about the type of content being sent
    res.setHeader('Content-Type', 'audio/mpeg');
    console.log('After renaming, the original audio path is:', origAudioPath);
    console.log('After renaming, the adjusted audio path is:', adjustedAudioPath);
    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(origAudioPath)}`);

    // Stream the audio file directly to the client
    fs.createReadStream(origAudioPath).pipe(res);
  } catch (error) {
    console.error('Error during audio replacement:', error);
    res.status(500).send('Failed to replace audio: ' + error.message);
  }
});


// router.get('/add-subtitle', async (req, res) => {
//   const { id } = req.query; // Accessing id from the query parameter
//   console.log("Adding subtitles to video with ID:", id);


//   const videoPath = path.join(__dirname, `../../output/video/${id}/${id}-final.mp4`);
//   const outputPath = path.join(__dirname, `../../output/video/${id}/subtitled/`);

//   // Check if the video file exists
//   if (!fs.existsSync(videoPath)) {
//       return res.status(404).send('Video not found.');
//   }

//   // Construct the command to add subtitles
//   const command = `auto_subtitle "${videoPath}" -o "${outputPath}"`;

//   try {
//       // Execute the command
//       exec(command, (error, stdout, stderr) => {
//           if (error) {
//               console.error(`Error adding subtitles: ${error.message}`);
//               return res.status(500).send('Failed to add subtitles.');
//           }
//           console.log('Subtitles added successfully:', stdout);

//           const subtitledVideoPath = path.join(outputPath, `${id}-final.mp4`);
//           if (fs.existsSync(subtitledVideoPath)) {
//               // Set headers for the file download
//               res.setHeader('Content-Type', 'video/mp4');
//               res.setHeader('Content-Disposition', `attachment; filename="${id}-final.mp4"`);

//               // Stream the subtitled video file directly to the client
//               fs.createReadStream(subtitledVideoPath).pipe(res);
//           } else {
//               return res.status(404).send('Subtitled video not found.');
//           }
//       });
//   } catch (error) {
//       console.error('Failed to add subtitles:', error);
//       res.status(500).send(`Failed to add subtitles: ${error.message}`);
//   }
// });


// router.get('/add-background-music', async (req, res) => {
//   const { id } = req.query; // Access the video ID from query parameters

//   console.log("Adding background music to video with ID:", id);

//   const videoPath = path.join(__dirname, `../../output/video/${id}/${id}-final.mp4`);
//   const musicPath = path.join(__dirname, `../../input/audio/background/background-suspense.mp3`); // Assuming a specific MP3 file for background
//   const outputPath = path.join(__dirname, `../../output/video/${id}/${id}-final-baudio.mp4`);

//   // Check if the video and music files exist
//   if (!fs.existsSync(videoPath) || !fs.existsSync(musicPath)) {
//       return res.status(404).send('Video or background music not found.');
//   }

//   try {
//       // Call the function to add background music to the video
//       await ffmpegUtils.addBackgroundMusic(videoPath, musicPath, outputPath);

//       // Check if the output video was created successfully
//       if (fs.existsSync(outputPath)) {
//           // Set headers for file download
//           res.setHeader('Content-Type', 'video/mp4');
//           res.setHeader('Content-Disposition', `attachment; filename="${id}-final-baudio.mp4"`);

//           // Stream the output video file directly to the client
//           fs.createReadStream(outputPath).pipe(res);
//       } else {
//           return res.status(404).send('Processed video not found.');
//       }
//   } catch (error) {
//       console.error('Failed to add background music:', error);
//       res.status(500).send(`Failed to add background music: ${error.message}`);
//   }
// });

// router.get('/get-merge-metadata', async (req, res) => {
//     const {id} = req.params;
//     // check the total input images, audio files for this user and return the metadata such as file name, file type, file size, image count, audio duration etc


// })

/**
 * Route to scrape content from a Wikipedia URL.
 */
router.post('/wiki-extractor', async (req, res) => {
  const { url, id, title } = req.body;

  console.log('URL:', url);
  console.log('ID:', id);
  console.log('Title:', title);

  try {
    // Fetch the webpage
    const response = await axios.get(url);
    const html = response.data;

    // Parse the HTML
    const $ = cheerio.load(html);

    // Find the bodyContent div and extract content
    const bodyContent = $('#bodyContent');

    if (!bodyContent.length) {
      throw new Error("Couldn't find the 'bodyContent' div.");
    }

    // Extract and clean text from paragraphs
    const cleanedText = [];
    bodyContent.find('p').each((i, elem) => {
      const text = cleanText($(elem).text());
      if (text) cleanedText.push(text);
    });

    // Send cleaned text back to the client
    res.json({ text: cleanedText });
  } catch (error) {
    console.error('Scraping error:', error.message);
    res.status(500).json({ error: 'Failed to scrape content from Wikipedia.' });
  }
});


router.post('/upload-tiktok', async (req, res) => {
  console.log("I'm inside upload-tiktok")
  const { id, description, tags } = req.body;
  console.log('ID:', id);
  console.log('Description:', description);
  console.log('Tags:', tags);

  // const videoPath = path.join(__dirname, `../../src/output/video/${id}-final.mp4`);
  const videoPath = path.join(__dirname, `../../output/video/${id}-final.mp4`);
  if (!fs.existsSync(videoPath)) {
      return res.status(404).send('Video not found.');
  }

  // return res.send('Video found');
  const cookies = "72b98cbc444fbcaef985f7be6f084ad3";
  try {
      console.log(`Uploading video with ID: ${id}`);
      // Construct the command to run your Python uploader script
      const escapedDescription = description.replace(/"/g, '\\"'); // Escape double quotes in the description
      const command = `tiktok-uploader -v "${videoPath}" -d "${escapedDescription}" -c "${cookies}" -t "${tags.join(',')}"`;
      
      // Execute the Python script to upload to TikTok
      
      exec(command, (error, stdout, stderr) => {
          if (error) {
              console.error(`Error uploading video: ${error}`);
              return res.status(500).send('Failed to upload video.');
          }
          console.log('Video uploaded successfully:', stdout);
          res.send('Video uploaded successfully.');
      });
  } catch (error) {
      console.error('Failed to upload video:', error);
      res.status(500).send(`Failed to upload video: ${error.message}`);
  }
});


// router.post(`/upload-image`, async (req, res) => {
//   const { id, inputType, inputAddress, outputType, outputAddress } = req.body;
//   console.log('ID:', id);
//   console.log('Input Type:', inputType);
//   console.log('Input Address:', inputAddress);
//   console.log('Output Type:', outputType);
//   console.log('Output Address:', outputAddress);
//   try {
//     if (inputType === 'base64') {
//       // Handle base64 encoded image
//       const base64Data = inputAddress.split(',')[1];
//       const buffer = Buffer.from(base64Data, 'base64');
//       img = await loadImage(buffer);
//     } else if (inputType === 'url') {
//       // Handle image URL
//       const response = await axios.get(inputAddress, { responseType: 'arraybuffer' });
//       img = await loadImage(response.data);
//     } else {
//       throw new Error('Unsupported input type');
//     }
//     const directoryPath = path.join(__dirname, '../../input/image', id);
//     if (!fs.existsSync(directoryPath)) {
//       fs.mkdirSync(directoryPath, { recursive: true });
//     }
//     // convert image to standard dimension
//     const canvas = createCanvas(img.width, img.height);
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(img, 0, 0);
//     // ctx.drawImage(img, 0, 0);
//     const buffer = canvas.toBuffer(`image/${outputType}`);
//     // await fs.outputFile(`${outputAddress}.${outputType}`, buffer);
//     // save the image in direcroty path with id
//     await fs.outputFile(`${directoryPath}/${outputAddress}.${outputType}`, buffer);

//     console.log(`Saved image as ${outputAddress}.${outputType}`);
//     // send image file back to the client
//     res.sendFile(`${directoryPath}/${outputAddress}.${outputType}`)




//   } catch (error) {
//     console.error('Failed to process and save the image:', error);
//     res.status(500).send('Failed to process image: ' + error.message);
//   }
// });
router.post('/upload-image', async (req, res) => {
  const { id, inputType, inputAddress, outputType, outputAddress, channel } = req.body;
  console.log('ID:', id);
  console.log('Input Type:', inputType);
  console.log('Input Address:', inputAddress);
  console.log('Output Type:', outputType);
  console.log('Output Address:', outputAddress);
  console.log('Channel:', channel);

  try {
    let img;
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

    const directoryPath = path.join(__dirname, `../../input/image/${channel}`, id);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    // Create a canvas and draw the image resized to 1024x1024
    const canvas = createCanvas(1024, 1024);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 1024, 1024); // Draw the image at the desired size

    const buffer = canvas.toBuffer(`image/${outputType}`);
    const outputPath = path.join(directoryPath, `${outputAddress}.${outputType}`);
    await fs.promises.writeFile(outputPath, buffer);

    console.log(`Saved image as ${outputPath}`);
    // Send image file back to the client
    res.sendFile(outputPath);
  } catch (error) {
    console.error('Failed to process and save the image:', error);
    res.status(500).send('Failed to process image: ' + error.message);
  }
});

// Function to handle image conversion
// async function convertImage(inputType, inputAddress, outputType, outputAddress) {
//     let img;
//     try {
//         if (inputType === 'base64') {
//             // Handle base64 encoded image
//             const base64Data = inputAddress.split(',')[1];
//             const buffer = Buffer.from(base64Data, 'base64');
//             img = await loadImage(buffer);
//         } else if (inputType === 'url') {
//             // Handle image URL
//             const response = await axios.get(inputAddress, { responseType: 'arraybuffer' });
//             img = await loadImage(response.data);
//         } else {
//             throw new Error('Unsupported input type');
//         }

//         // Create a canvas and draw the image onto it
//         const canvas = createCanvas(img.width, img.height);
//         const ctx = canvas.getContext('2d');
//         ctx.drawImage(img, 0, 0);
//         const buffer = canvas.toBuffer(`image/${outputType}`);

//         // Write file to the specified path
//         await fs.outputFile(`${outputAddress}.${outputType}`, buffer);
//         console.log(`Saved image as ${outputAddress}.${outputType}`);
//     } catch (error) {
//         console.error('Failed to process and save the image:', error);
//         throw error; // Rethrow for further handling if necessary
//     }
// }

router.post('/cleanup-files', async (req, res) => {
  const { id, channel } = req.body;

  // Define directories
  const outputVideoDir = path.join(__dirname, `../../output/video/${channel}/${id}`);
  const inputVideoDir = path.join(__dirname, `../../input/video/${channel}/${id}`);
  const inputImageDir = path.join(__dirname, `../../input/image/${channel}/${id}`);

  console.log('Cleaning up files for ID:', id + ' in channel:', channel);
  console.log('Output Video Directory:', outputVideoDir);

  try {
      // Delete specific files in output directory
      const filesInOutputDir = await fs.readdir(outputVideoDir);
      // delete all folders and files in the output directory except the final video file and the final background video file for the given id


      await Promise.all(filesInOutputDir.map(file => {
          if (file.endsWith('.mp4') && (!file.startsWith('part') && !file.endsWith(`${id}-final-bg.mp4`))) {
              return fs.unlink(path.join(outputVideoDir, file));
          }

          // if file is a directory, delete it
          if (fs.statSync(path.join(outputVideoDir, file)).isDirectory()) {
              return fs.rmdir(path.join(outputVideoDir, file), { recursive: true });
          }

          // // delete any mp3 files in the output directory
          // if (file.endsWith('.mp3')) {
          //     return fs.unlink(path.join(outputVideoDir, file));
          // }

      }));

      // Recursively delete all content in input video directory
      await fs.emptyDir(inputVideoDir);
      await fs.rmdir(inputVideoDir);  // Remove the directory itself if needed

      // Recursively delete all content in input image directory
      await fs.emptyDir(inputImageDir);
      await fs.rmdir(inputImageDir);  // Remove the directory itself if needed



      res.send('Cleanup completed successfully.');
  } catch (error) {
      console.error('Error during cleanup:', error);
      res.status(500).send('Failed to cleanup files: ' + error.message);
  }
});

async function calculateDirectorySize(directory) {
  try {
    const exists = await fs.existsSync(directory);
    if (!exists) {
      return 'No directory or file found.';
    }

    const files = await fs.readdir(directory);
    const stats = await Promise.all(
      files.map(file => {
        const filePath = path.join(directory, file);
        return fs.stat(filePath).then(stat => {
          if (stat.isDirectory()) {
            return calculateDirectorySize(filePath);
          } else {
            return stat.size;
          }
        });
      })
    );
    return stats.reduce((total, size) => total + size, 0);
  } catch (error) {
    console.error('Failed to calculate directory size:', error);
    throw error; // Rethrow for further handling if necessary
  }
}

// A post route that accepts id and channel in the body and calculates the total size of input and output directories for the given id and channel
router.post('/get-file-size', async (req, res) => {
  const { id, channel } = req.body;
  console.log('ID:', id);
  console.log('Channel:', channel);

  const inputVideoDir = path.join(__dirname, `../../input/video/${channel}/${id}`);
  const outputVideoDir = path.join(__dirname, `../../output/video/${channel}/${id}`);
  const inputImageDir = path.join(__dirname, `../../input/image/${channel}/${id}`);
  const inputAudioDir = path.join(__dirname, `../../input/audio/${channel}/${id}`);
  const inputDirTotal = path.join(__dirname, `../../input/video/${channel}`);
  const outputDirTotal = path.join(__dirname, `../../output/video/${channel}`);

  try {
    // const inputVideoSize = await fs.size(inputVideoDir);
    // const outputVideoSize = await fs.size(outputVideoDir);
    // const inputImageSize = await fs.size(inputImageDir);
    // const inputAudioSize = await fs.size(inputAudioDir);
    // const inputDirSize = await fs.size(inputDirTotal);
    // const outputDirSize = await fs.size(outputDirTotal);  
    const inputVideoDirSize = await calculateDirectorySize(inputVideoDir);
    const outputVideoDirSize = await calculateDirectorySize(outputVideoDir);
    const inputImageDirSize = await calculateDirectorySize(inputImageDir);
    const inputAudioDirSize = await calculateDirectorySize(inputAudioDir);
    const inputDirSize = await calculateDirectorySize(inputDirTotal);
    const outputDirSize = await calculateDirectorySize(outputDirTotal);


    res.json({
      inputVideoDirSize,
      outputVideoDirSize,
      inputImageDirSize,
      inputAudioDirSize,
      inputDirSize,
      outputDirSize,
      
    });
  } catch (error) {
    console.error('Error calculating file sizes:', error);
    res.status(500).send('Failed to calculate file sizes: ' + error.message);
  }
});

module.exports = router;
