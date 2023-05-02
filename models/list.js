'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const listSchema = new Schema({
  name: { type: String, required: true },
  creator: { type: String, required: true },
  members: { type: Array, required: false },
  items: { type: Array, required: false },
});

const ListSchema = mongoose.model('list', listSchema);

module.exports = ListSchema;

