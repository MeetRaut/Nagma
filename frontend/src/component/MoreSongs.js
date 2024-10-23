import React from 'react';
import SongCard from './SongCard';

const MoreSongs = ({ songs }) => {
  return (
    <div className="my-10 p-4">
      <h2 className="text-3xl font-bold mb-6">More Songs</h2>
      <div className="grid grid-cols-2 gap-4">
        {songs.map((song, index) => (
          <SongCard
            key={index}
            imageUrl={song.imageUrl}
            songName={song.songName}
            artistName={song.artistName}
            onPlay={() => console.log('Playing song:', song.songName)}
          />
        ))}
      </div>
    </div>
  );
};

export default MoreSongs;
