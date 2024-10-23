const express = require('express');
const Playlist = require('../models/Playlist');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new playlist (requires authentication)
router.post('/', authMiddleware, async (req, res) => {
    const { name, songs } = req.body;

    const newPlaylist = new Playlist({
        name,
        userId: req.user.userId, // Get userId from JWT token
        songs,
    });
    await newPlaylist.save();
    res.status(201).json({ message: 'Playlist created successfully!', playlist: newPlaylist });
});

// Get all playlists for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    const playlists = await Playlist.find({ userId: req.user.userId }).populate('songs');
    res.json(playlists);
});

// Add songs to an existing playlist (requires authentication)
router.put('/:playlistId/songs', authMiddleware, async (req, res) => {
    const { songs } = req.body;
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        req.params.playlistId,
        { $addToSet: { songs: { $each: songs } } },
        { new: true }
    ).populate('songs');
    res.json(updatedPlaylist);
});

// Delete a playlist (requires authentication)
router.delete('/:playlistId', authMiddleware, async (req, res) => {
    await Playlist.findByIdAndDelete(req.params.playlistId);
    res.json({ message: 'Playlist deleted successfully!' });
});

module.exports = router;
