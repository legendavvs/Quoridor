import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Lobby from './components/Lobby';
import Game from './components/Game';

const socket = io('http://localhost:3000');

function App() {
    const [isInGame, setIsInGame] = useState(false);
    const [roomId, setRoomId] = useState(null);
    const [error, setError] = useState('');
    const [myPlayerId, setMyPlayerId] = useState(null);

    // ДОДАЛИ: Стан гри зберігаємо тут, на рівні App
    const [gameState, setGameState] = useState(null);

    useEffect(() => {
        socket.on('connect', () => setMyPlayerId(socket.id));

        socket.on('roomCreated', (id) => {
            setRoomId(id);
            setIsInGame(true);
        });

        // ЗМІНА: Слухаємо оновлення гри тут, бо App існує завжди
        socket.on('gameUpdate', (newState) => {
            console.log("APP: Отримано оновлення гри", newState); // Лог для перевірки
            setGameState(newState);
        });

        socket.on('gameStart', (data) => {
            setRoomId(data.roomId);
            setIsInGame(true);
        });

        socket.on('error', (msg) => {
            setError(msg);
            setTimeout(() => setError(''), 3000);
        });

        return () => {
            socket.off('connect');
            socket.off('roomCreated');
            socket.off('gameStart');
            socket.off('gameUpdate'); // Не забуваємо відписуватись
            socket.off('error');
        };
    }, []);

    const createRoom = (password) => socket.emit('createRoom', password);
    const joinRoom = (id) => socket.emit('joinRoom', id);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
            {isInGame ? (
                // Передаємо gameState як пропс (властивість) у гру
                <Game
                    socket={socket}
                    roomId={roomId}
                    myPlayerId={myPlayerId}
                    gameState={gameState}
                />
            ) : (
                <Lobby createRoom={createRoom} joinRoom={joinRoom} error={error} />
            )}
        </div>
    );
}

export default App;