import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [results, setResults] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    const testResults = {};
    
    try {
      // Test 1: Check environment variables
      console.log('🔍 Testing environment variables...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      testResults.envVars = {
        url: supabaseUrl ? '✅ URL configurée' : '❌ URL manquante',
        key: supabaseKey ? '✅ Clé configurée' : '❌ Clé manquante',
        urlValue: supabaseUrl || 'Non définie',
        keyValue: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Non définie'
      };

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Variables d\'environnement manquantes');
      }

      // Test 2: Basic connection
      console.log('🔍 Testing basic connection...');
      const { data: healthCheck, error: healthError } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });
      
      if (healthError) {
        testResults.connection = `❌ Erreur: ${healthError.message}`;
      } else {
        testResults.connection = '✅ Connexion réussie';
      }

      // Test 3: Authentication status
      console.log('🔍 Testing authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        testResults.auth = `❌ Erreur auth: ${authError.message}`;
      } else {
        testResults.auth = user ? `✅ Utilisateur connecté: ${user.email}` : '⚠️ Aucun utilisateur connecté';
      }

      // Test 4: Check tables existence
      console.log('🔍 Testing tables...');
      const tables = ['users', 'prouts', 'ratings'];
      const tableResults = {};
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            tableResults[table] = `❌ ${error.message}`;
          } else {
            tableResults[table] = `✅ Table existe (${data?.length || 0} lignes)`;
          }
        } catch (err) {
          tableResults[table] = `❌ ${err.message}`;
        }
      }
      testResults.tables = tableResults;
      
      // Test 5.5: Test specific prouts query
      console.log('🔍 Testing prouts query specifically...');
      try {
        const { data: proutsTest, error: proutsTestError } = await supabase
          .from('prouts')
          .select('*')
          .limit(5);
          
        if (proutsTestError) {
          testResults.proutsQuery = `❌ Erreur requête prouts: ${proutsTestError.message}`;
        } else {
          testResults.proutsQuery = `✅ Requête prouts OK (${proutsTest?.length || 0} résultats)`;
        }
      } catch (err) {
        testResults.proutsQuery = `❌ ${err.message}`;
      }

      // Test 5: Storage bucket
      console.log('🔍 Testing storage...');
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
          testResults.storage = `❌ Erreur storage: ${bucketError.message}`;
        } else {
          const notemaprout2Bucket = buckets.find(b => b.name === 'notemaprout2');
          testResults.storage = notemaprout2Bucket 
            ? '✅ Bucket notemaprout2 trouvé' 
            : '⚠️ Bucket notemaprout2 non trouvé';
        }
      } catch (err) {
        testResults.storage = `❌ ${err.message}`;
      }

      setConnectionStatus('success');
      setResults(testResults);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      setConnectionStatus('error');
      setError(error.message);
      setResults(testResults);
    }
  };

  const retryTest = () => {
    setConnectionStatus('testing');
    setError('');
    setResults({});
    testConnection();
  };

  return (
    <div className="gaming-card rounded-xl p-6 shadow-2xl max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gaming-primary flex items-center">
          <span className="mr-3 text-3xl">🔧</span>
          Test de Connexion Supabase
        </h2>
        <button
          onClick={retryTest}
          className="btn-gaming-secondary px-4 py-2 rounded-lg font-bold transform hover:scale-105 transition-all duration-300"
        >
          <span className="mr-2">🔄</span>
          Retester
        </button>
      </div>

      {connectionStatus === 'testing' && (
        <div className="text-center py-8">
          <div className="gaming-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-white text-lg">Test de la connexion en cours...</p>
        </div>
      )}

      {error && (
        <div className="gaming-error px-6 py-4 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <span className="font-medium">Erreur Critique: {error}</span>
          </div>
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <div className="space-y-6">
          {/* Environment Variables */}
          {results.envVars && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gaming-secondary mb-3 flex items-center">
                <span className="mr-2">🔐</span>
                Variables d'Environnement
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">{results.envVars.url}</p>
                <p className="text-gray-300">{results.envVars.key}</p>
                <p className="text-xs text-gray-500">URL: {results.envVars.urlValue}</p>
                <p className="text-xs text-gray-500">Key: {results.envVars.keyValue}</p>
              </div>
            </div>
          )}

          {/* Connection Status */}
          {results.connection && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gaming-secondary mb-3 flex items-center">
                <span className="mr-2">🌐</span>
                Connexion de Base
              </h3>
              <p className="text-gray-300">{results.connection}</p>
            </div>
          )}

          {/* Authentication */}
          {results.auth && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gaming-secondary mb-3 flex items-center">
                <span className="mr-2">👤</span>
                Authentification
              </h3>
              <p className="text-gray-300">{results.auth}</p>
            </div>
          )}

          {/* Tables */}
          {results.tables && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gaming-secondary mb-3 flex items-center">
                <span className="mr-2">🗃️</span>
                Tables de Base de Données
              </h3>
              <div className="space-y-2">
                {Object.entries(results.tables).map(([table, status]) => (
                  <p key={table} className="text-gray-300">
                    <span className="font-mono text-cyan-400">{table}:</span> {status}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Storage */}
          {results.storage && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gaming-secondary mb-3 flex items-center">
                <span className="mr-2">💾</span>
                Stockage (Storage)
              </h3>
              <p className="text-gray-300">{results.storage}</p>
            </div>
          )}
          
          {/* Prouts Query Test */}
          {results.proutsQuery && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gaming-secondary mb-3 flex items-center">
                <span className="mr-2">🎵</span>
                Test Requête Prouts
              </h3>
              <p className="text-gray-300">{results.proutsQuery}</p>
            </div>
          )}
        </div>
      )}

      {connectionStatus === 'success' && (
        <div className="gaming-success px-6 py-4 rounded-lg mt-6">
          <div className="flex items-center justify-center">
            <span className="text-2xl mr-3">✅</span>
            <span className="font-medium">Tests de connexion terminés !</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;