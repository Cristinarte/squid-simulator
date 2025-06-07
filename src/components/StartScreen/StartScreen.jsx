import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logoRedimensionado.png';
import cancionInicio from '../../assets/cancionInicio.mp3';
import './styles/startScreen.css';

const StartScreen = () => {

  const [playerCount, setPlayerCount] = useState();
  const [gameMode, setGameMode] = useState();
  const navigate = useNavigate();

  const handlePlayerCountChange = (event) => {
    const selectedValue = Number(event.target.value);
    setPlayerCount(selectedValue);
    console.log(selectedValue); // esto sí muestra el valor correcto
  };

  const handleStartGame = () => {
    setGameMode(true);
    console.log('Juego empezado');
    navigate('/game');
  };

  const handleSelectClick = () => {
    const audioElement = document.getElementById('start-audio');
    if (audioElement) {
      audioElement.muted = false;
      audioElement.volume = 0.5;
      audioElement.play().catch((error) => {
        console.warn('Autoplay bloqueado por el navegador:', error);
      });
    }
  };

  return (
    <div className='backgroundScreen'>
        <audio id="start-audio" src={cancionInicio} loop muted />
        <img src={logo} alt="Logo del juego" className="logo" />
        <div className="mainTitle">LUZ ROJA, LUZ VERDE</div>
        <select value={playerCount} onChange={handlePlayerCountChange} onClick={handleSelectClick}>
          <option value="">Selecciona jugadores</option>
          <option value="10">10 jugadores</option>
          <option value="15">15 jugadores</option>
          <option value="20">20 jugadores</option>
        </select>
        <button className="startButton" onClick={handleStartGame}>COMENZAR PARTIDA</button>
    </div>
  );
};

export default StartScreen;