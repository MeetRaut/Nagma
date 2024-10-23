import React, { useState, useEffect } from "react";
import Chatbot from "./Chatbot"; // Import the Chatbot component

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if user is logged in and retrieve username
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    setIsLoggedIn(!!token);
    setUsername(storedUsername || '');
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    localStorage.removeItem('username'); // Clear the username
    setIsLoggedIn(false); // Update state on logout
    setUsername(''); // Clear username from state
  };

  return (
    <nav className="bg-gray-900 text-white px-4 py-2 flex justify-between items-center fixed top-0 left-0 w-full z-50">
      {/* Logo and Name */}
      <a href="/">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-full border-2 border-white" />
          <span className="text-xl font-bold">Nagma</span>
        </div>
      </a>

      {/* Search Bar */}
      {/* <div className="flex-grow mx-4 flex justify-end items-center">
        <input
          type="text"
          placeholder="Search..."
          className="w-64 px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div> */}

      <div className="flex-grow mx-4 flex justify-end items-center">
        <input
          type="text"
          placeholder="Search..."
          className="w-64 px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Chatbot Icon */}
      <div className="relative mr-4">
        <Chatbot />
      </div>

      {/* Profile Icon */}
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="focus:outline-none border-2 border-purple-500 rounded-full"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
            alt="Profile"
            className="h-10 w-10 rounded-full"
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-20">
            <ul className="py-1">
              {isLoggedIn ? (
                <>
                  <li>
                    <span className="block px-4 py-2 bg-purple-500">Hello, {username}</span>
                  </li>
                  <li>
                    <a
                      href="/"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={handleLogout}
                    >
                      Logout
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a
                      href="/login"
                      className="block px-4 py-2 hover:bg-gray-200"
                    >
                      Login
                    </a>
                  </li>
                  <li>
                    <a
                      href="/register"
                      className="block px-4 py-2 hover:bg-gray-200"
                    >
                      Signup
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
