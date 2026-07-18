import React, { useEffect } from'react';
import { Outlet, useLocation } from'react-router-dom';
import Navbar from'../components/layout/Navbar';
import Footer from'../components/layout/Footer';
import { useAuth } from'../context/AuthContext';

const MainLayout = () => {
 const { pathname } = useLocation();
 const { isAuthenticated } = useAuth();

 useEffect(() => {
 window.scrollTo(0, 0);
 }, [pathname]);

  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');
  const showSidebar = isAuthenticated && isDashboardRoute;

  return (
  <div className={`flex flex-col min-h-screen ${showSidebar ? 'md:pl-72' : ''}`}>
  <Navbar />
 <main className="flex-grow pt-24 pb-12">
 <Outlet />
 </main>
 <Footer />
 </div>
 );
};

export default MainLayout;
