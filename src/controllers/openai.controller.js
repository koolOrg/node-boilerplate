const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const openaiService = require('../services/openai.service');
const fs = require('fs-extra');

 
// Text-to-Speech Controller
const textToSpeechController = catchAsync(async (req, res) => {
    const { model, voice, textInput, id } = req.body;
    console.log(textInput);
    console.log(model);
    console.log(voice);
    console.log(id);
    const filePath = await openaiService.createTextToSpeech({ model, voice, textInput, id });
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.mp3"`)
    // res.status(httpStatus.OK).json({ message: "Text-to-speech conversion successful", filePath });
    fs.createReadStream(filePath).pipe(res);   
});

// Text Generation Controller
/**
 * Handles the text generation request.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the response is sent.
 */
const textGenerationController = catchAsync(async (req, res) => {
    // const { messages, model } = req.body;
    const {text, id, collection, imageSuggestion} = req.body;
    console.log(text);
    // const completion = await openaiService.createTextGeneration({ messages, model });
    const completion = await openaiService.createTextGeneration({ text, collection, imageSuggestion });

    // const cleanedMessage = originalMessage.replace(/\\n\\n/g, ' ');
    // const cleanedMessage = completion.choices[0].message.replace(/\\n\\n/g, ' ');
    // console.log(completion.choices[0].message);

    // console.log(typeof completion.choices[0].message);
    const cleanedMessage = cleanString(completion.choices[0].message.content);
    // const cleanedMessage = cleanString(completion);
    console.log(cleanedMessage);
    res.status(httpStatus.OK).json({ story: cleanedMessage });
});

// Image Generation Controller
const imageGenerationController = catchAsync(async (req, res) => {
    const { prompt, n, size, id, quality, style, count, labelNumber, channel} = req.body;
    const imageUrl = await openaiService.createImageGeneration({ prompt, n, size, id, quality, style, count, labelNumber, channel});
    res.status(httpStatus.OK).json({ imageUrl });
});

// Vision Service Controller
const visionController = catchAsync(async (req, res) => {
    const { model, messages } = req.body;
    const response = await openaiService.createVisionAnalysis({ model, messages });
    res.status(httpStatus.OK).json({ response: response.choices[0].message });
});

// function cleanString(input) {
//     // Replace \n with nothing and \ with nothing
//     return input.replace(/\\n/g, '').replace(/\\/g, '');
// }
function cleanString(input) {
    // This regex replaces escaped newlines and backslashes
    return input.replace(/\\n/g, '').replace(/\\/g, '');
}

module.exports = {
    textToSpeechController,
    textGenerationController,
    imageGenerationController,
    visionController
};
