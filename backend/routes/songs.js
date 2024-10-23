const express = require('express');
const multer = require('multer');
const Song = require('../models/Song');
const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

// Create a new song
router.post('/', upload.single('audio'), async (req, res) => {
    const { name, artist, genre } = req.body;
    const filePath = req.file.path;

    const newSong = new Song({ name, artist, genre, filePath });
    await newSong.save();
    res.status(201).json({ message: 'Song added successfully!', song: newSong });
});

// Get all songs
router.get('/', async (req, res) => {
    const songs = await Song.find();
    res.json(songs);
});

module.exports = router;
