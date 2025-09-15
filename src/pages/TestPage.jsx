import React from 'react';
import { useNavigate } from 'react-router-dom';
import SupabaseTest from '../components/SupabaseTest';

const TestPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="gaming-header shadow-2xl border-b-2 border-yellow-400/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img 
                src="/src/assets/AiArt_1757363396108-removebg-preview.png" 
                alt="Note Ma Prout Logo" 
                className="h-12 logo-glow"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  <span className="text-gaming-primary">Test</span>{' '}
                  <span className="text-gaming-secondary">Supabase</span>
                </h1>
                <p className="text-sm text-gray-400">Diagnostic de Connexion</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 border-blue-500"
              >
                <span className="mr-2">🏠</span>
                Accueil
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SupabaseTest />
      </main>
    </div>
  );
};

export default TestPage;