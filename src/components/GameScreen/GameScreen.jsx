import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ojosAbiertos from '../../assets/ojosAbiertos.png';
import ojosCerrados from '../../assets/ojosCerrados.png';
import './styles/gameScreen.css';

const GameScreen = () => {

    const [contador, setContador] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [audio, setAudio] = useState(null);
    const [mostrarOjosCerrados, setMostrarOjosCerrados] = useState(false);
    const [realPlayerPosition, setRealPlayerPosition] = useState(0);
    const audioRef = useRef(null);
    const intervalRef = useRef(null);
    const location = useLocation();
    const playerCount = location.state?.playerCount || 0; // por si llega undefined

    const zonaJuegoRef = useRef(null);
    const [zonaJuegoHeight, setZonaJuegoHeight] = useState(0);

    const [botPositions, setBotPositions] = useState(
      Array.from({ length: playerCount }, (_, i) => (i === Math.floor(playerCount / 2) ? 0 : 0))
    );
    const prevBotPositionsRef = useRef([...botPositions]);
    // Estado para saber si algún bot fue "eliminado" por moverse durante la fase de ojos abiertos
    const [jugadorRealEliminado, setJugadorRealEliminado] = useState(false);
    // Nuevo estado para llevar control de qué bots han sido eliminados
    const [botsEliminados, setBotsEliminados] = useState(Array(playerCount).fill(false));

    // Efecto que controla el contador que avanza cada segundo cuando el juego está en ejecución
    useEffect(() => {
        let intervalo;
      
        if (isRunning) {
          intervalo = setInterval(() => {
            setContador((prev) => prev + 1);
          }, 1000); // actualiza cada segundo
        }
        console.log(intervalo);
        setZonaJuegoHeight(zonaJuegoRef.current?.offsetHeight || 0);
        return () => clearInterval(intervalo); // limpieza
      }, [isRunning]);

    // Función para iniciar el juego, reproducir el audio y controlar la animación de los ojos
    const handlePlay = () => {
        if (isRunning) return;

        setIsRunning(true);
        const nuevoAudio = new Audio("/audio/jugaremos.mp3");
        nuevoAudio.loop = true;
        nuevoAudio.play();
        setAudio(nuevoAudio);
        audioRef.current = nuevoAudio;
        setMostrarOjosCerrados(true);

        const interval = setInterval(() => {
          const currentTime = audioRef.current?.currentTime;
          if (currentTime >= 5 && currentTime < 5.5) {
            setMostrarOjosCerrados(false);
          } else if (currentTime < 0.5) {
            setMostrarOjosCerrados(true);
          }
        }, 200);

        intervalRef.current = interval;
      };

    // Función para detener el juego y reiniciar todo el estado
    const handleStop = () => {
      setIsRunning(false);
      setContador(0);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      clearInterval(intervalRef.current);

      setMostrarOjosCerrados(false);
      setRealPlayerPosition(0);
      setJugadorRealEliminado(false);
      setBotPositions(Array.from({ length: playerCount }, () => 0));
      setBotsEliminados(Array(playerCount).fill(false));
      prevBotPositionsRef.current = Array(playerCount).fill(0);
    };

    // Nueva función para avanzar al jugador real en cada clic
    const handleRealPlayerStep = () => {
      const currentTime = audioRef.current?.currentTime;

      // Solo permitir avanzar si el jugador no está eliminado
      if (jugadorRealEliminado) return;

      // Si los ojos están abiertos, eliminar al jugador real y reiniciar posición
      if (currentTime >= 5 && currentTime < 5.5) {
        setJugadorRealEliminado(true);
        setRealPlayerPosition(0);
        return;
      }

      // Si los ojos están cerrados, permitir avanzar pero sin pasar la meta (300px)
      setRealPlayerPosition((prev) => Math.min(prev + 2, zonaJuegoHeight - 20));
    };

    // Función que renderiza los círculos que representan a los jugadores y bots en la pantalla
    const renderPlayers = () => {
      const middleIndex = Math.floor(playerCount / 2);

      return Array.from({ length: playerCount }, (_, i) => (
        <div
          key={i}
          className={`player-circle ${
            i === middleIndex ? 'jugador-real' : ''
          } ${i === middleIndex && jugadorRealEliminado ? 'eliminado' : ''} ${
            i !== middleIndex && botsEliminados[i] ? 'eliminado' : ''
          }`}
          style={{
            transform: `${
              (i !== middleIndex && botsEliminados[i]) || (i === middleIndex && jugadorRealEliminado)
                ? 'none'
                : `translateY(-${Math.min(i === middleIndex ? realPlayerPosition : botPositions[i], zonaJuegoHeight - 20)}px)`
            }`,
            transition: 'transform 0.3s ease'
          }}
        ></div>
      ));
    };

    // Efecto que mueve a los bots y "elimina" si alguno se mueve durante la fase de ojos abiertos
    useEffect(() => {
      if (!isRunning) return;

      const moverBots = setInterval(() => {
        const currentTime = audioRef.current?.currentTime;

        // Si está en fase de ojos cerrados (antes del segundo 5)
        if (currentTime < 5) {
          setBotPositions((prev) => {
            const updated = prev.map((pos, i) =>
              i === Math.floor(playerCount / 2) ? pos : pos + Math.random() * 10
            );
            prevBotPositionsRef.current = [...updated];
            return updated;
          });
        }

        // Si están los ojos abiertos, solo se eliminan bots que realmente se mueven en esta fase
        if (currentTime >= 5 && currentTime < 5.5) {
          setBotPositions((prevPositions) => {
            const nuevosEliminados = [...botsEliminados];
            const newPositions = prevPositions.map((pos, i) => {
              if (i === Math.floor(playerCount / 2)) return pos;
              if (nuevosEliminados[i]) return pos;

              const avance = Math.random() < 0.1 ? Math.random() * 10 : 0;
              const nuevaPos = pos + avance;

              if (nuevaPos !== prevBotPositionsRef.current[i]) {
                nuevosEliminados[i] = true;
              }

              return nuevaPos;
            });

            setBotsEliminados(nuevosEliminados);
            return newPositions;
          });
        }

        const middleIndex = Math.floor(playerCount / 2);
        const todosEnMeta = botPositions.every((pos, i) => {
          if (i === middleIndex) {
            return realPlayerPosition >= zonaJuegoHeight - 20 || jugadorRealEliminado;
          }
          return pos >= zonaJuegoHeight - 20 || botsEliminados[i];
        });

        if (todosEnMeta) {
          setIsRunning(false);
          setContador(0);
          clearInterval(intervalRef.current);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }
      }, 500);

      return () => clearInterval(moverBots);
    }, [isRunning, botPositions, botsEliminados, playerCount]);

  return (
    <div className='backgroundGameScreen'>
        <div className='zonaMuñeca'>
            <div className='zonaIzquierda'>
              <div className='iconosControladores'>
                <div className="iconosJuego">
                    <i className="bi bi-play-fill iconoJuegoPlay" onClick={handlePlay}></i>
                </div>
                <div className="iconosJuego">
                    <i className="bi bi-stop-fill iconoJuegoStop" onClick={handleStop}></i>
                </div>
              </div>

                <div className='contadorJuego'>
                    {String(Math.floor(contador / 60)).padStart(2, '0')}:
                    {String(contador % 60).padStart(2, '0')}
                </div>
            </div>
            
            {mostrarOjosCerrados ? (
              <img src={ojosCerrados} alt="Muñeca con ojos cerrados" className="ojosCerrados" />
            ) : (
              <img src={ojosAbiertos} alt="Muñeca con ojos abiertos" className="ojosAbiertos" />
            )}
            <div className='botones'>
                <button className='botonAvanzar' onClick={handleRealPlayerStep}>AVANZAR</button>
            </div>
        </div>

        <div className='zonaSeparadora'></div>
        <div className='zonaJuego' ref={zonaJuegoRef}>
          {renderPlayers()}
        </div>

    </div>
  );
};

export default GameScreen;