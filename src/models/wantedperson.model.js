const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Schema = mongoose.Schema;

// Define a schema for images
const ImageSchema = new Schema({
  large: String,
  caption: String,
  thumb: String,
  original: String,
});

// Define a schema for files
const FileSchema = new Schema({
  name: String,
  url: String,
});

// Define the main schema for the dataset
const wantedPersonSchema = new Schema({
  uid: { type: String, required: true },
  url: String,
  age_range: String,
  weight: String,
  occupations: [String],
  field_offices: [String],
  locations: [String],
  reward_text: String,
  sex: String,
  hair: String,
  ncic: String,
  dates_of_birth_used: [String],
  caution: String,
  nationality: String,
  age_min: Number,
  age_max: Number,
  scars_and_marks: String,
  subjects: [String],
  aliases: [String],
  race_raw: String,
  suspects: [String],
  publication: String,
  title: String,
  coordinates: [Number],
  hair_raw: String,
  languages: [String],
  complexion: String,
  build: String,
  details: String,
  status: String,
  legat_names: [String],
  eyes: String,
  person_classification: String,
  description: String,
  images: [ImageSchema],
  possible_countries: [String],
  weight_min: Number,
  weight_max: Number,
  additional_information: String,
  remarks: String,
  path: String,
  eyes_raw: String,
  reward_min: Number,
  url: String,
  possible_states: [String],
  modified: String,
  reward_max: Number,
  race: String,
  height_max: Number,
  place_of_birth: String,
  height_min: Number,
  poster_classification: String,
  warning_message: String,
  files: [FileSchema],
  id2: String,
});


wantedPersonSchema.plugin(toJSON);
const WantedPerson = mongoose.model('WantedPerson', wantedPersonSchema);

module.exports = WantedPerson;

