import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import starIcon from '../assets/star.png';


function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }
    try {
      const apiUrl = 'http://localhost:3000/api/auth/register';
      await axios.post(apiUrl, { email, password });
      alert('Registro realizado com sucesso! Você será redirecionado para a página de login.');
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Ocorreu um erro ao registrar.';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-main">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        
        {/* formulário */}
        <div className="flex flex-col justify-center items-center md:bg-white p-8 md:p-12">
          <div className="w-full max-w-sm">
            
            {/* telas menores */}
            <div className="md:hidden text-center mb-32 text-white">
                <h2 className="font-display text-6xl relative inline-block">
                    RecoSIS
                      <img 
                        src={starIcon} 
                        alt="Estrela" 
                        className="absolute -top-5 left-40 w-5 h-5"
                      />
                </h2>
                <p className="text-pink-100 mt-4 text-sm">
                  Sua <strong className="font-bold text-white">sis</strong> te mostra um mundo de novidades, como novos artistas favoritos e músicas que têm tudo a ver com você!
                </p>
            </div>
            
            <h1 className="text-4xl font-bold mb-2 text-white md:text-gray-800">Cadastre-se</h1>
            <p className="text-pink-100 md:text-gray-500 mb-8">
              Já tem uma conta?{' '}
              <a href="/login" className="text-white md:text-main font-bold hover:underline">
                Login
              </a>
            </p>
            
            {error && <p className="bg-red-100 text-red-700 text-center p-3 rounded-md mb-4">{error}</p>}

            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-white md:text-gray-800" htmlFor="email">E-mail</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-white md:text-gray-800" htmlFor="password">Senha</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main" required />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2 text-white md:text-gray-800" htmlFor="confirm-password">Confirmar Senha</label>
                <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Digite sua senha novamente" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main" required />
              </div>
              <button type="submit" className="w-full bg-white md:bg-main text-main md:text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition duration-300">
                Criar conta
              </button>
            </form>
          </div>
        </div>

        {/* personalização com bg rosa */}
        <div className="hidden md:flex flex-col justify-center items-center bg-main text-white p-12 text-center">
          <div className="w-full max-w-sm">
            <h2 className="font-display text-7xl mb-10 relative">
                RecoSIS
                <img 
                  src={starIcon} 
                  alt="Estrela" 
                  className="absolute -top-5 left-64 w-5 h-5"
                />
            </h2>
            <h3 className="text-2xl font-bold mb-8">
              Comece com o seu usuário do Last.fm
            </h3>
            <p className="text-pink-100">
              Sua <strong className="font-bold text-white">sis</strong> te mostra um mundo de novidades, como novos artistas favoritos e músicas que têm tudo a ver com você!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RegisterPage;