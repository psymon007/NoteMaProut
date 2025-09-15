import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const StudioPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      checkDailyAttempts();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        navigate('/login', { replace: true });
        return;
      }
      
      setUser(currentUser);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const checkDailyAttempts = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Pour l'instant, on utilise un système simple sans table recording_attempts
      // Vous pouvez créer cette table plus tard si nécessaire
      const storedAttempts = localStorage.getItem(`attempts_${user.id}_${today}`);
      const currentCount = storedAttempts ? parseInt(storedAttempts) : 0;
      setAttemptsLeft(3 - currentCount);
    } catch (error) {
      console.error('Error checking daily attempts:', error);
    }
  };

  const startRecording = async () => {
    if (attemptsLeft <= 0) {
      setError('Limite d\'essais atteinte pour aujourd\'hui. Revenez demain !');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setTimeLeft(10);
      
      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Erreur d\'accès au microphone. Vérifiez les permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (timeLeft <= 0) {
        setError('Enregistrement arrêté automatiquement après 10 secondes.');
      }
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setTimeLeft(10);
    setError('');
    setSuccess('');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const uploadRecording = async () => {
    if (!audioBlob || !user) return;

    setUploading(true);
    setError('');

    try {
      // Convert webm to a more compatible format if needed
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}.webm`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('notemaprout2')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Erreur lors de l'upload du fichier: ${uploadError.message}`);
      }

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('prouts')
        .insert({
          user_id: user.id,
          file_path: fileName,
          notes: 0
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Erreur lors de la sauvegarde des métadonnées: ${dbError.message}`);
      }

      // Update daily attempts counter in localStorage
      const today = new Date().toISOString().split('T')[0];
      const newCount = 3 - attemptsLeft + 1;
      localStorage.setItem(`attempts_${user.id}_${today}`, newCount.toString());

      setSuccess('🎉 Prout enregistré avec succès ! Il sera bientôt disponible pour notation.');
      setAttemptsLeft(prev => prev - 1);
      clearRecording();
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
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
          <span className="text-xl text-white">Chargement du Studio...</span>
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
                  <span className="text-gaming-primary">Studio</span>{' '}
                  <span className="text-gaming-secondary">d'Enregistrement</span>
                </h1>
                <p className="text-sm text-gray-400">Créez vos prouts épiques</p>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Studio Info */}
        <div className="gaming-card rounded-xl p-8 mb-8 shadow-2xl animate-bounce-in">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-float">🎙️</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Studio d'Enregistrement <span className="text-gaming-primary">Épique</span>
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Enregistrez vos prouts les plus légendaires en moins de 10 secondes !
            </p>
            
            {/* Attempts Counter */}
            <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg px-6 py-3 border border-blue-500/30">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="text-sm text-gray-400">Essais restants aujourd'hui</div>
                <div className="text-2xl font-bold text-gaming-secondary">{attemptsLeft}/3</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recording Interface */}
        <div className="gaming-card rounded-xl p-8 shadow-2xl">
          <div className="text-center space-y-6">
            
            {/* Timer Display */}
            {isRecording && (
              <div className="animate-bounce-in">
                <div className="text-6xl font-bold text-red-400 mb-2">{timeLeft}</div>
                <div className="text-lg text-gray-300">secondes restantes</div>
                <div className="w-full bg-gray-700 rounded-full h-4 mt-4">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${(10 - timeLeft) * 10}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Recording Controls */}
            {!audioBlob && (
              <div className="space-y-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={attemptsLeft <= 0}
                    className="btn-gaming-primary px-8 py-4 text-xl font-bold rounded-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="mr-3 text-2xl">🎙️</span>
                    {attemptsLeft <= 0 ? 'Limite Atteinte' : 'Démarrer l\'Enregistrement'}
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="btn-gaming-secondary px-8 py-4 text-xl font-bold rounded-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <span className="mr-3 text-2xl">⏹️</span>
                    Arrêter l'Enregistrement
                  </button>
                )}
                
                {attemptsLeft <= 0 && (
                  <p className="text-yellow-400 text-lg">
                    🕐 Revenez demain pour 3 nouveaux essais !
                  </p>
                )}
              </div>
            )}

            {/* Audio Playback */}
            {audioBlob && (
              <div className="space-y-6 animate-slide-in-left">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-2xl font-bold text-gaming-primary">Votre Prout Enregistré</h3>
                
                <audio 
                  controls 
                  src={audioUrl}
                  className="w-full max-w-md mx-auto"
                  style={{
                    filter: 'sepia(1) hue-rotate(200deg) saturate(2)',
                    borderRadius: '8px'
                  }}
                />
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={clearRecording}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="mr-2">🗑️</span>
                    Effacer et Recommencer
                  </button>
                  
                  <button
                    onClick={uploadRecording}
                    disabled={uploading}
                    className="btn-gaming-primary px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <span className="flex items-center">
                        <div className="gaming-spinner w-5 h-5 mr-2"></div>
                        Upload en cours...
                      </span>
                    ) : (
                      <>
                        <span className="mr-2">🚀</span>
                        Valider et Uploader
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="gaming-error px-6 py-4 rounded-lg animate-bounce-in">
                <div className="flex items-center justify-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="gaming-success px-6 py-4 rounded-lg animate-bounce-in">
                <div className="flex items-center justify-center">
                  <span className="text-2xl mr-3">✅</span>
                  <span className="font-medium">{success}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="gaming-card rounded-xl p-6 mt-8 shadow-xl">
          <h3 className="text-xl font-bold text-gaming-secondary mb-4 flex items-center">
            <span className="mr-3 text-2xl">📋</span>
            Instructions d'Utilisation
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-300">
            <div className="space-y-2">
              <p className="flex items-center">
                <span className="w-6 h-6 mr-3 text-lg">🎯</span>
                Maximum 10 secondes d'enregistrement
              </p>
              <p className="flex items-center">
                <span className="w-6 h-6 mr-3 text-lg">⚡</span>
                3 essais maximum par jour
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center">
                <span className="w-6 h-6 mr-3 text-lg">🎧</span>
                Écoutez avant de valider
              </p>
              <p className="flex items-center">
                <span className="w-6 h-6 mr-3 text-lg">🔄</span>
                Effacer ne compte pas comme essai
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudioPage;