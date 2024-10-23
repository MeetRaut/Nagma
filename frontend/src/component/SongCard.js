// src/components/SongCard.js
import React from 'react';

const SongCard = ({ imageUrl, songName, artistName, onPlay }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-64 sm:w-72 md:w-80">
      {/* Song cover image */}
      <img
        className="w-full h-64 sm:h-72 object-cover"
        src={imageUrl}
        alt={`${songName} cover`}
        loading="lazy"
      />
      {/* Song info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold truncate">{songName}</h3>
        <p className="text-gray-600 truncate">{artistName}</p>

        {/* Play button */}
        <div className="mt-4">
          <button
            onClick={onPlay} // Add onClick handler
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg w-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label={`Play ${songName} by ${artistName}`}
          >
            Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default SongCard;