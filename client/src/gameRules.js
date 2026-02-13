// client/src/gameRules.js

export function isPathBlocked(x1, y1, x2, y2, walls) {
    // Рух ВПРАВО (x1 -> x2)
    if (x2 > x1) return walls.some(w => w.orientation === 'V' && w.x === x1 && (w.y === y1 || w.y === y1 - 1));
    // Рух ВЛІВО (x2 < x1)
    if (x2 < x1) return walls.some(w => w.orientation === 'V' && w.x === x2 && (w.y === y1 || w.y === y1 - 1));
    // Рух ВНИЗ (y1 -> y2)
    if (y2 > y1) return walls.some(w => w.orientation === 'H' && w.y === y1 && (w.x === x1 || w.x === x1 - 1));
    // Рух ВВЕРХ (y2 < y1)
    if (y2 < y1) return walls.some(w => w.orientation === 'H' && w.y === y2 && (w.x === x1 || w.x === x1 - 1));

    return false;
}

export function getValidMoves(player, opponent, walls) {
    if (!player) return [];
    const moves = [];
    const { x, y } = player;

    // Сусідні клітинки
    const candidates = [
        { x: x, y: y - 1 }, // Вгору
        { x: x, y: y + 1 }, // Вниз
        { x: x - 1, y: y }, // Вліво
        { x: x + 1, y: y }  // Вправо
    ];

    candidates.forEach(cand => {
        // 1. Перевірка меж дошки
        if (cand.x < 0 || cand.x > 8 || cand.y < 0 || cand.y > 8) return;

        // 2. Перевірка стіни між МНОЮ і СУСІДНЬОЮ клітинкою
        if (isPathBlocked(x, y, cand.x, cand.y, walls)) return;

        // 3. Перевірка наявності суперника
        const isOccupied = opponent && opponent.x === cand.x && opponent.y === cand.y;

        if (!isOccupied) {
            // Клітинка вільна - додаємо як звичайний хід
            moves.push(cand);
        } else {
            // Клітинка зайнята - пробуємо СТРИБОК
            // Обчислюємо координати за спиною суперника
            const jumpX = cand.x + (cand.x - x);
            const jumpY = cand.y + (cand.y - y);

            // а) Чи стрибок в межах дошки?
            if (jumpX >= 0 && jumpX <= 8 && jumpY >= 0 && jumpY <= 8) {
                // б) Чи немає стіни ЗА спиною суперника (між суперником і точкою приземлення)?
                if (!isPathBlocked(cand.x, cand.y, jumpX, jumpY, walls)) {
                    moves.push({ x: jumpX, y: jumpY });
                }
            }
        }
    });

    return moves;
}