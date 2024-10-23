import React, { useState, useEffect, useRef } from 'react';

const SongPlayer = ({ currentSong, onNextSong, onPreviousSong }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(new Audio(currentSong?.audioUrl));

  useEffect(() => {
    const audio = audioRef.current;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    const handleSongEnd = () => {
      setTimeout(() => {
        onNextSong();
      }, 1000); // 1 second delay before the next song starts
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleSongEnd);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleSongEnd);
    };
  }, [isPlaying, currentSong, onNextSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.play().catch(error => console.error("Error playing audio:", error));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (currentSong) {
      const audio = audioRef.current;
      audio.src = currentSong.audioUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch(error => console.error("Error playing audio:", error));
      }
    }
  }, [currentSong]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const volumeValue = parseFloat(e.target.value);
    setVolume(volumeValue);
    audioRef.current.volume = volumeValue;
  };

  const handleTimeUpdate = (e) => {
    const timeValue = parseFloat(e.target.value);
    audioRef.current.currentTime = timeValue;
    setCurrentTime(timeValue);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentSong) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#b5b5f0] p-4 shadow-lg border-t-4 border-[#a0a0e0] rounded-t-lg z-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img src={currentSong.imageUrl} alt={currentSong.songName} className="w-16 h-16 rounded-lg mr-4 object-cover" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{currentSong.songName}</h3>
            <p className="text-sm text-gray-600">{currentSong.artistName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onPreviousSong} className="text-gray-600 hover:text-purple-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handlePlayPause}
            className="bg-purple-600 text-white rounded-full p-3 hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          <button onClick={onNextSong} className="text-gray-600 hover:text-purple-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-xs text-gray-500 w-10">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleTimeUpdate}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xs text-gray-500 w-10">{formatTime(duration)}</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </div>
    </div>
  );
};

export default SongPlayer;
