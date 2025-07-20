import React from 'react';

function FallingStars() {
  // Criamos uma quantidade de estrelas
  const starCount = 100;
  const stars = [];

  for (let i = 0; i < starCount; i++) {
    // Geramos valores aleatórios para cada estrela
    const style = {
      // Posição horizontal aleatória
      left: `${Math.random() * 100}%`,
      // Duração da animação aleatória (entre 5 e 15 segundos)
      animationDuration: `${Math.random() * 10 + 5}s`,
      // Atraso para começar a animação aleatório (entre 0 e 10 segundos)
      animationDelay: `${Math.random() * 10}s`,
      // Tamanho aleatório (entre 1px e 3px)
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
    };
    stars.push(style);
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {stars.map((style, index) => (
        <div
          key={index}
          className="absolute bg-white rounded-full animate-fall"
          style={style}
        />
      ))}
    </div>
  );
}

export default FallingStars;