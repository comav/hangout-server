const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let userSchema = new Schema({
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
  job: { type: String, default: null },
  interests: { type: String, default: null },
  university_degree: { type: String, default: null },
  app_aim: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  token: { type: String }
})

module.exports = mongoose.model("user", userSchema, 'authdata');