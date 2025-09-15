import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          navigate('/login', { replace: true });
          return;
        }
        
        setUser(currentUser);

        // Get user profile
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        } else if (profile) {
          setUserProfile(profile);
        } else {
          // Profile doesn't exist, redirect to signup
          console.log('Profile not found, redirecting to signup');
          await supabase.auth.signOut();
          navigate('/signup', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error:', error);
        // If there's an auth error, sign out and redirect
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getRankIcon = (points) => {
    if (points >= 1000) return '👑';
    if (points >= 500) return '🏆';
    if (points >= 100) return '🥇';
    if (points >= 50) return '🥈';
    if (points >= 10) return '🥉';
    return '🌟';
  };

  const getRankTitle = (points) => {
    if (points >= 1000) return 'Légende Suprême';
    if (points >= 500) return 'Maître Prouteur';
    if (points >= 100) return 'Guerrier Élite';
    if (points >= 50) return 'Combattant Aguerri';
    if (points >= 10) return 'Apprenti Warrior';
    return 'Novice';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="gaming-card p-8 rounded-xl text-center">
          <div className="gaming-spinner w-12 h-12 mx-auto mb-4"></div>
          <span className="text-xl text-white">Chargement de l'arène...</span>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="gaming-card p-8 rounded-xl text-center">
          <div className="text-6xl mb-4">😕</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Gaming Header */}
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
                  <span className="text-gaming-primary">Note Ma</span>{' '}
                  <span className="text-gaming-secondary">Prout</span>
                </h1>
                <p className="text-sm text-gray-400">Arène de Combat</p>
              </div>
            </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/studio')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 border-purple-500"
            >
              <span className="mr-2">🎙️</span>
              STUDIO
            </button>
            <button
              onClick={() => navigate('/my-prouts')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 border-green-500"
            >
              <span className="mr-2">🎵</span>
              MES PROUTS
            </button>
            <button
              onClick={() => navigate('/tribunal')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 border-yellow-500"
            >
              <span className="mr-2">⚖️</span>
              LE TRIBUNAL
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 border-red-500"
            >
              <span className="mr-2">🚪</span>
              Quitter l'Arène
            </button>
          </div>
          </div>
        </div>
      </header>

      {/* Main Gaming Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Gaming Section */}
        <div className="gaming-card rounded-xl p-8 mb-8 shadow-2xl animate-bounce-in">
          <div className="flex items-center space-x-6">
            <div className="text-8xl animate-float">
              {getRankIcon(userProfile.points)}
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-2 text-white">
                Salut, <span className="text-gaming-primary">{userProfile.name}</span> !
              </h2>
              <p className="text-gaming-secondary text-xl mb-2">
                {getRankTitle(userProfile.points)}
              </p>
              <p className="text-gray-300 text-lg">
                Bienvenue dans ton QG de combat épique
              </p>
            </div>
          </div>
        </div>

        {/* Gaming Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card rounded-xl shadow-xl p-6 text-center animate-slide-in-left">
            <div className="text-4xl mb-3">👤</div>
            <h3 className="font-semibold text-gray-300 mb-2">Niveau Guerrier</h3>
            <p className="text-3xl font-bold text-gaming-primary">
              {calculateAge(userProfile.birth_date)} ans
            </p>
          </div>
          
          <div className="stat-card rounded-xl shadow-xl p-6 text-center animate-slide-in-left" style={{animationDelay: '0.1s'}}>
            <div className="text-4xl mb-3">🌍</div>
            <h3 className="font-semibold text-gray-300 mb-2">Royaume</h3>
            <p className="text-lg font-bold text-gaming-secondary">{userProfile.country}</p>
            {userProfile.region && (
              <p className="text-sm text-gray-400">{userProfile.region}</p>
            )}
          </div>

          <div className="stat-card rounded-xl shadow-xl p-6 text-center animate-slide-in-left" style={{animationDelay: '0.2s'}}>
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="font-semibold text-gray-300 mb-2">Points XP</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {userProfile.points.toLocaleString()}
            </p>
          </div>

          <div className="stat-card rounded-xl shadow-xl p-6 text-center animate-slide-in-left" style={{animationDelay: '0.3s'}}>
            <div className="text-4xl mb-3">{getRankIcon(userProfile.points)}</div>
            <h3 className="font-semibold text-gray-300 mb-2">Rang</h3>
            <p className="text-lg font-bold text-purple-400">{getRankTitle(userProfile.points)}</p>
          </div>
        </div>

        {/* Gaming Feature Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Leaderboards */}
          <div className="gaming-card rounded-xl shadow-2xl p-6 animate-slide-in-left">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-4">📊</span>
              <h3 className="text-2xl font-bold text-gaming-primary">Classements Épiques</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-500/30">
                <span className="text-white">🏆 Par âge (13-25 ans)</span>
                <span className="font-bold text-gaming-primary text-xl">#-</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-lg border border-green-500/30">
                <span className="text-white">🗺️ Par région</span>
                <span className="font-bold text-gaming-secondary text-xl">#-</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-lg border border-yellow-500/30">
                <span className="text-white">🌍 Par pays</span>
                <span className="font-bold text-yellow-400 text-xl">#-</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-500/30">
                <span className="text-white">⚡ Points d'expérience</span>
                <span className="font-bold text-purple-400 text-xl">#-</span>
              </div>
            </div>
          </div>

          {/* Combat Arena */}
          <div className="gaming-card rounded-xl shadow-2xl p-6 animate-slide-in-right">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-4">⚔️</span>
              <h3 className="text-2xl font-bold text-gaming-secondary">Arène de Combat</h3>
            </div>
            <div className="text-center py-8">
              <div className="text-6xl mb-6 animate-bounce">🚀</div>
              <p className="text-gray-300 mb-6 text-lg">
                Les duels épiques arrivent bientôt !
              </p>
              <p className="text-gray-400 mb-6">
                Prépare-toi pour des combats légendaires
              </p>
              <button className="btn-gaming-primary px-8 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                <span className="mr-2">⚔️</span>
                Lancer un Défi
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="gaming-card rounded-xl shadow-2xl p-6 mb-8 animate-bounce-in">
          <div className="flex items-center mb-6">
            <span className="text-3xl mr-4">📝</span>
            <h3 className="text-2xl font-bold text-gaming-primary">Journal de Combat</h3>
          </div>
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🌟</div>
            <p className="text-gray-300 text-lg mb-4">
              Ton aventure commence maintenant !
            </p>
            <p className="text-gray-400">
              Commence à partager tes prouts pour voir ton activité ici
            </p>
          </div>
        </div>

        {/* Gaming Profile Info */}
        <div className="gaming-card rounded-xl shadow-2xl p-6 animate-slide-in-left">
          <div className="flex items-center mb-6">
            <span className="text-3xl mr-4">ℹ️</span>
            <h3 className="text-2xl font-bold text-gaming-secondary">Profil de Guerrier</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nom de Guerrier</label>
                <p className="text-white text-lg font-semibold">{userProfile.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email de Combat</label>
                <p className="text-white">{userProfile.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Classe</label>
                <p className="text-white">{userProfile.gender}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Membre depuis</label>
                <p className="text-white">
                  {new Date(userProfile.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;