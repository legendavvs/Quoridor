import { useState, useEffect, useRef } from 'react';
import Board from './Board';
import { User, Shield, Activity, RotateCw, Check, X, Trophy, Frown } from 'lucide-react';
import clsx from 'clsx';
import { getValidMoves } from '../gameRules';
import { sounds } from '../sounds';

export default function Game({ socket, roomId, myPlayerId, gameState }) {
    const [mode, setMode] = useState('move');
    const [wallOrientation, setWallOrientation] = useState('H');
    const [pendingWall, setPendingWall] = useState(null);
    const [winnerId, setWinnerId] = useState(null);
    const [possibleMoves, setPossibleMoves] = useState([]);

    // 1. Оголошуємо реф тут, зверху, щоб уникнути помилок
    const prevGameState = useRef(null);

    // Слухач події завершення гри
    useEffect(() => {
        socket.on('gameOver', ({ winnerId }) => {
            setWinnerId(winnerId);
        });

        // НОВЕ: Слухаємо скидання гри
        socket.on('gameReset', () => {
            setWinnerId(null);       // Прибираємо вікно перемоги
            setPendingWall(null);    // Скидаємо режими
            setMode('move');
        });

        return () => {
            socket.off('gameOver');
            socket.off('gameReset'); // Не забуваємо відписатись
        };
    }, [socket]);

    // Розрахунок підсвітки ходів
    useEffect(() => {
        if (!gameState || gameState.turn !== myPlayerId || winnerId) {
            setPossibleMoves([]);
            return;
        }

        const playerKey = gameState.p1.id === myPlayerId ? 'p1' : 'p2';
        const opponentKey = playerKey === 'p1' ? 'p2' : 'p1';

        const moves = getValidMoves(gameState[playerKey], gameState[opponentKey], gameState.walls);
        setPossibleMoves(moves);
    }, [gameState, myPlayerId, winnerId]);

    // Логіка звукових ефектів
    useEffect(() => {
        if (!gameState) return;

        // Якщо це перше завантаження - просто зберігаємо стан і виходимо
        if (!prevGameState.current) {
            prevGameState.current = gameState;
            return;
        }

        const prev = prevGameState.current;
        const curr = gameState;

        // 1. Перемога/Поразка
        if (!prev.winnerId && winnerId) {
            if (winnerId === myPlayerId) {
                sounds.win();
            } else {
                sounds.lose();
            }
        }
        // 2. Стінка поставлена (зменшилась кількість стінок)
        else if ((prev.p1.walls !== curr.p1.walls) || (prev.p2 && prev.p2.walls !== curr.p2.walls)) {
            sounds.wall();
        }
        // 3. Хід зроблено (змінилася черга, але стінки ті самі)
        else if (prev.turn !== curr.turn) {
            sounds.move();
        }

        // Оновлюємо реф
        prevGameState.current = curr;
    }, [gameState, winnerId, myPlayerId]);

    const handleCellClick = (x, y) => {
        if (winnerId) return;
        if (!gameState || gameState.turn !== myPlayerId) return;

        if (mode === 'move') {
            // Перевіряємо, чи хід валідний (для надійності)
            const isValid = possibleMoves.some(m => m.x === x && m.y === y);
            if (isValid) {
                socket.emit('movePiece', { roomId, x, y });
            }
        } else {
            if (x < 8 && y < 8) {
                setPendingWall({ x, y, orientation: wallOrientation });
            }
        }
    };

    const confirmWall = () => {
        if (pendingWall) {
            sounds.confirm(); // <--- Додав звук підтвердження
            socket.emit('placeWall', { roomId, x: pendingWall.x, y: pendingWall.y, orientation: pendingWall.orientation });
            setPendingWall(null);
            setMode('move');
        }
    };

    const cancelWall = () => {
        setPendingWall(null);
        setMode('move');
    };

    const toggleOrientation = () => {
        const newOri = wallOrientation === 'H' ? 'V' : 'H';
        setWallOrientation(newOri);
        if (pendingWall) {
            setPendingWall({ ...pendingWall, orientation: newOri });
        }
    };

    const leaveGame = () => window.location.reload();

    const handleRematch = () => {
        socket.emit('resetGame', { roomId });
    };
    if (!gameState) return <div className="text-white text-center mt-20">Завантаження...</div>;

    const isMyTurn = gameState.turn === myPlayerId;
    const player1 = gameState.p1;
    const player2 = gameState.p2;
    const shouldRotateBoard = myPlayerId === player1.id;
    const myWallsCount = myPlayerId === player1.id ? player1.walls : (player2 ? player2.walls : 0);
    const iWon = winnerId === myPlayerId;

    return (
        <div className="flex flex-col items-center min-h-screen bg-slate-900 p-2 sm:p-4 font-sans text-slate-100 relative">

            {/* МОДАЛКА ПЕРЕМОГИ */}
            {winnerId && (
                <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">

                        <div className="flex justify-center mb-6">
                            {iWon ? (
                                <div className="p-6 bg-yellow-500/20 rounded-full animate-bounce"><Trophy size={64} className="text-yellow-400" /></div>
                            ) : (
                                <div className="p-6 bg-slate-700/50 rounded-full"><Frown size={64} className="text-slate-400" /></div>
                            )}
                        </div>

                        <h2 className={clsx("text-3xl font-bold mb-2", iWon ? "text-yellow-400" : "text-slate-200")}>
                            {iWon ? "ТИ ПЕРЕМІГ!" : "Поразка"}
                        </h2>

                        <div className="flex flex-col gap-3 mt-8">
                            {/* Кнопка РЕВАНШ */}
                            <button
                                onClick={handleRematch}
                                className="w-full py-4 rounded-xl font-bold text-lg shadow-lg bg-green-600 hover:bg-green-500 text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
                            >
                                <RotateCw size={20} /> Зіграти ще раз
                            </button>

                            {/* Кнопка ВИХІД */}
                            <button
                                onClick={leaveGame}
                                className="w-full py-4 rounded-xl font-bold text-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                            >
                                Вийти в меню
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="w-full max-w-lg mb-6 flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700 backdrop-blur-sm">
                <div className={`flex items-center gap-2 transition-opacity ${gameState.turn === player1.id ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-black font-bold"><User size={18} /></div>
                    <div><div className="font-bold text-cyan-400">P1</div><div className="text-xs text-slate-400">{player1.walls} стін</div></div>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-mono text-slate-500 text-xs mb-1">ROOM: {roomId}</span>
                    {!winnerId && (isMyTurn ? <span className="text-green-400 font-bold text-sm animate-pulse flex items-center gap-1"><Activity size={14} /> Твій хід</span> : <span className="text-slate-500 text-sm">Хід суперника...</span>)}
                </div>
                <div className={`flex items-center gap-2 transition-opacity ${player2 && gameState.turn === player2.id ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="text-right"><div className="font-bold text-rose-400">P2</div><div className="text-xs text-slate-400">{player2 ? player2.walls : '...'} стін</div></div>
                    <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-black font-bold"><User size={18} /></div>
                </div>
            </div>

            {/* BOARD */}
            <div className={clsx("relative w-full max-w-[90vw] aspect-square sm:max-w-[500px] transition-transform duration-700 mb-6", shouldRotateBoard && "rotate-180")}>
                <Board
                    gameState={gameState}
                    onCellClick={handleCellClick}
                    isMyTurn={isMyTurn && !winnerId}
                    isRotated={shouldRotateBoard}
                    mode={mode}
                    currentOrientation={wallOrientation}
                    pendingWall={pendingWall}
                    validMoves={possibleMoves}
                />
            </div>

            {/* CONTROLS */}
            {mode === 'wall' && pendingWall ? (
                // МЕНЮ ПІДТВЕРДЖЕННЯ
                <div className="w-full max-w-lg flex gap-3 animate-fade-in-up">
                    <button onClick={cancelWall} className="flex-[1] bg-slate-700 hover:bg-slate-600 p-4 rounded-xl font-bold flex flex-col items-center justify-center text-slate-300">
                        <X size={24} />
                    </button>

                    <button onClick={toggleOrientation} className="flex-[2] bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg active:rotate-180 transition-all">
                        <RotateCw size={24} className={clsx("transition-transform duration-300", wallOrientation === 'V' && "rotate-90")} />
                        <span>Обернути</span>
                    </button>

                    <button onClick={confirmWall} className="flex-[3] bg-green-600 hover:bg-green-500 p-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                        <Check size={24} /> ТАК
                    </button>
                </div>
            ) : (
                // ГОЛОВНЕ МЕНЮ
                <div className="w-full max-w-lg grid grid-cols-2 gap-3">
                    <button onClick={() => setMode('move')} className={clsx("p-4 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-1", mode === 'move' ? "bg-slate-600 text-white ring-2 ring-cyan-400" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>
                        <User size={24} /> <span className="text-xs uppercase">Рухатись</span>
                    </button>
                    <button onClick={() => setMode('wall')} disabled={myWallsCount === 0 || !isMyTurn || winnerId} className={clsx("p-4 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-1 relative", mode === 'wall' ? "bg-amber-900/40 text-amber-400 ring-2 ring-amber-500" : "bg-slate-800 text-slate-400 hover:bg-slate-700", (myWallsCount === 0 || !isMyTurn || winnerId) && "opacity-50 cursor-not-allowed")}>
                        <Shield size={24} />
                        <span className="text-xs uppercase">Стіна</span>
                        <span className="absolute top-2 right-2 text-[10px] bg-slate-900 px-1 rounded text-slate-300">{myWallsCount}</span>
                    </button>
                </div>
            )}

            <div className="mt-4 text-slate-500 text-sm text-center">
                {winnerId ? "Гра закінчена." : (mode === 'wall' ? (pendingWall ? "Налаштуй та підтверди." : "Обери місце для стінки.") : "Обери сусідню клітинку для ходу.")}
            </div>
        </div>
    );
}