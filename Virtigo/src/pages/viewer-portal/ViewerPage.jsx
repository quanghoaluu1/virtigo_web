import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import '../../styles/Content.css';

function ViewerPage() {
  return (
    <div className="viewer-page">
      <Header />
      <main className="viewer-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default ViewerPage;