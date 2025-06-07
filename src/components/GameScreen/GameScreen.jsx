import React, { useState } from 'react';
import ojosAbiertos from '../../assets/ojosAbiertos.png';
import jugaremos from '../../assets/jugaremos.mp3';
import './styles/gameScreen.css';

const GameScreen = () => {

  return (
    <div className='backgroundGameScreen'>
        <div className='zonaMuñeca'>
            <div className='zonaIzquierda'>
                <div className="iconosJuego">
                    <i className="bi bi-play-btn-fill iconoJuegoPlay"></i>
                    <i className="bi bi-stop-btn-fill iconoJuegoStop"></i>
                </div>
                <div className='contadorJuego'></div>
            </div>
            
            <img src={ojosAbiertos} alt="Muñeca con ojos abiertos" className="ojosAbiertos" />
        {/* Imagen de la muñeca con los ojos cerrados, se usará para mostrar el estado de "luz verde" */}
        {/* <img src="../../assets/ojosCerrados.png" alt="" className="ojosCerrados" /> */}
            <div className='botones'>
                <button className='botonAvanzar'>AVANZAR</button>
                <button className='botonParar'>PARAR</button>
            </div>
        </div>

        <div className='zonaSeparadora'></div>
        <div className='zonaJuego'></div>

    </div>
  );
};

export default GameScreen;