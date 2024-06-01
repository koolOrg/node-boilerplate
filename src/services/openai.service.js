const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config/config');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { json } = require('body-parser');
const axios = require('axios');
const fsync = require('fs');  
const { count } = require('console');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
// const fs = require('fs');
// const path = require('path');

const openai = new OpenAI(config.openai.apiKey);

// let customPrompt = `
// Based on a detailed database of individuals listed on the FBI's wanted list, your task is to craft an engaging and respectful short story that incorporates human elements deeply. As you construct the narrative from the available data, ensure the structure is suited for effective audio narration.

// **Introduction**: Provide a concise overview of the individual's situation.

// **Narrative Development**:
// - **Age/DOB**: {age_range || dates_of_birth_used}
// - **Physical Description**: {weight}, hair color: {hair}, eye color: {eyes}, notable marks: {scars_and_marks}
// - **Last Known Location**: {locations || description}
// - **Professional and Social Ties**: {occupations}, {field_offices}
// - **Additional Context**: {details}. Consider mentioning {reward_text} if relevant.
// - **Languages**: {languages}
// - **Aliases**: {aliases}
// - **Ethnicity/Nationality**: {race_raw || nationality}
// - **Current Status**: {status}, updated on {modified}

// Using this profile, develop a narrative that delves into the individual's circumstances, emphasizing empathy, the human aspect, and broader societal understanding. The narrative should provide comprehensive insights into the event's details, status, and any resolutions, without speculating beyond the provided data.

// **Guidelines**:
// - Ensure the narrative respects individual privacy and dignity.
// - Write in simple, conversational English accessible to a wide audience.
// - Avoid using any personal identification numbers or vague terms.
// - WRITE IN SIMPLE ENGLISH UNDERSTANDABLE BY WIDE AUDIENCE

// Utilize the provided details to construct a story grounded in the available information. MAKE IT VERY ENGAGING AND RESPECTFUL.`;


// const customPrompt = `"sing the data provided, write a compelling and concise story suitable for a 2-3 minute video.
//  The story should be easy to understand, using simple English. Focus on creating a vivid opening sentence that grabs
//   attention immediately. Ensure the narrative flows smoothly, with each sentence building upon the last to maintain 
//   viewer interest. Conclude with a memorable final line that leaves a lasting impression. 
//   Consider the emotional arc of the story and incorporate elements that resonate with a broad audience to 
//   maximize engagement. HERE IS THE DATA"
// `

function splitInput(input, maxChars) {
  const parts = [];
  let currentPart = "";

  input.split(' ').forEach(word => {
    if (currentPart.length + word.length + 1 > maxChars) {
      parts.push(currentPart);
      currentPart = "";
    }
    currentPart += (currentPart.length > 0 ? ' ' : '') + word;
  });

  if (currentPart.length > 0) {
    parts.push(currentPart);
  }

  return parts;
}

const costoflivingPrompt1 = `Using the JSON data provided at the end of this prompt, create a script for a 3-4 minute video that narrates the cost of living details for a city in a specific country. Start with a casual introduction like 'Here is the breakdown of the cost of living in this city, in this country.' Ensure the script is written in simple English, suitable for a broad audience. Avoid including narration cues or technical jargon.

Focus on explaining the differences and highlights of at least 25 popular cost of living details from the data, such as meals in various types of restaurants, monthly essentials like groceries and utilities, transportation costs, housing expenses, and leisure activities. Make sure the explanations are engaging and informative, helping viewers understand how these costs might impact their lives or differ from their own living expenses.

Make sure to return a word count 2500 or higher. Here is the data in JSON format:`
// const customSerialPrompt = `Using the provided data, craft a story that is engaging and holds the viewer's attention for a 4-5 minute video. The narrative should be written in simple, straightforward English to ensure it's easy to understand. Start with a sentence that instantly catches the viewer's attention such as the  what this story is about and what the character has done, leaving a little suspense to persuade the audience to be wanting to watch the entirety of the video  and continue with a seamless flow, making each sentence naturally build upon the previous one to keep the engagement high throughout the video. Aim to wrap up the story with a powerful final sentence that leaves a strong impact on the audience. Throughout the story, weave in emotional elements and relatable moments that resonate widely, enhancing the connection with the audience. Here's the sample data to use:`;
const customPrompt = `Please provide a STORY for developing a 9-10 minute video story utilizing the data I supply. The story should commence with a captivating opening line, sustain suspense, and possess a smooth progression to captivate the audience. It should culminate with a profound impact, feature emotional and relatable instances, and be articulated in straightforward, comprehensible language. The narrative should also integrate established engagement techniques to enhance viewer interest. Use euphemisms where necessary to ensure the content complies with social media guidelines and remains accessible without triggering censorship. Here is the data to be used:`;

// const customPrompt = `Using the provided data, craft a story that is engaging and holds the viewer's attention for a 2-3 minute video. The narrative should be written in simple, straightforward English to ensure it's easy to understand. Start with a sentence that instantly catches the viewer's attention and continue with a seamless flow, making each sentence naturally build upon the previous one to keep the engagement high throughout the video. Aim to wrap up the story with a powerful final sentence that leaves a strong impact on the audience. Throughout the story, weave in emotional elements and relatable moments that resonate widely, enhancing the connection with the audience. Here's the data to use:`;

const customImagePrompt = `Based on the provided data, generate an image that visually represents the information in a creative and engaging way. The image should be visually appealing and capture the essence of the data to draw viewers' attention. Consider the key details and elements in the data to create a compelling visual representation that conveys the information effectively. The image should be high-quality and suitable for sharing on various platforms. REMEMBER DON'T WRITE ANY LETTERS OR WORDS IN THE IMAGE. DO NOT INCLUDE ANY TEXT IN THE IMAGE> DO NOT INCLUDE ANY WORDS, LETTERS, TEXTS,IN THE IMAGE. Here's the data to use:`;
const newCustomPrompt = `
Create a captivating and informative 7-8 minute video and more than 5000 characters for TikTok and YouTube audiences, focusing on the harrowing tale of a notorious criminal. The narrative should be easily understandable, using simple English to ensure it is accessible to a broad audience. The story must be the summary of the data provided in quotes, just give me the story. Don't specify various sections just give me a whole story. Use euphemisms where necessary to ensure the content complies with social media guidelines and remains accessible without triggering censorship Here is the data " 
                        `

const brandNewPrompt = `
Create a detailed script for a 7-8 minute video, aimed at TikTok and YouTube audiences, based entirely on the narrative data provided. The script should narrate the story of a notorious criminal, making the tale accessible and engaging to a broad audience by using simple English.

Story Development:

Begin by setting the stage with a brief background of the criminal based on the provided data. Illustrate the early influences and significant life events that set the path for their notorious deeds.
Detail the criminal’s major activities and events as described in the provided data, ensuring to convey the story in a way that captures the audience’s interest. Use euphemisms like "no longer with us" for death and "tragic end" for murder to navigate sensitive content gracefully.
Describe the climax involving law enforcement's pursuit and the pivotal moments leading to the criminal’s capture or continued evasion.
Conclusion:

If the story data indicates that justice was served, conclude on a positive note by highlighting the triumph of the legal system and the restoration of societal order.
If the story data suggests that justice was not fully served, end with a slightly somber tone that reflects on the shortcomings of the situation and poses reflective questions to the audience.
Language and Style Guidelines:

Employ straightforward and simple language to ensure the script is easy to understand and relate to.
Keep the narrative engaging from start to finish, suitable for the dynamic audience of TikTok and YouTube.
Avoid any language or descriptions that might lead to content restrictions on social media platforms.
Output Requirements:

The script must exceed 5000 characters to ensure comprehensive coverage of the story.
Craft the content to cater effectively to both the quick-consuming TikTok audience and the more in-depth YouTube viewers.
Data for the Story:`

const brandNewPrompt2 = `
Create a detailed narrative script for a 7-8 minute video aimed at TikTok and YouTube audiences. The script should tell the story of a notorious criminal based on the provided data, using simple English to make it accessible and engaging to a broad audience. The narrative should unfold seamlessly without any visual or directorial cues, allowing the story itself to capture and hold the viewer's interest.

Story Guidelines:

Introduction: Briefly introduce the criminal, hinting at their notoriety and the impact of their actions. Start with a strong hook that draws the audience into wanting to learn more about this individual.
Background: Describe the early life of the criminal, including any significant events that shaped their path. Focus on their upbringing, any pivotal moments during childhood or adolescence, and the onset of their criminal behavior.
Criminal Activities: Elaborate on the major criminal acts committed by the individual. Discuss how they escalated over time, the strategies used to evade law enforcement, and the public's reaction to these crimes.
Downfall and Conclusion:
If justice was served, detail the capture and trial, highlighting the efforts of law enforcement and the legal battles that ensued. End with a positive reflection on justice and societal order being restored.
If justice was not served, discuss the shortcomings of the situation, reflecting on the gaps in law enforcement and the justice system that allowed the criminal to evade full accountability. Conclude with a thought-provoking question or statement that leaves the audience contemplating the complexities of law and morality.
Language and Style:

Use straightforward and concise language to ensure clarity and maintain viewer engagement.
Avoid technical jargon and sensitive language that might trigger censorship, using euphemisms where necessary (e.g., "no longer with us" for death).
Maintain a narrative flow that guides the audience through the story, building tension and interest towards a climactic conclusion.
Output Requirements:

Ensure the script is longer than 5000 characters to provide a detailed and comprehensive account of the story.
Tailor the narrative to engage both the quick-consuming TikTok viewers and the in-depth YouTube audience.
Data for the Story:`


// const brandNewPrompt3 = `Create a continuous, detailed narrative script for a 7-8 minute video aimed at TikTok and YouTube audiences, focusing on the story of the character. This script should purely convey the story, using simple English to make it accessible and engaging for a broad audience. The narrative should unfold without the use of titles, opening lines, engagement hooks, or any form of segmented narration that might suggest changes in visuals or audio.

// Story Guidelines:

// Content Focus: Directly dive into the life and criminal activities of the character, avoiding any introductory remarks or direct addresses to the audience. Start with his early life and background and seamlessly transition into his criminal actions and their consequences.
// Narrative Flow: Maintain a linear or thematic progression that naturally guides the audience through the story from his beginnings to his capture and ultimate fate.
// Language and Tone: Use clear and concise language, with euphemisms for sensitive content (e.g., "no longer with us" for deaths). The narrative should be engaging and informative without prompting viewer interaction or reflection.
// Avoid Directives for Visuals or Audio: Do not include any instructions or suggestions for visual or audio changes that typically accompany video scripts, such as camera angles, background changes, or music cues.
// Output Requirements:

// The script must be over 5000 characters to provide a comprehensive and uninterrupted narrative.
// The narrative should be suitable for a video format without requiring the viewer to see specific visuals or hear particular sounds to understand the story fully.
// Conclusion:

// Conclude the story by summarizing the societal and personal impacts of character's actions. Reflect briefly on the broader implications of his life and crimes without inviting audience engagement or posing direct questions.`
const brandNewPrompt3 = `Create a continuous, detailed narrative script for a 7-8 minute video aimed at TikTok and YouTube audiences, focusing on the intriguing yet dark tale of the character. Begin the script with a suspenseful summary that teases the mysterious and dramatic elements of the character's story, drawing the viewer in with hints of the depths we will explore. Use simple English to make the narrative accessible and engaging for a broad audience. The script should unfold the story in a straightforward manner, without segmented narration or specific directives for visuals or audio.

Story Guidelines:

- **Introduction with Suspense**: Open with a brief, enticing summary that introduces the character's enigmatic past and hints at the nefarious deeds to come, setting a suspenseful tone without revealing too much detail.
- **Content Focus**: Seamlessly transition from the suspenseful introduction into the character’s life, starting from early background details and leading into the sequence of criminal activities and their significant consequences.
- **Narrative Flow**: Ensure a smooth, linear or thematic progression that keeps the audience engaged, guiding them from the character’s beginnings through to their capture and the resolution of their story.
- **Language and Tone**: Maintain clarity and simplicity in language, using euphemisms for sensitive content (e.g., "no longer with us" for deaths) to keep the narrative suitable for a wide audience. The tone should be engaging and maintain a hint of mystery, without direct audience interaction or reflective prompts.

Output Requirements:

- The script must exceed 8000 characters, ensuring a detailed exploration of the character’s life and actions.
- The narrative should be fully understandable as a standalone video script, independent of specific visual or audio elements.

Conclusion:

- Wrap up the script by summarizing the societal and personal impacts of the character’s actions. Offer a reflective conclusion on the implications of their life and crimes, subtly urging viewers to think about the moral of the story without direct engagement.`;

const brandNewPrompt4=`
Create a 3-4 minute video about 5000 words story, focusing on the intriguing yet dark tale of the character., that compellingly summarizes the information provided. Begin the narrative with a touch of mystery to captivate the audience, drawing them into the unfolding events. Open with a brief, enticing summary that introduces the character's enigmatic past and hints at the nefarious deeds to come, setting a suspenseful tone without revealing too much detail. As the story progresses, gradually reveal key details, maintaining a balance between suspense and clarity. Conclude with a strong and resonant message, such as 'Stay safe, stay vigilant,' to leave a lasting impact on viewers. Throughout the video, employ euphemisms such as 'passed away' instead of harsher terms, ensuring the content remains engaging yet respectful, and entertaining. Make sure to return a character count more than 3500 just give me the story without giving me outline or scripts. write this in plain SIMPLE ENGLISH. Give me at least 4000 characters.  Here is the data:`


const costoflivingPrompt2 = `Using the JSON data provided at the end of this prompt, create a script for a 3-4 minute video that narrates the cost of living details for a city in a specific country. Start with a casual introduction like 'Here is the breakdown of the cost of living in this city, in this country.' Ensure the script is written in simple English, suitable for a broad audience. Avoid including narration cues or technical jargon.

Focus on explaining the differences and highlights of at least 25 popular cost of living details from the data, such as meals in various types of restaurants, monthly essentials like groceries and utilities, transportation costs, housing expenses, and leisure activities. Make sure the explanations are engaging and informative, helping viewers understand how these costs might impact their lives or differ from their own living expenses. Make sure to return a word count 2500 or higher and just give me the story without giving me outline or scripts. write this in plain SIMPLE ENGLISH.. AND IN A VERY FRIENDLY TONE. JUST GIVE ME THE RESPONSE WITHOUT ANY METADATA 

Here is the data in JSON format: `


const costoflivingImagePrompt = `Given the text input below, provide specific suggestions for high-quality images that would best illustrate each section of the story. Ensure the image suggestions are clear, concise, and likely to yield high-quality results when searched on the internet. The images should enhance the understanding and engagement of the audience with the content, focusing on key details mentioned in each section.

Text Input:`
const collectionMap = {
  "serialkiller": brandNewPrompt4,
  "costofliving": costoflivingPrompt2,
  "regular": "",
}
// Text Generation Service

// const createImageSuggestions = async ({ textInput }) => {
//   try {
//     const response = await openai.images.suggest({
//       prompt: costoflivingImagePrompt + textInput,
//     });
//     return response.choices[0].message;
//   } catch (error) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Failed to generate image suggestions");
//   }

// }

const createTextGeneration = async ({ text, model = "gpt-4-turbo" , collection = "serialkiller", imageSuggestion = false}) => {
  console.log(text + " " + model + " " + collection + " " + imageSuggestion)
  if (imageSuggestion) {
    try {
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: costoflivingImagePrompt,
          },
          {
            role: "user",
            content: text,
          },
        ],
      });
      return response;
    } catch (error) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Failed to generate image suggestions");
    }
  } else {
  try {
    console.log("createTextGeneration");
    const msg = {
      role: "system",
      content: `${collectionMap[collection]} ${text}`,
    };

    console.log(`Model: ${model}, Messages: `, JSON.stringify(text));
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [msg],
    });
    

    return completion;
  } catch (error) {
    console.error("Error in generating text: ", error);
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to generate text");
  }
}
};

// const createTextGeneration = async ({ text, model = "gpt-4-turbo" }) => {
//   try {
//     console.log("Starting text generation with model:", model);
//     // concatenate custom prompt and user input
//     let prompt = `${brandNewPrompt4} "${text}"`;
//     // let prompt = text;

//     let totalText = "";
//     let currentLength = 0;
//     const maxLength = 5000;  // Maximum character length to generate

//     while (currentLength < maxLength) {
//       const msg = {
//         role: "system",
//         content: prompt,
//       };

//       const completion = await openai.chat.completions.create({
//         model: model,
//         messages: [msg],
//         max_tokens: 1024  // Adjust based on the balance of performance and coherence
//       });

//       const textChunk = completion.choices[0].message.content.trim();
//       totalText += textChunk;
//       currentLength += textChunk.length;
//       prompt = textChunk;  // Use the last generated text as the new prompt

//       if (textChunk.length < 10) {  // Break if generated text becomes too short to avoid looping on meaningless output
//         break;
//       }
//     }

//     return totalText;
//   } catch (error) {
//     console.error("Error in generating text:", error);
//     throw new Error("Failed to generate text: " + error.message);
//   }
// };
// model="tts-1",
//   voice="alloy",
// Text-to-Speech Service
const createTextToSpeech = async ({ model="tts-1-hd", voice="alloy", textInput, id, channel }) => {
  const maxChars = 4000;
  const inputs = splitInput(textInput, maxChars);
  const directoryPath = path.join(__dirname, `../input/audio/${channel}`, id);
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
  try {
    // const response = await openai.audio.speech.create({
    //   model: model,
    //   voice: voice,
    //   input: input,
    // });
     // Make API calls and save each audio segment
     const audioPaths = [];
     for (let i = 0; i < inputs.length; i++) {
       const response = await openai.audio.speech.create({
         model: model,
         voice: voice,
         input: inputs[i],
       });
       const buffer = Buffer.from(await response.arrayBuffer());
       const segmentPath = path.join(directoryPath, `${id}-${i}.mp3`);
       await fs.promises.writeFile(segmentPath, buffer);
       audioPaths.push(segmentPath);
     }

    // const speechFile = path.join(directoryPath, `${id}.mp3`);
    // // con
    // const buffer = Buffer.from(await response.arrayBuffer());
    // await fs.writeFile(speechFile, buffer);
     // Concatenate audio files using ffmpeg
     const finalPath = path.join(directoryPath, `${id}.mp3`);
     const concatCommand = `ffmpeg -y -i "concat:${audioPaths.join('|')}" -acodec copy ${finalPath}`;
     await execAsync(concatCommand);
 
     // Optionally delete segment files
    //  audioPaths.forEach(file => fs.unlinkSync(file));
 
     return finalPath;

    // const speechFile = path.resolve("./speech.mp3");
    // await fs.writeFile(speechFile, buffer);
    // return speechFile;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create text-to-speech");
  }
};

// // Text Generation Service
// const createTextGeneration = async ({ messages, model = "gpt-3.5-turbo" }) => {
//   try {
//     console.log("createTextGeneration")
//     const msg = {
//       role: "system",
//       content: `${customPrompt} ${JSON.stringify(messages)}`,
//     };
//     }
//     console.log(messages + " " + model)
//     console.log(JSON.stringify(messages) + " " + model ) 
//     const completion = await openai.chat.completions.create({
//       model: model,
//       messages: msg,
//     });
//     // return completion.choices[0].message;
//     return completion
//   } catch (error) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Failed to generate text");
//   }
// };


// const createImageGeneration = async ({ prompt, n = 1, size = "1024x1024", id , quality = "hd", style = "vivid"}) => {
//   try{
// const directoryPath = path.join(__dirname, '../input/image', id);
// if (!fs.existsSync
// (directoryPath)) {
//     fs.mkdirSync(directoryPath, { recursive: true });
// }
// const imagePath = path.join(directoryPath, `${id}.png`);
// return imagePath;

//   } catch(error){
//     console.log("Error in generating image: ", error);
//     throw new ApiError(httpStatus.BAD_REQUEST, "Failed to generate image");
// }
// }
// Image Generation Service
const createImageGeneration = async ({ prompt, n = 1, size = "1024x1024", id , quality = "hd", style = "vivid", count, labelNumber=1, channel}) => {
  try {
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${customImagePrompt} HERE IS THE DATA, NO TEXT IN THE IMAGE, NO WORDS, TEXT, SENTENCE, ALPHANUMERIC CHARACTERS ON THE IMAGE: ${prompt}`,
      n: n,
      size: size,
      quality: quality,  //standard, hd
      style: style, //vivid, or natural
    });
    const imageUrl = response.data[0].url;
    // const dateTime = new Date().toISOString().replace(/[:.]/g, '-');
    const directoryPath = path.join(__dirname, `../input/image/${channel}`, id);
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
    // const imagePath = path.join(__dirname, '../images', `image_${dateTime}.png`);
    const imagePath = path.join(directoryPath, `${id}-${labelNumber}.png`);

    // Fetch the image using axios and save it using a stream
    const responseImage = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'stream'
    });

    // responseImage.data.pipe(fs.createWriteStream(imagePath));
    const writer = fsync.createWriteStream(imagePath);
    responseImage.data.pipe(writer);
    return imageUrl;
    // return response.data[0].url;
  } catch (error) {
    console.log("Error in generating image: ", error);
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to generate image");
  }
};

// Vision Service
const createVisionAnalysis = async ({ model, messages }) => {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
    });
    return response.choices[0].message;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to analyze vision");
  }
};

module.exports = {
  createTextToSpeech,
  createTextGeneration,
  createImageGeneration,
  createVisionAnalysis
};
