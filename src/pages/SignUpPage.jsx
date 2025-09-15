import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { francophoneCountries, regionsByCountry } from '../utils/countries';
import InputField from '../components/InputField';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: 'Non spécifié',
    country: '',
    region: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validation en temps réel
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (value.length < 2) {
          newErrors.name = 'Le nom doit contenir au moins 2 caractères';
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors.email = 'Adresse email invalide';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(value)) {
          newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule et 1 chiffre';
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (value !== formData.password) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      case 'birthDate':
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
            ? age - 1 : age;

          if (actualAge < 13) {
            newErrors.birthDate = 'Vous devez avoir au moins 13 ans pour vous inscrire';
          } else {
            delete newErrors.birthDate;
          }
        }
        break;

      case 'country':
        if (!value) {
          newErrors.country = 'Veuillez sélectionner un pays';
        } else {
          delete newErrors.country;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };
      
      // Reset region if country changes
      if (name === 'country') {
        newFormData.region = '';
      }
      
      return newFormData;
    });

    // Validate field on change
    validateField(name, value);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate all fields
      let isValid = true;
      Object.keys(formData).forEach(key => {
        if (key !== 'region' && key !== 'gender') { // region and gender are optional
          if (!validateField(key, formData[key])) {
            isValid = false;
          }
        }
      });

      if (!isValid) {
        throw new Error('Veuillez corriger les erreurs dans le formulaire');
      }

      // Sign up with Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          }
        }
      });

      if (authError) {
        if (authError.message === 'User already registered') {
          throw new Error('Cette adresse email est déjà utilisée');
        }
        throw new Error(authError.message);
      }

      // Insert user profile in database
      const { data: insertedProfile, error: dbError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          name: formData.name,
          email: formData.email,
          birth_date: formData.birthDate,
          gender: formData.gender,
          country: formData.country,
          region: formData.region || null,
          points: 0
        })
        .select()
        .single();

      if (dbError) {
        throw new Error('Erreur lors de la création du profil');
      }

      if (!insertedProfile) {
        throw new Error('Le profil n\'a pas pu être créé correctement');
      }

      navigate('/dashboard');
      
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center animate-bounce-in">
          <div className="logo-container mb-8">
            <img 
              src="/src/assets/AiArt_1757363396108-removebg-preview.png" 
              alt="Note Ma Prout Logo" 
              className="h-32 mx-auto logo-glow transform hover:scale-110 transition-all duration-500"
            />
          </div>
        </div>

        <form onSubmit={handleSignUp} className="mt-8 space-y-6 gaming-card p-8 rounded-xl shadow-2xl animate-slide-in-left">
          <h2 className="text-3xl font-extrabold text-white mb-2">
            <span className="text-gaming-secondary">Création</span>{' '}
            <span className="text-gaming-primary">Profil</span>
          </h2>
          <p className="text-gray-300">
            Dis moi qui veux-tu être?
          </p>
          <InputField
            label="Nom de Guerrier"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="Ton nom de bataille"
          />

          <InputField
            label="Email de Combat"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            placeholder="ton@email-gaming.com"
          />

          <InputField
            label="Mot de Passe Sécurisé"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            placeholder="Mot de passe ultra-sécurisé"
          />

          <InputField
            label="Confirmer le Mot de Passe"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            placeholder="Confirme ton mot de passe"
          />

          <InputField
            label="Date de Naissance"
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            error={errors.birthDate}
            required
          />

          <InputField label="Classe de Personnage" name="gender">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="gaming-select w-full p-3 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
            >
              <option value="Non spécifié">🎭 Mystérieux</option>
              <option value="Guerrier Pêteur">⚔️ Guerrier Pêteur - Chevalier aux prouts toxiques</option>
              <option value="Sorcier Flatulent">🔮 Sorcier Flatulent - Mage aux sorts gazeux</option>
              <option value="Elfe Pétomane">🧝 Elfe Pétomane - Créature gracieuse aux prouts floraux</option>
              <option value="Nain Fumeux">⛏️ Nain Fumeux - Artisan aux prouts volcaniques</option>
              <option value="Dragon Pétaradant">🐉 Dragon Pétaradant - Dragon aux prouts enflammés</option>
              <option value="Fée Gazouillante">🧚 Fée Gazouillante - Fée aux prouts scintillants</option>
              <option value="Ogre Bourdonnant">👹 Ogre Bourdonnant - Ogre aux prouts assourdissants</option>
              <option value="Sirène Bulleuse">🧜 Sirène Bulleuse - Sirène aux prouts musicaux</option>
              <option value="Licorne Explosive">🦄 Licorne Explosive - Licorne aux prouts colorés</option>
              <option value="Gobelin Puant">👺 Gobelin Puant - Gobelin aux prouts chimiques</option>
            </select>
          </InputField>

          <InputField label="Royaume d'Origine" name="country" error={errors.country} required>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`gaming-select w-full p-3 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all ${
                errors.country ? 'border-red-500' : ''
              }`}
              required
            >
              <option value="">🏰 Choisir ton royaume</option>
              {francophoneCountries.map((country) => (
                <option key={country} value={country}>🌍 {country}</option>
              ))}
            </select>
          </InputField>

          {formData.country && regionsByCountry[formData.country] && (
            <InputField label="Province" name="region">
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="gaming-select w-full p-3 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
              >
                <option value="">🗺️ Choisir ta province (optionnel)</option>
                {regionsByCountry[formData.country].map((region) => (
                  <option key={region} value={region}>📍 {region}</option>
                ))}
              </select>
            </InputField>
          )}

          {errors.general && (
            <div className="gaming-error px-4 py-3 rounded-lg animate-bounce-in">
              <div className="flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                <span className="font-medium">Erreur de Combat:</span>
                <span className="ml-2">{errors.general}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-gaming-primary w-full py-4 rounded-lg text-lg font-bold transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="gaming-spinner w-6 h-6 mr-3"></div>
                Création du Profil...
              </span>
            ) : (
              <>
                <span className="mr-3 text-2xl">🚀</span>
                Entrer dans l'Arène
              </>
            )}
          </button>

          <p className="text-center text-gray-300">
            Déjà un guerrier ?{' '}
            <Link to="/login" className="text-gaming-secondary hover:text-cyan-300 transition-colors font-bold">
              Se connecter à l'arène
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;