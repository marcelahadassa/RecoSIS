import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, requestRecommendations, getRecommendations } from '../services/apiService';
import starIcon from '../assets/star.png';
import FallingStars from '../components/FallingStars';

function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lastfmUsername, setLastfmUsername] = useState('');
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfile()
      .then(response => setUser(response.data.user))
      .catch(() => handleLogout());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('recosis-token');
    navigate('/login');
  };

  const pollForRecommendations = () => {
    setArtists([]);
    setSongs([]);
    const intervalId = setInterval(async () => {
      try {
        const response = await getRecommendations();
        if (response.data && response.data.recommendations) {
          const recs = response.data.recommendations;
          const newArtists = recs.filter(r => r.item_type === 'artists');
          const newSongs = recs.filter(r => r.item_type === 'songs');
          if (newArtists.length > 0 || newSongs.length > 0) {
            setArtists(newArtists);
            setSongs(newSongs);
            if (newArtists.length > 0 && newSongs.length > 0) {
              setIsLoading(false);
              clearInterval(intervalId);
            }
          }
        }
      } catch (err) {
        setError('Não foi possível buscar as recomendações.');
        setIsLoading(false);
        clearInterval(intervalId);
      }
    }, 5000);
    setTimeout(() => {
      clearInterval(intervalId);
      if (isLoading) {
        setIsLoading(false);
        setError("O pedido demorou demasiado a responder. Tente novamente.");
      }
    }, 60000);
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await requestRecommendations(lastfmUsername);
      pollForRecommendations();
    } catch (err) {
      setError('Ocorreu um erro ao solicitar as recomendações.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main font-sans text-white p-6 md:p-8 relative overflow-hidden">
      <FallingStars />
      
      <header className="absolute top-6 right-6 z-20 flex items-center gap-4"> {/* Aumentado o z-index para garantir */}
        {user && <span className="text-sm text-pink-200 hidden sm:inline">{user.email}</span>}
        <button onClick={handleLogout} className="bg-white/10 text-white font-bold text-xs py-2 px-4 rounded-full hover:bg-white/20 transition">
          Sair
        </button>
      </header>
      
      <div className="container mx-auto max-w-4xl flex flex-col items-center relative z-10 pt-16 md:pt-0">
        <div className="text-center mt-8 mb-10">
          <h1 className="font-display text-6xl relative inline-block">
              RecoSIS
              <img 
                src={starIcon} 
                alt="Estrela" 
                className="absolute -top-5 left-40 w-5 h-5" 
              />
          </h1>
          <p className="text-pink-100 text-sm mt-4 max-w-md mx-auto">
            Digite seu user e deixe sua sis achar as melhores novidades para você!
            </p>
        </div>

        <div className="w-full max-w-lg mb-12">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
              type="text"
              value={lastfmUsername}
              onChange={(e) => setLastfmUsername(e.target.value)}
              placeholder="@ Digite o seu usuário do last.fm"
              className="w-full px-6 py-3 text-gray-800 bg-white/90 rounded-full focus:outline-none focus:ring-4 focus:ring-pink-300 transition"
              required
            />
            <button type="submit" disabled={isLoading} className="bg-white text-main font-bold py-3 px-8 rounded-full hover:bg-pink-100 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? '...' : 'Buscar'}
            </button>
          </form>
          {error && <p className="text-pink-200 text-center mt-4">{error}</p>}
        </div>

        {isLoading ? (
          <div className="text-center text-pink-200 animate-pulse">
            <p className="text-xl">Sua sis está buscando novos artistas e músicas especiais para você...</p>
            <p className="text-sm mt-2">(Isso pode levar alguns segundos)</p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Artistas para você descobrir</h2>
              <ul className="space-y-3 text-pink-100">
                {artists.length > 0 ? (
                  artists.map(rec => <li key={rec.id} className="bg-black/20 p-3 rounded-lg transition hover:bg-black/40">{rec.item_name}</li>)
                ) : (
                  <li className="text-pink-200 text-sm">Aguardando recomendações...</li>
                )}
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Músicas para a sua playlist</h2>
              <ul className="space-y-3 text-pink-100">
                {songs.length > 0 ? (
                  songs.map(rec => <li key={rec.id} className="bg-black/20 p-3 rounded-lg transition hover:bg-black/40">{rec.item_name}</li>)
                ) : (
                  <li className="text-pink-200 text-sm">Aguardando recomendações...</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;