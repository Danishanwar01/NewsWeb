
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String }, 
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
