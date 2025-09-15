import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import InputField from '../components/InputField';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // Clear error on input change
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          throw new Error('Email ou mot de passe incorrect');
        }
        throw new Error(authError.message);
      }

      if (data.user) {
        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          throw new Error('Erreur lors de la vérification du profil');
        }

        if (!profile) {
          // Profile doesn't exist, redirect to signup
          await supabase.auth.signOut();
          throw new Error('Profil introuvable. Veuillez vous inscrire.');
        }

        navigate('/dashboard', { replace: true });
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center animate-bounce-in">
          <div className="logo-container mb-4">
            <img 
              src="/src/assets/AiArt_1757363396108-removebg-preview.png" 
              alt="Note Ma Prout Logo" 
              className="h-20 mx-auto logo-glow"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">
            <span className="text-gaming-secondary">Connexion</span>{' '}
            <span className="text-gaming-primary">Gamer</span>
          </h2>
          <p className="text-gray-300">
            Accède à ton arène de combat
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6 gaming-card p-8 rounded-xl shadow-2xl animate-slide-in-right">
          <InputField
            label="Email de Combat"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="ton@email-gaming.com"
          />

          <InputField
            label="Mot de Passe Secret"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Ton mot de passe ultra-secret"
          />

          {error && (
            <div className="gaming-error px-4 py-3 rounded-lg animate-bounce-in">
              <div className="flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                <span className="font-medium">Erreur d'Accès:</span>
                <span className="ml-2">{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-gaming-secondary w-full py-4 rounded-lg text-lg font-bold transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="gaming-spinner w-6 h-6 mr-3"></div>
                Connexion en cours...
              </span>
            ) : (
              <>
                <span className="mr-3 text-2xl">⚡</span>
                Entrer dans l'Arène
              </>
            )}
          </button>

          <div className="text-center space-y-4">
            <p className="text-gray-300">
              Pas encore de profil de guerrier ?{' '}
              <Link to="/signup" className="text-gaming-primary hover:text-orange-300 transition-colors font-bold">
                Créer un compte épique
              </Link>
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <span>🎮</span>
              <span>Rejoins la communauté gaming</span>
              <span>🏆</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;