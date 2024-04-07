const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
// const { tokenTypes } = require('../config/tokens');


const contentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['text', 'audio', 'video'],
    },
    sourceType: {
      type: String,
      required: true,
      enum: ['text', 'audio', 'video'],
    },
    contentUrl: {
      type: String,
      required: true,
    },
    originalContent: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);



contentSchema.plugin(toJSON);

/**
 * @typedef Content
 */
const Content = mongoose.model('Content', contentSchema);

module.exports = Content;

// Path: src/models/token.model.js
// Compare this snippet from src/models/content.Schema.model.js:
// const mongoose = require('mongoose');
// const { toJSON } = require('./plugins');
// const { tokenTypes } = require('../config/tokens');

