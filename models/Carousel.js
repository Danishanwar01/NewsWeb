// models/Carousel.js
const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
  title: { type: String, required: true },
  caption: { type: String, required: true },
  image: { type: String } 
}, { timestamps: true });

module.exports = mongoose.model('Carousel', carouselSchema);
