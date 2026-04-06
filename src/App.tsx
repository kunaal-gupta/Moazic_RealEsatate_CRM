import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './MainLayout';
import Dashboard from './pages/Dashboard';
import Deals from './pages/Deals';
import Contacts from './pages/Contacts';
import Properties from './pages/Properties';
import Showings from './pages/Showings';
import Tasks from './pages/Tasks';
import Email from './pages/Email';
import Settings from './pages/Settings';
import DealDetail from './pages/DealDetail';

// Placeholder components for other pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-500">
    <h1 className="text-2xl font-bold mb-2">{title}</h1>
    <p>This page is under construction.</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="deals" element={<Deals />} />
          <Route path="deals/:id" element={<DealDetail />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="properties" element={<Properties />} />
          <Route path="showings" element={<Showings />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="email" element={<Email />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
