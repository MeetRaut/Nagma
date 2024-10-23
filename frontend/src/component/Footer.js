const Footer = () => {
    return (
      <footer className="bg-gray-800 text-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center">
            <div className="w-full md:w-1/3 text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-white">MusicStream</h2>
              <p className="mt-2 text-sm text-gray-400">
                Your go-to platform for chill and soothing music.
              </p>
            </div>
  
            <div className="w-full md:w-1/3 text-center mb-4 md:mb-0">
              <ul className="flex justify-center space-x-6">
                <li>
                  <a href="/" className="hover:text-white">Home</a>
                </li>
                <li>
                  <a href="/playlists" className="hover:text-white">Playlists</a>
                </li>
                <li>
                  <a href="/about" className="hover:text-white">About Us</a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white">Contact</a>
                </li>
              </ul>
            </div>
  
            <div className="w-full md:w-1/3 text-center md:text-right">
              <p className="text-sm text-gray-400">&copy; 2024 MusicStream. All rights reserved.</p>
              <ul className="flex justify-center md:justify-end space-x-4 mt-2">
                <li>
                  <a href="https://facebook.com" className="hover:text-white">
                    <i className="fab fa-facebook-f"></i> Facebook
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com" className="hover:text-white">
                    <i className="fab fa-twitter"></i> Twitter
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com" className="hover:text-white">
                    <i className="fab fa-instagram"></i> Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;  