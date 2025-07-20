import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('recosis-token');

  if (!token) {
    // se não houver token, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  return children; // se houver token, mostra a página solicitada (home)
}

export default ProtectedRoute;