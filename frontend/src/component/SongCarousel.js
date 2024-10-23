import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from React Router
import SongCard from './SongCard';
import SongPlayer from './SongPlayer';
import placeholderImage from '../images/song_img.png';
import audio1 from '../audios/actual/1.mp3';
import audio2 from '../audios/actual/2.mp3';
import audio3 from '../audios/actual/3.mp3';
import audio4 from '../audios/actual/4.mp3';
import audio5 from '../audios/fun/05.mp3';
import audio6 from '../audios/fun/06.mp3';
import audio7 from '../audios/fun/07.mp3';
import audio8 from '../audios/fun/08.mp3';
import audio9 from '../audios/fun/09.mp3';
import audio10 from '../audios/fun/10.mp3';

const API_KEY = 'YOUR_LAST_FM_API_KEY';
const API_URL = `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${API_KEY}&format=json`;

const SongCarousel = () => {
  const navigate = useNavigate();  // Initialize useNavigate
  const carouselRef = useRef(null);
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const placeholderSongs = [
    { imageUrl: placeholderImage, songName: "Blissful Beats", artistName: "DJ Melody", audioUrl: audio1 },
    { imageUrl: placeholderImage, songName: "Chill Vibes", artistName: "The Harmonizers", audioUrl: audio2 },
    { imageUrl: placeholderImage, songName: "Sunny Days", artistName: "Ray Sun", audioUrl: audio3 },
    { imageUrl: placeholderImage, songName: "Moonlight Serenade", artistName: "Luna Echo", audioUrl: audio4 },
    { imageUrl: placeholderImage, songName: "Ocean Waves", artistName: "The Tides", audioUrl: audio5 },
    { imageUrl: placeholderImage, songName: "Midnight Groove", artistName: "Night Owl", audioUrl: audio6 },
    { imageUrl: placeholderImage, songName: "Dream Catcher", artistName: "Starry Night", audioUrl: audio7 },
    { imageUrl: placeholderImage, songName: "Golden Hour", artistName: "The Sunset Collective", audioUrl: audio8 },
    { imageUrl: placeholderImage, songName: "Electric Pulse", artistName: "Neon Spark", audioUrl: audio9 },
    { imageUrl: placeholderImage, songName: "Calm Waters", artistName: "The Drift", audioUrl: audio10 }
  ];

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const fetchedSongs = data.tracks.track.map((track, index) => ({
          imageUrl: track.image[2]['#text'] || placeholderImage,
          songName: track.name,
          artistName: track.artist.name,
          audioUrl: track.url || placeholderSongs[index].audioUrl
        }));
        setSongs(fetchedSongs);
      } catch (error) {
        console.error('Error fetching songs:', error);
        setSongs(placeholderSongs);
      }
    };

    fetchSongs();
  }, []);

  const handlePlay = (song, index) => {
    setCurrentSong(song);
    setCurrentSongIndex(index);
  };

  const handleNextSong = () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setCurrentSongIndex(nextIndex);
  };

  const handlePreviousSong = () => {
    const previousIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[previousIndex]);
    setCurrentSongIndex(previousIndex);
  };

  const handleShowMore = () => {
    navigate('/more-songs', { state: { songs: songs.slice(10) } });  // Navigate to the new route
  };

  return (
    <div className="my-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Featured Songs</h2>
        <button 
          className="text-purple-600 hover:text-purple-800 font-semibold"
        >
          Show More
        </button>
      </div>

      <div className="relative">
        <div
          className="flex space-x-4 overflow-x-scroll scrollbar-hide scroll-smooth snap-x snap-mandatory"
          ref={carouselRef}
        >
          {songs.slice(0, 10).map((song, index) => (
            <div key={index} className="snap-center">
              <SongCard
                imageUrl={song.imageUrl}
                songName={song.songName}
                artistName={song.artistName}
                onPlay={() => handlePlay(song, index)}
              />
            </div>
          ))}
        </div>
      </div>

      {currentSong && (
        <SongPlayer
          currentSong={currentSong}
          onNextSong={handleNextSong}
          onPreviousSong={handlePreviousSong}
        />
      )}
    </div>
  );
};

export default SongCarousel;
