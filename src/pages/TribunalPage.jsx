import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const TribunalPage = () => {
  const [user, setUser] = useState(null);
  const [prouts, setProuts] = useState([]);
  const [ratings, setRatings] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [showRatingModal, setShowRatingModal] = useState(null);
  const [newRating, setNewRating] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      await loadAllProuts();
      await loadAllRatings(currentUser.id);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const loadAllProuts = async () => {
    try {
      console.log('🔍 Loading all prouts...');
      console.log('👤 Current user ID:', user?.id);
      
      // Test 1: Check if we can access prouts table at all
      const { data: testData, error: testError } = await supabase
        .from('prouts')
        .select('count', { count: 'exact', head: true });
        
      if (testError) {
        console.error('❌ Cannot access prouts table:', testError);
        throw new Error(`Impossible d'accéder à la table prouts: ${testError.message}`);
      }
      
      console.log('✅ Prouts table accessible, total count:', testData);
      
      // Test 2: Try to load all prouts without join first
      console.log('🔍 Loading prouts without join...');
      const { data: proutsOnly, error: proutsOnlyError } = await supabase
        .from('prouts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (proutsOnlyError) {
        console.error('❌ Error loading prouts only:', proutsOnlyError);
        throw proutsOnlyError;
      }
      
      console.log('✅ Prouts loaded (without join):', proutsOnly?.length || 0);
      console.log('📋 Prouts data:', proutsOnly?.slice(0, 2)); // Log first 2 for debugging
      
      // Test 3: Try with join
      console.log('🔍 Loading prouts with user join...');
      const { data: proutsData, error: proutsError } = await supabase
        .from('prouts')
        .select(`
          *,
          users!inner(name, country)
        `)
        .order('created_at', { ascending: false });
        
      if (proutsError) {
        console.error('Error loading prouts:', proutsError);
        console.log('⚠️ Join failed, using fallback method...');
        // If the join fails, try without the join
        const { data: proutsDataFallback, error: fallbackError } = await supabase
          .from('prouts')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
          throw fallbackError;
        }
        
        console.log('🔄 Using fallback data, loading users separately...');
        // Load user data separately for each prout
        const proutsWithUsers = await Promise.all(
          (proutsDataFallback || []).map(async (prout) => {
            console.log(`🔍 Loading user data for prout ${prout.id}, user_id: ${prout.user_id}`);
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('name, country')
              .eq('id', prout.user_id)
              .single();
            
            if (userError) {
              console.error(`❌ Error loading user ${prout.user_id}:`, userError);
            }
            
            return {
              ...prout,
              users: userData || { name: 'Prouteur Anonyme', country: null },
            };
          })
        );
        
        console.log('✅ Prouts with users (fallback):', proutsWithUsers.length);
        setProuts(proutsWithUsers);
        return;
      }
      
      console.log('✅ Prouts loaded:', proutsData?.length || 0);
      console.log('📋 Sample prout data:', proutsData?.slice(0, 1)); // Log first prout for debugging
      setProuts(proutsData || []);
      
    } catch (error) {
      console.error('Error loading prouts:', error);
      setError(`Erreur lors du chargement: ${error.message}`);
    }
  };

  const loadAllRatings = async (currentUserId) => {
    try {
      console.log('🔍 Loading all ratings...');
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (ratingsError) {
        console.error('Error loading ratings:', ratingsError);
        throw ratingsError;
      }
      
      console.log('✅ Ratings loaded:', ratingsData?.length || 0);
      
      // Group ratings by prout_id
      const ratingsByProut = {};
      const userRatingsByProut = {};
      
      ratingsData?.forEach((rating) => {
        if (!ratingsByProut[rating.prout_id]) {
          ratingsByProut[rating.prout_id] = [];
        }
        ratingsByProut[rating.prout_id].push(rating);
        if (rating.user_id === currentUserId) {
          userRatingsByProut[rating.prout_id] = rating;
        }
      });
      
      setRatings(ratingsByProut);
      setUserRatings(userRatingsByProut);
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const openRatingModal = (proutId) => {
    const existingRating = userRatings[proutId];
    setNewRating({
      rating: existingRating ? existingRating.rating : 5,
      comment: existingRating ? existingRating.comment || '' : '',
    });
    setShowRatingModal(proutId);
  };

  const submitRating = async () => {
    if (!showRatingModal || !user) return;
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('🔍 Submitting rating for prout:', showRatingModal);
      console.log('📊 Rating data:', newRating);
      
      const existingRating = userRatings[showRatingModal];
      
      if (existingRating) {
        console.log('🔄 Updating existing rating:', existingRating.id);
        const { data, error } = await supabase
          .from('ratings')
          .update({
            rating: newRating.rating,
            comment: newRating.comment.trim() || null,
          })
          .eq('id', existingRating.id)
          .select();
          
        if (error) throw error;
        console.log('✅ Rating updated successfully:', data);
      } else {
        console.log('➕ Creating new rating for prout:', showRatingModal);
        const { data, error } = await supabase
          .from('ratings')
          .insert({
            user_id: user.id,
            prout_id: showRatingModal,
            rating: newRating.rating,
            comment: newRating.comment.trim() || null,
          })
          .select();
          
        if (error) throw error;
        console.log('✅ Rating created successfully:', data);
      }
      
      // Reload ratings to update the UI
      await loadAllRatings(user.id);
      
      setSuccess('Note soumise avec succès !');
      setShowRatingModal(null);
      setNewRating({ rating: 5, comment: '' });
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRating = async (proutId) => {
    if (!user || !userRatings[proutId]) return;
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre note ?')) {
      return;
    }
    
    try {
      console.log('🗑️ Deleting rating:', userRatings[proutId].id);
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('id', userRatings[proutId].id);
        
      if (error) throw error;
      
      await loadAllRatings(user.id);
      setSuccess('Note supprimée avec succès !');
      
    } catch (error) {
      console.error('Error deleting rating:', error);
      setError(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  const getAverageRating = (proutId) => {
    const proutRatings = ratings[proutId] || [];
    if (proutRatings.length === 0) return 0;
    const sum = proutRatings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / proutRatings.length).toFixed(1);
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

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    
    return formatDate(dateString);
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
          <span className="text-xl text-white">Chargement du Tribunal...</span>
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
                  <span className="text-gaming-primary">Le</span>{' '}
                  <span className="text-gaming-secondary">Tribunal</span>
                </h1>
                <p className="text-sm text-gray-400">Tous les Prouts de la Communauté</p>
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
                onClick={() => navigate('/my-prouts')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 border-green-500"
              >
                <span className="mr-2">🎵</span>
                Mes Prouts
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
            <div className="text-6xl mb-4 animate-float">⚖️</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Le <span className="text-gaming-primary">Tribunal</span> des Prouts
            </h2>
            <p className="text-gray-300 text-lg">
              Découvrez tous les prouts de la communauté, triés par date
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

        {/* Success Message */}
        {success && (
          <div className="gaming-success px-6 py-4 rounded-lg mb-6 animate-bounce-in">
            <div className="flex items-center justify-center">
              <span className="text-2xl mr-3">✅</span>
              <span className="font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">🎵</div>
            <div className="text-2xl font-bold text-gaming-primary">{prouts.length}</div>
            <div className="text-sm text-gray-300">Prouts Total</div>
          </div>
          <div className="stat-card rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-gaming-secondary">
              {new Set(prouts.map(p => p.user_id)).size}
            </div>
            <div className="text-sm text-gray-300">Prouteurs Actifs</div>
          </div>
          <div className="stat-card rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-yellow-400">
              {Object.values(ratings).reduce((sum, proutRatings) => sum + proutRatings.length, 0)}
            </div>
            <div className="text-sm text-gray-300">Notes Données</div>
          </div>
        </div>

        {/* Prouts List */}
        {prouts.length === 0 ? (
          <div className="gaming-card rounded-xl p-12 text-center shadow-xl">
            <div className="text-6xl mb-6">🤐</div>
            <h3 className="text-2xl font-bold text-white mb-4">Le tribunal est vide</h3>
            <p className="text-gray-300 mb-6">
              Aucun prout n'a encore été partagé. Soyez le premier !
            </p>
            <button
              onClick={() => navigate('/studio')}
              className="btn-gaming-primary px-8 py-3 rounded-lg font-bold transform hover:scale-105 transition-all duration-300"
            >
              <span className="mr-2">🎙️</span>
              Enregistrer le Premier
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                Chronologie des Prouts ({prouts.length})
              </h3>
              <div className="text-sm text-gray-400">
                📅 Triés par date (plus récent en premier)
              </div>
            </div>

            {prouts.map((prout, index) => (
              <ProutCard 
                key={prout.id}
                prout={prout}
                index={index}
                user={user}
                ratings={ratings}
                userRatings={userRatings}
                getAverageRating={getAverageRating}
                getAudioUrl={getAudioUrl}
                getFileName={getFileName}
                getTimeAgo={getTimeAgo}
                openRatingModal={openRatingModal}
                deleteRating={deleteRating}
              />
            ))}
          </div>
        )}
      </main>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="gaming-card rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gaming-primary mb-4">
              ⭐ Noter ce Prout
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Note (1-10)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newRating.rating}
                    onChange={(e) => setNewRating({...newRating, rating: parseInt(e.target.value)})}
                    className="flex-1 accent-orange-500"
                    disabled={submitting}
                  />
                  <span className="text-2xl font-bold text-gaming-primary w-12 text-center">
                    {newRating.rating}
                  </span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-2xl">
                    {'⭐'.repeat(newRating.rating)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Commentaire (optionnel, max 50 caractères)
                </label>
                <textarea
                  value={newRating.comment}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) {
                      setNewRating({...newRating, comment: e.target.value});
                    }
                  }}
                  placeholder="Votre commentaire..."
                  className="gaming-input w-full p-3 rounded-lg resize-none h-20"
                  maxLength={50}
                  disabled={submitting}
                />
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {newRating.comment.length}/50
                </div>
              </div>
            </div>

            {error && (
              <div className="gaming-error px-4 py-2 rounded-lg mt-4 text-sm">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRatingModal(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 disabled:opacity-50"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                onClick={submitRating}
                className="flex-1 btn-gaming-primary px-4 py-2 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <div className="gaming-spinner w-4 h-4 mr-2"></div>
                    {userRatings[showRatingModal] ? 'Modification...' : 'Notation...'}
                  </span>
                ) : (
                  userRatings[showRatingModal] ? 'Modifier' : 'Noter'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant séparé pour chaque carte de prout
const ProutCard = ({ 
  prout, 
  index, 
  user,
  ratings, 
  userRatings, 
  getAverageRating, 
  getAudioUrl, 
  getFileName, 
  getTimeAgo, 
  openRatingModal,
  deleteRating
}) => {
  const [audioError, setAudioError] = useState(false);
  const audioUrl = getAudioUrl(prout.file_path);
  const userRating = userRatings[prout.id];
  const proutRatings = ratings[prout.id] || [];
  const averageRating = getAverageRating(prout.id);
  const isOwnProut = user && prout.user_id === user.id;

  return (
    <div 
      className="gaming-card rounded-xl p-6 shadow-xl animate-slide-in-left"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
            <span className="text-2xl">👤</span>
            <h4 className="text-lg font-bold text-gaming-primary">
              {prout.users?.name || 'Prouteur Anonyme'}
            </h4>
            {prout.users?.country && (
              <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
                🌍 {prout.users.country}
              </span>
            )}
          </div>
          <p className="text-gray-300 text-sm mb-1">
            🎵 {getFileName(prout.file_path)}
          </p>
          <p className="text-gray-400 text-xs mb-2">
            📅 {getTimeAgo(prout.created_at)}
          </p>
          <div className="flex items-center justify-center lg:justify-start space-x-4 text-sm">
            <span className="text-yellow-400">
              ⭐ {averageRating}/10 ({proutRatings.length} note{proutRatings.length > 1 ? 's' : ''})
            </span>
            {userRating && (
              <span className="text-cyan-400 text-xs bg-cyan-900/30 px-2 py-1 rounded">
                Votre note: {userRating.rating}/10
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 max-w-md">
          {!audioError ? (
            <audio 
              controls 
              src={audioUrl}
              className="w-full"
              onError={() => setAudioError(true)}
              style={{
                filter: 'sepia(1) hue-rotate(200deg) saturate(2)',
                borderRadius: '8px'
              }}
            />
          ) : (
            <div className="text-center p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <span className="block mb-2">🚫 Fichier audio non accessible</span>
              <span className="text-xs text-gray-500">Problème de configuration du bucket</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center space-y-2 min-w-[120px]">
          {!isOwnProut && (
            <>
              <button
                onClick={() => openRatingModal(prout.id)}
                className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                  userRating 
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                <span className="mr-2">⭐</span>
                {userRating ? 'Modifier' : 'Noter'}
              </button>
              
              {userRating && (
                <button
                  onClick={() => deleteRating(prout.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold transition-all duration-300 transform hover:scale-105"
                >
                  <span className="mr-1">🗑️</span>
                  Supprimer
                </button>
              )}
            </>
          )}
          
          {isOwnProut && (
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Votre prout</div>
              <div className="text-yellow-400 font-bold">
                ⭐ {averageRating}/10
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {proutRatings.length > 0 && (
        <div className="w-full mt-4 pt-4 border-t border-gray-600">
          <h4 className="text-sm font-bold text-gray-300 mb-3">
            💬 Commentaires ({proutRatings.filter(r => r.comment).length})
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {proutRatings
              .filter(rating => rating.comment && rating.comment.trim())
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((rating, idx) => (
                <div key={idx} className="bg-gray-800/50 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-yellow-400 font-bold">
                      {'⭐'.repeat(rating.rating)} ({rating.rating}/10)
                    </span>
                    <span className="text-xs text-gray-500">
                      {getTimeAgo(rating.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-300">{rating.comment}</p>
                </div>
              ))}
          </div>
          
          {/* Show all ratings summary */}
          <div className="mt-3 pt-2 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Toutes les notes:</span>
              <div className="flex space-x-1">
                {[...Array(10)].map((_, i) => {
                  const ratingValue = i + 1;
                  const count = proutRatings.filter(r => r.rating === ratingValue).length;
                  return count > 0 ? (
                    <span key={ratingValue} className="bg-gray-700 px-1 rounded text-xs">
                      {ratingValue}×{count}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TribunalPage;