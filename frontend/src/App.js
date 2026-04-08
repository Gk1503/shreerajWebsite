import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import WelcomeSection from './components/WelcomeSection';
import StatsSection from './components/StatsSection';
import IndustriesSection from './components/IndustriesSection';
import CapabilitiesSection from './components/CapabilitiesSection';
import CategoriesPage from './pages/CategoriesPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CataloguesPage from './pages/CataloguesPage';
import WishlistPage from './pages/WishlistPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserLogin from './pages/UserLogin';
import UserDashboard from './pages/UserDashboard';

function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <WelcomeSection />
      <StatsSection />
      <IndustriesSection />
      <CapabilitiesSection />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/product/:productId" element={<ProductDetailsPage />} />
          <Route path="/catalogues" element={<CataloguesPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
