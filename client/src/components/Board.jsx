import { useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function Board({ gameState, onCellClick, isMyTurn, isRotated, mode, currentOrientation, pendingWall, validMoves = [] }) {
    const { p1, p2, walls, lastMove } = gameState; // Дістаємо lastMove
    const gridSize = 9;

    const [hoverCell, setHoverCell] = useState(null);

    const cells = Array.from({ length: gridSize * gridSize }, (_, i) => ({
        x: i % gridSize,
        y: Math.floor(i / gridSize)
    }));

    return (
        <div className="relative w-full h-full bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-2xl">

            {/* СІТКА */}
            <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-1 sm:gap-1.5" onMouseLeave={() => setHoverCell(null)}>
                {cells.map((cell) => {
                    const isP1 = p1.x === cell.x && p1.y === cell.y;
                    const isP2 = p2 && p2.x === cell.x && p2.y === cell.y;

                    const isValidMove = mode === 'move' && isMyTurn && validMoves.some(m => m.x === cell.x && m.y === cell.y);

                    // НОВЕ: Перевірка на участь у останньому ході
                    const isLastMoveSource = lastMove?.type === 'move' && lastMove.from.x === cell.x && lastMove.from.y === cell.y;
                    const isLastMoveDest = lastMove?.type === 'move' && lastMove.to.x === cell.x && lastMove.to.y === cell.y;

                    return (
                        <div
                            key={`${cell.x}-${cell.y}`}
                            onClick={() => onCellClick(cell.x, cell.y)}
                            onMouseEnter={() => setHoverCell({ x: cell.x, y: cell.y })}
                            className={clsx(
                                "relative rounded-[2px] sm:rounded transition-all duration-500 flex items-center justify-center",

                                // Базовий колір
                                "bg-slate-700/50",

                                // Підсвітка останнього ходу (Фіолетовий слід)
                                (isLastMoveSource || isLastMoveDest) && "bg-purple-500/20 ring-1 ring-purple-500/50",

                                // Курсори
                                isValidMove && "cursor-pointer hover:bg-slate-600",
                                mode === 'wall' && isMyTurn && cell.x < 8 && cell.y < 8 && "cursor-crosshair"
                            )}
                        >
                            {/* Зелена крапочка підсвітки (Hint) */}
                            {isValidMove && (
                                <div className="absolute w-3 h-3 rounded-full bg-green-500/50 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)] z-10"></div>
                            )}

                            {/* ФІШКИ */}
                            <div className={clsx("w-full h-full flex items-center justify-center pointer-events-none", isRotated && "rotate-180")}>

                                {isP1 && (
                                    <motion.div
                                        layoutId="p1-piece"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        className="w-[80%] h-[80%] rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] border-2 border-cyan-200 relative z-20"
                                    ></motion.div>
                                )}

                                {isP2 && (
                                    <motion.div
                                        layoutId="p2-piece"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        className="w-[80%] h-[80%] rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] border-2 border-rose-200 relative z-20"
                                    ></motion.div>
                                )}

                            </div>

                            {/* Привид стінки */}
                            {mode === 'wall' && pendingWall && pendingWall.x === cell.x && pendingWall.y === cell.y && (
                                <div className={clsx(
                                    "absolute z-30 bg-green-500/60 pointer-events-none animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]",
                                    isRotated && "rotate-180",
                                    pendingWall.orientation === 'H' ? "h-1 w-[210%] top-[106%] left-0" : "w-1 h-[210%] left-[106%] top-0"
                                )}></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ШАР СТІНОК */}
            <div className="absolute inset-0 pointer-events-none p-1 sm:p-1.5 grid grid-cols-9 grid-rows-9 gap-1 sm:gap-1.5">
                {walls.map((w, i) => {
                    // НОВЕ: Перевіряємо, чи це остання поставлена стінка
                    const isLastWall = lastMove?.type === 'wall' && lastMove.x === w.x && lastMove.y === w.y && lastMove.orientation === w.orientation;

                    return (
                        <div key={i}
                            className={clsx(
                                "absolute shadow-md shadow-black/50 z-10 transition-colors duration-500",
                                // Якщо це остання стінка - вона яскраво-жовта (майже біла), інакше - звичайна янтарна
                                isLastWall ? "bg-yellow-200 shadow-[0_0_10px_rgba(253,224,71,0.8)]" : "bg-amber-500"
                            )}
                            style={{
                                left: w.orientation === 'V' ? `calc(${(w.x + 1) * 11.11}% + 2px)` : `${w.x * 11.11}%`,
                                top: w.orientation === 'H' ? `calc(${(w.y + 1) * 11.11}% + 2px)` : `${w.y * 11.11}%`,
                                width: w.orientation === 'H' ? '21.5%' : '4px',
                                height: w.orientation === 'V' ? '21.5%' : '4px',
                            }}
                        ></div>
                    );
                })}
            </div>
        </div>
    );
}