import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const MyProutsPage = () => {
  const [user, setUser] = useState(null);
  const [prouts, setProuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadProuts();
  }, []);

  const checkAuthAndLoadProuts = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        navigate('/login', { replace: true });
        return;
      }
      
      setUser(currentUser);
      await loadMyProuts(currentUser.id);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const loadMyProuts = async (userId) => {
    try {
      console.log('Loading prouts for user:', userId);
      const { data, error } = await supabase
        .from('prouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading my prouts:', error);
        throw error;
      }

      console.log('Loaded prouts:', data);
      setProuts(data || []);
    } catch (error) {
      console.error('Error loading prouts:', error);
      setError('Erreur lors du chargement de vos prouts');
    }
  };

  const getAudioUrl = (filePath) => {
    const { data } = supabase.storage
      .from('notemaprout2')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const getFileName = (filePath) => {
    return filePath.split('/').pop() || 'Prout sans nom';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (proutId, filePath) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce prout ?')) {
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('notemaprout2')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('prouts')
        .delete()
        .eq('id', proutId)
        .eq('user_id', user.id);

      if (dbError) {
        throw dbError;
      }

      // Refresh the list
      await loadMyProuts(user.id);
    } catch (error) {
      console.error('Error deleting prout:', error);
      setError('Erreur lors de la suppression');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="gaming-card p-8 rounded-xl text-center">
          <div className="gaming-spinner w-12 h-12 mx-auto mb-4"></div>
          <span className="text-xl text-white">Chargement de vos prouts...</span>
        </div>
      </div>
    );
  }

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
                  <span className="text-gaming-primary">Mes</span>{' '}
                  <span className="text-gaming-secondary">Prouts</span>
                </h1>
                <p className="text-sm text-gray-400">Ma Collection Personnelle</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 border-blue-500"
              >
                <span className="mr-2">🏠</span>
                Dashboard
              </button>
              <button
                onClick={() => navigate('/tribunal')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 border-purple-500"
              >
                <span className="mr-2">⚖️</span>
                Le Tribunal
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 border-red-500"
              >
                <span className="mr-2">🚪</span>
                Quitter
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="gaming-card rounded-xl p-8 mb-8 shadow-2xl animate-bounce-in">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-float">🎵</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Ma Collection de <span className="text-gaming-primary">Prouts</span>
            </h2>
            <p className="text-gray-300 text-lg">
              Retrouvez tous vos enregistrements audio ici
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="gaming-error px-6 py-4 rounded-lg mb-6 animate-bounce-in">
            <div className="flex items-center justify-center">
              <span className="text-2xl mr-3">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Prouts List */}
        {prouts.length === 0 ? (
          <div className="gaming-card rounded-xl p-12 text-center shadow-xl">
            <div className="text-6xl mb-6">😔</div>
            <h3 className="text-2xl font-bold text-white mb-4">Aucun prout enregistré</h3>
            <p className="text-gray-300 mb-6">
              Vous n'avez pas encore enregistré de prouts. Commencez dès maintenant !
            </p>
            <button
              onClick={() => navigate('/studio')}
              className="btn-gaming-primary px-8 py-3 rounded-lg font-bold transform hover:scale-105 transition-all duration-300"
            >
              <span className="mr-2">🎙️</span>
              Aller au Studio
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {prouts.length} prout{prouts.length > 1 ? 's' : ''} enregistré{prouts.length > 1 ? 's' : ''}
              </h3>
              <button
                onClick={() => navigate('/studio')}
                className="btn-gaming-secondary px-6 py-2 rounded-lg font-bold transform hover:scale-105 transition-all duration-300"
              >
                <span className="mr-2">➕</span>
                Nouveau Prout
              </button>
            </div>

            {prouts.map((prout, index) => (
              <div 
                key={prout.id} 
                className="gaming-card rounded-xl p-6 shadow-xl animate-slide-in-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-lg font-bold text-gaming-primary mb-2">
                      🎵 {getFileName(prout.file_path)}
                    </h4>
                    <p className="text-gray-300 text-sm mb-2">
                      📅 {formatDate(prout.created_at)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      ⭐ {prout.notes} note{prout.notes > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex-1 max-w-md">
                    <audio 
                      controls 
                      src={getAudioUrl(prout.file_path)}
                      className="w-full"
                      onError={(e) => {
                        console.error('Audio loading failed for:', prout.file_path);
                        console.error('Audio URL:', getAudioUrl(prout.file_path));
                        e.target.style.display = 'none';
                        const errorDiv = e.target.nextElementSibling;
                        if (errorDiv && errorDiv.classList.contains('audio-error')) {
                          errorDiv.style.display = 'block';
                        }
                      }}
                      onLoadStart={() => console.log('Audio loading:', prout.file_path)}
                      style={{
                        filter: 'sepia(1) hue-rotate(200deg) saturate(2)',
                        borderRadius: '8px'
                      }}
                    />
                    <div className="audio-error text-center p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm" style={{ display: 'none' }}>
                      <span className="block mb-2">🚫 Fichier audio non accessible</span>
                      <span className="text-xs text-gray-500">Le bucket Supabase doit être configuré en accès public</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleDelete(prout.id, prout.file_path)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="mr-2">🗑️</span>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyProutsPage;