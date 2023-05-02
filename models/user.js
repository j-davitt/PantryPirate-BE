'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  list: { type: Array, required: false },
  pantry: { type: Array, required: false },
});

const UserSchema = mongoose.model('user', userSchema);

module.exports = UserSchema;

