const express = require('express');
// const { textToSpeechController, textGenerationController, imageGenerationController, visionController } = require('../controllers/openai.controller');
// const { validateTextToSpeech, validateTextGeneration, validateImageGeneration, validateVision } = require('../middlewares/openai.middleware');

const openaiController = require('../../controllers/openai.controller');
const openaiValidation = require('../../validations/openai.validation');
const validate = require('../../middlewares/validate');

// import { textToSpeechController, textGenerationController, imageGenerationController, visionController } from '../controllers/openai.controller';   
// import { validateTextToSpeech, validateTextGeneration, validateImageGeneration, validateVision } from '../middlewares/openai.middleware';


// import { textToSpeechController, textGenerationController, imageGenerationController, visionController } from '../controllers/openai.controller';
//import { validateTextToSpeech, validateTextGeneration, validateImageGeneration, validateVision } from '../middlewares/openai.middleware';

const router = express.Router();

// POST route for text-to-speech
router.post('/text-to-speech', openaiController.textToSpeechController);

// POST route for text generation
router.post('/text-generation', openaiController.textGenerationController);

// , validate(openaiValidation.validateImageGeneration)
// POST route for image generation
router.post('/image-generation', openaiController.imageGenerationController);

// POST route for vision service
router.post('/vision', validate(openaiValidation.validateVision), openaiController.visionController);

module.exports = router;
