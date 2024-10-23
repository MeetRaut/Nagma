import React from 'react';

const AlbumCard = ({ imageUrl, albumName, artistName }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-64 sm:w-72 md:w-80">
      {/* Song cover image */}
      <img
        className="w-full h-64 sm:h-72 object-cover"
        src={imageUrl}
        alt={`${albumName} cover`}
        loading="lazy"
      />
      {/* Song info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold truncate">{albumName}</h3>
        <p className="text-gray-600 truncate">{artistName}</p>

        {/* Play button */}
        <div className="mt-4">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg w-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label={`Play ${albumName} by ${artistName}`}
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;