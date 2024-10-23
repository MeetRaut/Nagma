// src/components/Chatbot.js

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import botImage from "../images/bot.jpg"; // Bot avatar image
import './Chatbot.css'; // Import the CSS for styling

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false); // Manages the visibility of the chat window
  const [messages, setMessages] = useState([]); // Stores the conversation history
  const [input, setInput] = useState(''); // Holds the current user input
  const [isLoading, setIsLoading] = useState(false); // Tracks the loading state during API calls

  const userId = 'user123'; // Replace with dynamic user ID in production

  const messagesEndRef = useRef(null); // Reference to the end of the messages list

  // Function to toggle the chat window's visibility
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Function to handle sending messages
  const handleSend = async () => {
    if (input.trim()) {
      // Add user's message to the chat log
      setMessages((prev) => [...prev, { type: 'user', text: input }]);

      // Prepare the payload for the API
      const payload = {
        user_id: userId,
        message: input
      };

      // Set loading state to true to display the loading indicator
      setIsLoading(true);

      try {
        // Make the API call to the FastAPI Chatbot
        const response = await fetch('http://127.0.0.1:8000/api/chatbot/respond', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Add chatbot's response to the chat log
        setMessages((prev) => [...prev, { type: 'bot', text: data.response }]);
      } catch (error) {
        console.error('Error communicating with Chatbot API:', error);
        // Optionally, display an error message in the chat
        setMessages((prev) => [
          ...prev,
          { type: 'bot', text: "I'm sorry, something went wrong. Please try again later." }
        ]);
      }

      // Clear the input field and reset loading state
      setInput('');
      setIsLoading(false);
    }
  };

  // Function to handle pressing the Enter key to send messages
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // useEffect hook to automatically scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div className="relative">
      {/* Chatbot Icon Button */}
      <button
        onClick={handleToggle}
        className="focus:outline-none border-2 border-purple-500 rounded-full"
        aria-label="Toggle Chatbot"
      >
        <img
          src={botImage} // Replace with your chatbot icon URL
          alt="Chatbot"
          className="h-10 w-10 rounded-full"
        />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed top-15 right-20 bg-white rounded-lg shadow-lg w-[350px] h-[400px] p-4 flex flex-col border border-purple-600">
          {/* Chat Header */}
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <h2 className="text-lg font-semibold text-purple-600">Nagma Bot</h2>
            <button onClick={handleToggle} className="text-gray-500 hover:text-gray-700" aria-label="Close Chatbot">
              ✖️
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto pr-2" style={{ maxHeight: 'calc(100% - 80px)' }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex my-2 ${
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Bot Message */}
                {msg.type === 'bot' && (
                  <>
                    <img
                      src={botImage} // Bot avatar
                      alt="Bot"
                      className="h-8 w-8 rounded-full mr-2"
                    />
                    <div
                      className={`p-2 rounded-lg max-w-xs ${
                        msg.type === 'user'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                      style={{
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}
                    >
                      <span className="font-semibold">Nagma Bot:</span>
                      
                      <ReactMarkdown className="mt-1">
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </>
                )}

                {/* User Message */}
                {msg.type === 'user' && (
                  <>
                    <div
                      className={`p-2 rounded-lg max-w-xs ${
                        msg.type === 'user'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                      style={{
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}
                    >
                      <span className="font-semibold">You:</span>
                      <div>{msg.text}</div>
                    </div>
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png" // User avatar
                      alt="User"
                      className="h-8 w-8 rounded-full ml-2"
                    />
                  </>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex my-2 justify-start">
                <img
                  src={botImage} // Bot avatar
                  alt="Bot"
                  className="h-8 w-8 rounded-full mr-2"
                />
                <div className="p-2 rounded-lg bg-gray-200 text-gray-800 flex items-center max-w-xs">
                  <div className="loader mr-2"></div>
                  Typing...
                </div>
              </div>
            )}

            {/* Dummy div to scroll into view */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input and Send Section */}
          <div className="flex mt-2">
            <input
              type="text"
              className="border border-gray-300 rounded-lg p-2 flex-grow focus:outline-none focus:border-purple-600 text-black"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={handleKeyPress}
            />
            <button
              className="bg-purple-600 text-white rounded-lg px-4 ml-2 hover:bg-purple-700 transition disabled:bg-purple-300"
              onClick={handleSend}
              disabled={isLoading} // Disable button while loading
              aria-label="Send Message"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;