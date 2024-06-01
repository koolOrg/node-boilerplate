const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const Schema = mongoose.Schema;

const ContentHistorySchema = new Schema({
    refId: { type: String, required: false },  // Unique identifier for the content
    name: { type: String, required: false},  // Name of the content
    posted: { type: Boolean, default: false },  // Whether the content has been posted
    timesPosted: { type: Number, default: 0 },  // Number of times the content has been posted
    datesPosted: [{ type: Date }],  // Array of dates when the content was posted
    platform: [{ type: String }],  // Platforms where the content was posted
    parts: [{ type: String }],  // Parts of the content
    openai: {type: String, required: false},  // OpenAI returned data used to generate the content
    imageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: false },  // Reference to an image document
    audioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Audio', required: false },  // Reference to an audio document
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: false },  // Reference to a video document
    finalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Final', required: false },  // Reference to a final version document
    note: { type: String, required: false },  // Additional notes
}, { timestamps: true });  // Automatically add createdAt and updatedAt fields

// Apply the toJSON plugin to ContentHistorySchema
ContentHistorySchema.plugin(toJSON);
ContentHistorySchema.plugin(paginate);

// Create the model from the schema
const ContentHistory = mongoose.model('ContentHistory', ContentHistorySchema);

module.exports = ContentHistory;
