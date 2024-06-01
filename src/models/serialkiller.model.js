const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Schema = mongoose.Schema;
const contentHistorySchema = require('./contenthistory.model').schema;

// Define a sub-schema for link data
const LinkSchema = new Schema({
    text: { type: String },
    url: { type: String },
    title: { type: String }
}, { _id: false });

// Extend contentHistorySchema with new fields
contentHistorySchema.add({
    wikiLinks: [{ type: LinkSchema, default: () => ({}) }],  // Optional wiki links
    country: {
        text: { type: String, default: '' },
        links: [{ type: LinkSchema, default: () => ({}) }]
    },
    yearsActive: {
        text: { type: String, default: '' },
        links: [{ type: LinkSchema, default: () => ({}) }]
    },
    provenVictims: {
        text: { type: String, default: '' },
        links: [{ type: LinkSchema, default: () => ({}) }]
    },
    possibleVictims: {
        text: { type: String, default: '' },
        links: [{ type: LinkSchema, default: () => ({}) }]
    },
    notes: {
        text: { type: String, default: '' },
        links: [{ type: LinkSchema, default: () => ({}) }]
    }
});

// Apply the toJSON plugin to the modified schema
contentHistorySchema.plugin(toJSON);

// Create the model from the extended schema
const SerialKiller = mongoose.model('SerialKiller', contentHistorySchema);

module.exports = SerialKiller;
