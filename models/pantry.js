'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const pantrySchema = new Schema({
  name: { type: String, required: true },
  creator: { type: String, required: true },
  members: { type: Array, required: false },
  items: { type: Array, required: false },
});

const PantrySchema = mongoose.model('pantry', pantrySchema);

module.exports = PantrySchema;

