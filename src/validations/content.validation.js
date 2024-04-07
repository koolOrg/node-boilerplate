const Joi = require('joi');

const createOrUpdateContent = {
    body: Joi.object().keys({
        id: Joi.string().required(),
    //   userId: Joi.string().required(),
    //   type: Joi.string().required().valid('text', 'audio', 'video'),
    //   sourceType: Joi.string().required().valid('text', 'audio', 'video'),
    //   contentUrl: Joi.string().required(),
    //   title: Joi.string().required(), // Allow title
    //   body: Joi.string().required(), // Allow body
    //   author: Joi.string().required(), // Allow author
    //   createdAt: Joi.date().required(), // Allow createdAt
    //   updatedAt: Joi.date().required(), // Allow updatedAt
    //   metadata: Joi.object().allow(null),
    }),
  };
  
module.exports = {
  createOrUpdateContent,
};