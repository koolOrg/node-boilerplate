const Joi = require('joi');

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
    createConversionRequest,
}