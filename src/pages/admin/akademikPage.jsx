import { useState, useEffect } from 'react';
import MatkulTab from './tabs/matkulTab';
import DosenTab from './tabs/dosenTab';
import JadwalTab from './tabs/jadwalTab';

export default function AkademikPage() {
  const [activeTab, setActiveTab] = useState('matkul'); // Default tab

  return (
    <div className="bg-gray-50 min-h-screen pb-24 font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Sistem Akademik</h1>

        {/* Tab Navigation */}
        <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur py-2 mb-4 border-b border-gray-200">
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            <TabButton 
              label="📅 Jadwal Kuliah" 
              active={activeTab === 'jadwal'} 
              onClick={() => setActiveTab('jadwal')} 
            />
            <TabButton 
              label="👨‍🏫 Penugasan Dosen" 
              active={activeTab === 'dosen'} 
              onClick={() => setActiveTab('dosen')} 
            />
            <TabButton 
              label="📚 Mata Kuliah" 
              active={activeTab === 'matkul'} 
              onClick={() => setActiveTab('matkul')} 
            />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'matkul' && <MatkulTab />}
        {activeTab === 'dosen' && <DosenTab />}
        {activeTab === 'jadwal' && <JadwalTab />}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-all ${
        active ? 'bg-blue-600 text-white border-transparent' : 'bg-white text-gray-600 border-gray-300'
      }`}
    >
      {label}
    </button>
  );
}