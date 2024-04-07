const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const conversionRequestSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inputType: {
      type: String,
      required: true,
      enum: ['text', 'audio', 'video'],
    },
    outputType: {
      type: String,
      required: true,
      enum: ['text', 'audio', 'video'],
    },
    inputContentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: true,
    },
    outputContentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    parameters: mongoose.Schema.Types.Mixed, // For any additional parameters specific to the conversion type
  },
  {
    timestamps: true,
  }
);


conversionRequestSchema.plugin(toJSON);

/**
 * @typedef ConversionRequest
 */
const ConversionRequest = mongoose.model('ConversionRequest', conversionRequestSchema);

module.exports = ConversionRequest;