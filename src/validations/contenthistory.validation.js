const Joi = require('joi');

// Content History Validation
const createOrUpdateContentHistory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    posted: Joi.boolean(),
    timesPosted: Joi.number().integer().min(0),
    datesPosted: Joi.array().items(Joi.date()).default([]),
    platform: Joi.array().items(Joi.string()).default([]),
    openai: Joi.string().allow('', null),
    imageId: Joi.string().allow('', null),  // Assuming imageId is an optional ObjectId reference
    audioId: Joi.string().allow('', null),  // Assuming audioId is an optional ObjectId reference
    videoId: Joi.string().allow('', null),  // Assuming videoId is an optional ObjectId reference
    finalId: Joi.string().allow('', null),  // Assuming finalId is an optional ObjectId reference
    note: Joi.string().allow('', null),
  }),
};

module.exports = {
  createOrUpdateContentHistory,
};
