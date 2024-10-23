import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Import routing components
import Navbar from "./component/Navbar";
import Footer from './component/Footer';
import HeroSection from "./component/HeroSection";
import SongCarousel from "./component/SongCarousel";
import AlbumCarousel from "./component/AlbumCarousel";
import MoreSongs from "./component/MoreSongs";  // Import the MoreSongs component
// import Chatbot from "./component/Chatbot";
import Login from './component/Login';
import Register from './component/Register';

export default function App() {
  return (
    <Router>
      <Navbar />  {/* Keep Navbar outside Routes to display on all pages */}
      
      <Routes>
        <Route 
          path="/" 
          element={
            <>
              <HeroSection />
              <SongCarousel />
              <AlbumCarousel />
            </>
          } 
        />
        <Route 
          path="/more-songs" 
          element={<MoreSongs />} 
        />
        <Route 
          path="/login" 
          element={<Login />} 
        />
        <Route 
          path="/register" 
          element={<Register />} 
        />
      </Routes>

      <Footer />
    </Router>
  );
}
