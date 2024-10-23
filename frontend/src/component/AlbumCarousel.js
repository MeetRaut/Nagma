import React, { useRef } from 'react';
import AlbumCard from './AlbumCard';

import albumImage from '../images/song_img.png';


const AlbumCarousel = () => {
  const carouselRef = useRef(null);

  const albums = [
    { imageUrl: albumImage, albumName: "Chill Vibes", artistName: "DJ Chill" },
    { imageUrl: albumImage, albumName: "Feel Good Hits", artistName: "The Uplifters" },
    { imageUrl: albumImage, albumName: "Summer Breeze", artistName: "Sunny Sounds" },
    { imageUrl: albumImage, albumName: "Night Grooves", artistName: "Midnight Vibes" },
    { imageUrl: albumImage, albumName: "Acoustic Dreams", artistName: "Guitar Harmony" },
    { imageUrl: albumImage, albumName: "Electronic Escapade", artistName: "Synthwave Collective" },
    { imageUrl: albumImage, albumName: "Soulful Journeys", artistName: "The Heartstrings" },
    { imageUrl: albumImage, albumName: "Winter Melodies", artistName: "Snowy Tunes" },
    { imageUrl: albumImage, albumName: "Vibrant Nights", artistName: "The Glow" },
    { imageUrl: albumImage, albumName: "Rhythms of Nature", artistName: "Nature's Soundscapes" }
  ];
  

  return (
    <div className="my-10 p-4">
      {/* Title and Show More Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Featured Albums</h2>
        <button className="text-purple-600 hover:text-purple-800 font-semibold">
          Show More
        </button>
      </div>

      {/* Carousel Section */}
      <div className="relative">

        {/* Carousel */}
        <div
          className="flex space-x-4 overflow-x-scroll scrollbar-hide scroll-smooth snap-x snap-mandatory"
          ref={carouselRef}
        >
          {albums.map((album, index) => (
            <div key={index} className="snap-center">
              <AlbumCard
                imageUrl={album.imageUrl}
                albumName={album.albumName}
                artistName={album.artistName}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AlbumCarousel;