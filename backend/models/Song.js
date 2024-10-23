const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    name: { type: String, required: true },
    artist: { type: String, required: true },
    genre: { type: String, required: true },
    filePath: { type: String, required: true },
});

module.exports = mongoose.model('Song', songSchema);
