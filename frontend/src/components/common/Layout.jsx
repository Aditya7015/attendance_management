import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Chatbot from './Chatbot';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
      <Chatbot />
    </div>
  );
};

export default Layout;