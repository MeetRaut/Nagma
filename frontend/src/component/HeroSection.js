// src/components/HeroSection.js
import React, { useEffect, useState } from "react";

const HeroSection = () => {
  const [greeting, setGreeting] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      // Get current hour
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
        setGreeting(`Good Morning, ${storedUsername}`);
      } else if (currentHour < 18) {
        setGreeting(`Good Afternoon, ${storedUsername}`);
      } else {
        setGreeting(`Good Evening, ${storedUsername}`);
      }
    }
  }, []);

  return (
    <div className="relative flex items-center justify-center h-screen bg-gradient-to-r from-purple-600 to-pink-500">
      <div className="absolute inset-0 bg-black opacity-30"></div> {/* Overlay for contrast */}
      <div className="relative z-10 text-center text-white p-8">
        {greeting && (
          <h2 className="text-4xl font-semibold mb-4 p-1 bg-gradient-to-r from-yellow-400 to-pink-600 bg-clip-text text-transparent ">
            {greeting}
          </h2>
        )}
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-pink-600 bg-clip-text text-transparent ">
          Feel the Sound of You!
        </h1>
        <p className="text-lg mb-6 ">
          Discover new artists, create playlists, and enjoy ad-free listening. Unlimited music at your fingertips!
        </p>

        {/* Additional Content */}
        <div className="flex justify-center space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <span className="bg-purple-700 p-2 rounded-full">🎵</span>
            <span>Over 1 million tracks</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-700 p-2 rounded-full">🎧</span>
            <span>Exclusive artist releases</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-700 p-2 rounded-full">🔊</span>
            <span>High-fidelity audio</span>
          </div>
        </div>

        <a
          href="#"
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg transition-colors duration-300 font-semibold"
        >
          Start Listening
        </a>
      </div>
    </div>
  );
};

export default HeroSection;
