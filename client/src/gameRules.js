// client/src/gameRules.js

// Перевірка: чи перекриває стіна шлях між двома клітинками
export function isPathBlocked(x1, y1, x2, y2, walls) {
    if (x2 > x1) return walls.some(w => w.orientation === 'V' && w.x === x1 && (w.y === y1 || w.y === y1 - 1));
    if (x2 < x1) return walls.some(w => w.orientation === 'V' && w.x === x2 && (w.y === y1 || w.y === y1 - 1));
    if (y2 > y1) return walls.some(w => w.orientation === 'H' && w.y === y1 && (w.x === x1 || w.x === x1 - 1));
    if (y2 < y1) return walls.some(w => w.orientation === 'H' && w.y === y2 && (w.x === x1 || w.x === x1 - 1));
    return false;
}

// Головна функція: повертає масив координат [{x,y}, {x,y}...] куди можна піти
export function getValidMoves(player, opponent, walls) {
    if (!player) return [];
    const moves = [];
    const { x, y } = player;

    // 4 сусідні клітинки
    const candidates = [
        { x: x, y: y - 1 }, // Вгору
        { x: x, y: y + 1 }, // Вниз
        { x: x - 1, y: y }, // Вліво
        { x: x + 1, y: y }  // Вправо
    ];

    candidates.forEach(cand => {
        // 1. Чи в межах поля?
        if (cand.x < 0 || cand.x > 8 || cand.y < 0 || cand.y > 8) return;

        // 2. Чи блокує стіна?
        if (isPathBlocked(x, y, cand.x, cand.y, walls)) return;

        // 3. Чи зайнято суперником?
        const isOccupied = opponent && opponent.x === cand.x && opponent.y === cand.y;

        if (!isOccupied) {
            // Вільно -> додаємо
            moves.push(cand);
        } else {
            // Зайнято -> пробуємо перестрибнути
            const jumpX = cand.x + (cand.x - x);
            const jumpY = cand.y + (cand.y - y);

            // Перевіряємо, чи можна стрибнути (межі + стіна ЗА суперником)
            if (jumpX >= 0 && jumpX <= 8 && jumpY >= 0 && jumpY <= 8) {
                if (!isPathBlocked(cand.x, cand.y, jumpX, jumpY, walls)) {
                    moves.push({ x: jumpX, y: jumpY });
                }
            }
        }
    });

    return moves;
}