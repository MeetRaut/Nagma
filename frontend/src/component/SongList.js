// src/components/SongList.js
import React from 'react';

const SongList = ({ songs, onSelectSong }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {songs.map((song) => (
        <div key={song.id} className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center">
          <img src={song.imageUrl} alt={song.songName} className="w-full h-32 object-cover rounded-lg mb-2" />
          <h3 className="text-lg font-semibold">{song.songName}</h3>
          <p className="text-gray-600">{song.artistName}</p>
          <button
            onClick={() => onSelectSong(song)}
            className="bg-purple-600 text-white rounded-full px-4 py-2 mt-2 hover:bg-purple-700 transition"
          >
            Play
          </button>
        </div>
      ))}
    </div>
  );
};

export default SongList;