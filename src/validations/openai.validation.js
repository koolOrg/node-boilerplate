const Joi = require('joi');


let postData = {
  messages: [
    {
      role: "system",
      content: "Based on the detailed information provided from a database of individuals listed on the FBI's wanted list, your task is to craft a short story that is engaging, respectful, and rich in human elements. As you construct the narrative based on the available data, pay close attention to the structure and delivery of your story to accommodate audio narration effectively."
    },
    {
      role: "system",
      content: "Introduction: Start with a brief overview of the individual's situation. Use the available information to weave a narrative that highlights the complexities and human aspects of the cases, without sensationalizing or trivializing the serious nature of their circumstances."
    },
    {
      role: "system",
      content: "Age Range/Date of Birth: October 21, 2022. Physical Description: 17 pounds, black hair, brown eyes, and notable characteristics such as no specific scars or marks. Last Known Location: Walnut, California. Affiliations/Occupations: none specified, Los Angeles field offices. Additional Context: The Federal Bureau of Investigation's Los Angeles Field Office, the Los Angeles County Sheriff's Department, and the U.S. Marshals Service, Central District of California, Los Angeles, Missing Child Unit are seeking the public's assistance in locating Miguel Eduardo Medina. Languages Spoken: not specified. Aliases: Miguel Eduardo Medina Benitez, Miguel Eduardo Medina Junior, Miguel Eduardo Medina Gonzales. Race/Nationality: White (Hispanic). Status: recovered, last modified on 2024-04-10."
    },
    {
      role: "system",
      content: "Using this information, craft a story that delves into the backdrop of the individual's situation. Focus on creating a narrative that is empathetic, emphasizes the human element, and encourages understanding and awareness. Remember, the objective is to foster empathy, understanding, and awareness while avoiding speculation not supported by the data. The story must honor the privacy and dignity of the individual."
    }
  ]
};
// Text-to-Speech Validation
const validateTextToSpeech = {
  body: Joi.object().keys({
    model: Joi.string().required(),
    voice: Joi.string().required(),
    input: Joi.string().required(),
  }),
};

// Text Generation Validation
const validateTextGeneration = {
  body: Joi.object().keys({
    messages: Joi.array().items(Joi.object({
      role: Joi.string().required(),
      content: Joi.string().required()
    })).required(),
    model: Joi.string().default('gpt-3.5-turbo'),
  }),
};

// Image Generation Validation
const validateImageGeneration = {
  body: Joi.object().keys({
    prompt: Joi.string().required(),
    n: Joi.number().integer().min(1).max(4).optional(),
    size: Joi.string().valid('1024x1024', '512x512').optional(),
    model: Joi.string().default('dall-e-3'),
  }),
};

// Vision Service Validation
const validateVision = {
  body: Joi.object().keys({
    model: Joi.string().required(),
    messages: Joi.array().items(
      Joi.object({
        role: Joi.string().required(),
        content: Joi.alternatives().try(
          Joi.string(),
          Joi.object({
            type: Joi.string().valid('text', 'image_url').required(),
            text: Joi.when('type', { is: 'text', then: Joi.string().required() }),
            image_url: Joi.when('type', { is: 'image_url', then: Joi.string().uri().required() })
          })
        )
      })
    ).required(),
  }),
};

module.exports = {
  validateTextToSpeech,
  validateTextGeneration,
  validateImageGeneration,
  validateVision,
};
