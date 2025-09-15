import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Gaming Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,107,53,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,53,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Animated Gaming Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-60"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-orange-400 rounded-full animate-ping opacity-70" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-50" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-60" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-green-400 rounded-full animate-ping opacity-70" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header Navigation */}
      <header className="relative z-20 px-6 py-4 bg-gradient-to-r from-gray-900/80 to-purple-900/80 backdrop-blur-sm border-b border-orange-500/30">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <img 
              src="/src/assets/AiArt_1757363396108-removebg-preview.png" 
              alt="Note Ma Prout Logo" 
              className="h-8 w-auto animate-pulse hover:animate-bounce transition-all duration-300 filter drop-shadow-lg"
            />
            <div className="text-xl font-bold">
              <span className="text-gaming-primary">NOTE MA</span>{' '}
              <span className="text-gaming-secondary">PROUT</span>
            </div>
          </div>
          
          <div></div>
        </nav>

        {/* Navigation Tabs for logged in users */}
        {user && (
          <div className="border-t border-orange-500/30 mt-4">
            <nav className="flex space-x-8 max-w-7xl mx-auto">
              <button
                onClick={() => navigate('/')}
                className="py-4 px-1 border-b-2 border-transparent text-gray-300 hover:text-white hover:border-orange-500 transition-all duration-300 font-medium"
              >
                🏠 Accueil
              </button>
              <button
                onClick={() => navigate('/my-prouts')}
                className="py-4 px-1 border-b-2 border-transparent text-gray-300 hover:text-white hover:border-cyan-500 transition-all duration-300 font-medium"
              >
                🎵 Mes Prouts
              </button>
              <button
                onClick={() => navigate('/tribunal')}
                className="py-4 px-1 border-b-2 border-transparent text-gray-300 hover:text-white hover:border-purple-500 transition-all duration-300 font-medium"
              >
                ⚖️ Le Tribunal
              </button>
            </nav>
          </div>
        )}

        {/* Date/Time Display */}
        <div className="absolute top-4 right-6 text-xs text-cyan-400 font-mono bg-gray-900/50 px-3 py-1 rounded border border-cyan-500/30">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: '2-digit' 
          }).toUpperCase()} {new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slide-in-left">
              <h1 className="text-6xl lg:text-8xl font-black text-white leading-none tracking-tight gaming-text-glow">
                LE SITE QUI DÉCHIRE TON SLIP
              </h1>
              
              <div className="space-y-4 text-lg text-gray-300 max-w-lg">
                <p>
                  Partage tes{' '}
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 font-bold rounded border-2 border-orange-400 shadow-lg">PROUTS</span>.{' '}
                  Note ceux des autres.{' '}
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 font-bold rounded border-2 border-cyan-400 shadow-lg">DÉFIE</span>{' '}
                  tes potes dans des duels épiques !
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Link to="/signup">
                  <button className="btn-gaming-primary px-8 py-4 font-bold text-lg w-full sm:w-auto rounded-lg transform hover:scale-105 transition-all duration-300">
                    REJOINDRE L'ARÈNE
                  </button>
                </Link>
                <Link to="/login">
                  <button className="btn-gaming-secondary px-8 py-4 font-bold text-lg w-full sm:w-auto rounded-lg transform hover:scale-105 transition-all duration-300">
                    CONNEXION
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Visual Element */}
            <div className="relative animate-slide-in-right">
              <div className="relative z-10">
                <img 
                  src="/src/assets/AiArt_1757363396108-removebg-preview.png" 
                  alt="Note Ma Prout Logo" 
                  className="w-full max-w-md mx-auto h-auto animate-float transition-all duration-500 hover:scale-110 filter drop-shadow-2xl"
                />
                
                {/* Bulles explosives devant le logo */}
                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-80 z-20 shadow-lg shadow-yellow-400/50"></div>
                <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-80 z-20 shadow-lg shadow-cyan-400/50" style={{animationDelay: '0.3s'}}></div>
                <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-pink-400 rounded-full animate-ping opacity-70 z-20 shadow-lg shadow-pink-400/50" style={{animationDelay: '0.6s'}}></div>
                <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-orange-400 rounded-full animate-ping opacity-75 z-20 shadow-lg shadow-orange-400/50" style={{animationDelay: '0.9s'}}></div>
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-ping opacity-80 z-20 shadow-lg shadow-purple-400/50" style={{animationDelay: '1.2s'}}></div>
                <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-70 z-20 shadow-lg shadow-green-400/50" style={{animationDelay: '1.5s'}}></div>
                <div className="absolute top-1/6 right-1/2 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75 z-20 shadow-lg shadow-blue-400/50" style={{animationDelay: '1.8s'}}></div>
                <div className="absolute bottom-1/2 left-1/4 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-65 z-20 shadow-lg shadow-red-400/50" style={{animationDelay: '2.1s'}}></div>
                <div className="absolute top-3/4 left-2/3 w-2 h-2 bg-indigo-400 rounded-full animate-ping opacity-80 z-20 shadow-lg shadow-indigo-400/50" style={{animationDelay: '2.4s'}}></div>
                <div className="absolute bottom-1/6 right-1/3 w-3 h-3 bg-teal-400 rounded-full animate-ping opacity-70 z-20 shadow-lg shadow-teal-400/50" style={{animationDelay: '2.7s'}}></div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20 animate-pulse blur-xl"></div>
              <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-20 animate-pulse blur-xl" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-20 animate-pulse blur-xl" style={{animationDelay: '2s'}}></div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20 bg-gradient-to-r from-gray-900/80 to-purple-900/80 backdrop-blur-sm border-y border-orange-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 gaming-card p-6 rounded-xl hover:scale-105 transition-all duration-300">
              <div className="text-4xl">💨</div>
              <h3 className="text-xl font-bold text-gaming-primary">PARTAGE TES PROUTS</h3>
              <p className="text-gray-300">Crée et partage tes meilleurs moments avec la communauté mondiale</p>
            </div>
            
            <div className="text-center space-y-4 gaming-card p-6 rounded-xl hover:scale-105 transition-all duration-300">
              <div className="text-4xl">⚔️</div>
              <h3 className="text-xl font-bold text-gaming-secondary">DÉFIE TES RIVAUX</h3>
              <p className="text-gray-300">Lance des duels épiques et prouve ta supériorité</p>
            </div>
            
            <div className="text-center space-y-4 gaming-card p-6 rounded-xl hover:scale-105 transition-all duration-300">
              <div className="text-4xl">🏆</div>
              <h3 className="text-xl font-bold text-yellow-400">DOMINE LES CLASSEMENTS</h3>
              <p className="text-gray-300">Grimpe dans les rankings et deviens une légende</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="stat-card p-6 rounded-xl">
              <div className="text-4xl font-black text-gaming-primary">1,337</div>
              <div className="text-sm text-gray-300 font-medium">PROUTEURS ACTIFS</div>
            </div>
            <div className="stat-card p-6 rounded-xl">
              <div className="text-4xl font-black text-gaming-secondary">42,069</div>
              <div className="text-sm text-gray-300 font-medium">PROUTS NOTÉS</div>
            </div>
            <div className="stat-card p-6 rounded-xl">
              <div className="text-4xl font-black text-yellow-400">666</div>
              <div className="text-sm text-gray-300 font-medium">DUELS ÉPIQUES</div>
            </div>
            <div className="stat-card p-6 rounded-xl">
              <div className="text-4xl font-black text-purple-400">27</div>
              <div className="text-sm text-gray-300 font-medium">PAYS CONQUIS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full opacity-10 blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  );
};

export default HomePage;