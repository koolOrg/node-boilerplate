const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const Schema = mongoose.Schema;
const contentHistorySchema = require('./contenthistory.model').schema;

// Define the item detail schema for cost of living
const itemDetailSchema = new Schema({
  Item: { type: String, required: false },
  Range: { type: String, required: false },
  Value: { type: String, required: false }
}, { _id: false });

// Define the cost of living details schema
const costOfLivingDetailsSchema = new Schema({
  currency: { type: String, required: false },
  details: [itemDetailSchema]
}, { _id: false });

// Create a new schema by cloning the contentHistorySchema
const costOfLivingSchema = new Schema({
  ...contentHistorySchema.obj,  // Spread the contentHistory schema fields
  cost_of_living_details: [costOfLivingDetailsSchema],
  cost_of_living_index: { type: Number, required: false },
  cost_of_living_plus_rent_index: { type: Number, required: false },
  groceries_index: { type: Number, required: false },
  restaurant_price_index: { type: Number, required: false },
  rent_index: { type: Number, required: false },
  local_purchasing_power_index: { type: Number, required: false },
  last_updated_timestamp: { type: Date, required: false },
  country: { type: String, required: false },
  us_state: { type: String, required: false }
});

// Apply the toJSON plugin to the new schema
costOfLivingSchema.plugin(toJSON);
costOfLivingSchema.plugin(paginate);

// Create the model from the new schema
const CostOfLiving = mongoose.model('CostOfLiving', costOfLivingSchema);

module.exports = CostOfLiving;
