import { useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

// Додали validMoves = [] у пропси
export default function Board({ gameState, onCellClick, isMyTurn, isRotated, mode, currentOrientation, pendingWall, validMoves = [] }) {
    const { p1, p2, walls } = gameState;
    const gridSize = 9;

    const [hoverCell, setHoverCell] = useState(null);

    const cells = Array.from({ length: gridSize * gridSize }, (_, i) => ({
        x: i % gridSize,
        y: Math.floor(i / gridSize)
    }));

    return (
        <div className="relative w-full h-full bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-2xl">
            <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-1 sm:gap-1.5" onMouseLeave={() => setHoverCell(null)}>
                {cells.map((cell) => {
                    const isP1 = p1.x === cell.x && p1.y === cell.y;
                    const isP2 = p2 && p2.x === cell.x && p2.y === cell.y;

                    // --- НОВЕ: Перевіряємо, чи це дозволений хід ---
                    const isValidMove = mode === 'move' && isMyTurn && validMoves.some(m => m.x === cell.x && m.y === cell.y);

                    return (
                        <div
                            key={`${cell.x}-${cell.y}`}
                            onClick={() => onCellClick(cell.x, cell.y)}
                            onMouseEnter={() => setHoverCell({ x: cell.x, y: cell.y })}
                            className={clsx(
                                "relative rounded-[2px] sm:rounded transition-colors duration-200 flex items-center justify-center",
                                "bg-slate-700/50",
                                // Додаємо курсор-вказівник для валідних ходів
                                isValidMove && "cursor-pointer hover:bg-slate-600",
                                mode === 'wall' && isMyTurn && cell.x < 8 && cell.y < 8 && "cursor-crosshair"
                            )}
                        >
                            {/* --- НОВЕ: Малюємо зелену крапочку --- */}
                            {isValidMove && (
                                <div className="absolute w-3 h-3 rounded-full bg-green-500/50 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)] z-10"></div>
                            )}

                            {/* Фішки */}
                            <div className={clsx("w-full h-full flex items-center justify-center pointer-events-none", isRotated && "rotate-180")}>

                                {isP1 && (
                                    <motion.div
                                        layoutId="p1-piece" // Магія тут: React бачить, що це той самий елемент
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }} // Пружна анімація
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

                            {/* Привид стінки (без змін) */}
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

            {/* Стінки (без змін) */}
            <div className="absolute inset-0 pointer-events-none p-1 sm:p-1.5 grid grid-cols-9 grid-rows-9 gap-1 sm:gap-1.5">
                {walls.map((w, i) => (
                    <div key={i} className="absolute bg-amber-500 shadow-md shadow-black/50 z-10"
                        style={{
                            left: w.orientation === 'V' ? `calc(${(w.x + 1) * 11.11}% + 2px)` : `${w.x * 11.11}%`,
                            top: w.orientation === 'H' ? `calc(${(w.y + 1) * 11.11}% + 2px)` : `${w.y * 11.11}%`,
                            width: w.orientation === 'H' ? '21.5%' : '4px',
                            height: w.orientation === 'V' ? '21.5%' : '4px',
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
}