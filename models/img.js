const mongoose = require('mongoose');

const imgSchema = mongoose.Schema({
  _userID: { type: String, required: true},
  title: { type: String, required: true },
  path: { type: String, required: true },
  originalName: { type: String, required: true },
});

module.exports = mongoose.model('Images', imgSchema);
