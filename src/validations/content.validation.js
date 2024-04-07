const Joi = require('joi');

const createOrUpdateContent = {
  body: Joi.object().keys({
    userId: Joi.string().required(), // assuming you're passing user ID as a string; adjust if needed
    type: Joi.string().required().valid('text', 'audio', 'video'),
    sourceType: Joi.string().required().valid('text', 'audio', 'video'),
    contentUrl: Joi.string().required().custom(url),
    originalContent: Joi.string().allow('', null),
    metadata: Joi.object().allow(null),
  }),
};


const createConversionRequest = {
    body: Joi.object().keys({
      userId: Joi.string().required(),
      inputType: Joi.string().required().valid('text', 'audio', 'video'),
      outputType: Joi.string().required().valid('text', 'audio', 'video'),
      inputContentId: Joi.string().required(),
      outputContentId: Joi.string().allow('', null),
      status: Joi.string().valid('pending', 'processing', 'completed', 'failed').default('pending'),
      parameters: Joi.object().allow(null),
    }),
  };
  
module.exports = {
  createOrUpdateContent,
    createConversionRequest,
};