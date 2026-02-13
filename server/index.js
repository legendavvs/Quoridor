import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { makeId } from './utils.js';

const ADMIN_PASSWORD = '123';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const clientRooms = {};

// --- ДОПОМІЖНА 1: Чи блокує стіна прохід між клітинками? ---
function isPathBlocked(x1, y1, x2, y2, walls) {
    if (x2 > x1) return walls.some(w => w.orientation === 'V' && w.x === x1 && (w.y === y1 || w.y === y1 - 1));
    if (x2 < x1) return walls.some(w => w.orientation === 'V' && w.x === x2 && (w.y === y1 || w.y === y1 - 1));
    if (y2 > y1) return walls.some(w => w.orientation === 'H' && w.y === y1 && (w.x === x1 || w.x === x1 - 1));
    if (y2 < y1) return walls.some(w => w.orientation === 'H' && w.y === y2 && (w.x === x1 || w.x === x1 - 1));
    return false;
}

// --- ДОПОМІЖНА 2 (НОВА): Перевірка шляху (BFS) ---
// Перевіряє, чи може гравець дійти до цільового ряду
function hasPath(startX, startY, targetRow, walls) {
    const queue = [{ x: startX, y: startY }];
    const visited = new Set();
    visited.add(`${startX},${startY}`);

    while (queue.length > 0) {
        const current = queue.shift();

        // Якщо дійшли до цільового ряду - шлях є!
        if (current.y === targetRow) return true;

        // Перевіряємо сусідів (вгору, вниз, вліво, вправо)
        const neighbors = [
            { x: current.x, y: current.y - 1 }, // Вгору
            { x: current.x, y: current.y + 1 }, // Вниз
            { x: current.x - 1, y: current.y }, // Вліво
            { x: current.x + 1, y: current.y }  // Вправо
        ];

        for (const neighbor of neighbors) {
            // 1. Чи в межах поля?
            if (neighbor.x >= 0 && neighbor.x < 9 && neighbor.y >= 0 && neighbor.y < 9) {
                const key = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(key)) {
                    // 2. Чи не заблоковано стіною?
                    if (!isPathBlocked(current.x, current.y, neighbor.x, neighbor.y, walls)) {
                        visited.add(key);
                        queue.push(neighbor);
                    }
                }
            }
        }
    }
    return false; // Черга пуста, шляху немає
}

io.on('connection', (socket) => {
    socket.on('createRoom', (password) => {
        if (password !== ADMIN_PASSWORD) return;

        // --- ЗМІНИ ТУТ ---
        let roomId = makeId(3); // Генеруємо 3 цифри

        // Захист: якщо такий номер вже є, генеруємо новий, поки не знайдемо вільний
        while (clientRooms[roomId]) {
            roomId = makeId(3);
        }
        // -----------------

        clientRooms[roomId] = {
            players: [socket.id],
            gameState: {
                p1: { x: 4, y: 0, walls: 10, id: socket.id },
                p2: null,
                walls: [],
                turn: socket.id
            }
        };

        socket.join(roomId);
        socket.emit('roomCreated', roomId);
        socket.emit('gameUpdate', clientRooms[roomId].gameState);
    });

    socket.on('joinRoom', (roomId) => {
        const room = clientRooms[roomId];
        if (room && room.players.includes(socket.id)) {
            socket.emit('gameUpdate', room.gameState);
            socket.emit('gameStart', { roomId });
            return;
        }
        if (!room || room.players.length >= 2) return;
        room.players.push(socket.id);
        room.gameState.p2 = { x: 4, y: 8, walls: 10, id: socket.id };
        socket.join(roomId);
        io.to(roomId).emit('gameUpdate', room.gameState);
        io.to(roomId).emit('gameStart', { roomId });
    });

    socket.on('movePiece', ({ roomId, x, y }) => {
        const room = clientRooms[roomId];
        if (!room || !room.gameState.p2) return; 

        const state = room.gameState;
        if (state.turn !== socket.id) return;

        const playerKey = state.p1.id === socket.id ? 'p1' : 'p2';
        const opponentKey = playerKey === 'p1' ? 'p2' : 'p1';
        const me = state[playerKey];
        const opponent = state[opponentKey];

        // Вектор руху
        const dx = Math.abs(me.x - x);
        const dy = Math.abs(me.y - y);
        const distance = dx + dy; // Манхеттенська відстань

        let isValidMove = false;

        // ВАРІАНТ 1: Звичайний хід (1 клітинка)
        if (distance === 1) {
            // Перевіряємо, чи не зайнято і чи немає стіни
            const isOccupied = (opponent.x === x && opponent.y === y);
            const isBlocked = isPathBlocked(me.x, me.y, x, y, state.walls);
            
            if (!isOccupied && !isBlocked) {
                isValidMove = true;
            }
        } 
        // ВАРІАНТ 2: Стрибок (2 клітинки по прямій)
        else if (distance === 2 && (dx === 2 || dy === 2)) {
            // Знаходимо клітинку "посередині" (де має стояти суперник)
            const midX = (me.x + x) / 2;
            const midY = (me.y + y) / 2;

            // 1. Чи стоїть там суперник?
            const hasOpponent = (opponent.x === midX && opponent.y === midY);
            
            // 2. Чи немає стіни між мною і суперником?
            const wall1 = isPathBlocked(me.x, me.y, midX, midY, state.walls);
            
            // 3. Чи немає стіни за спиною суперника (куди стрибаємо)?
            const wall2 = isPathBlocked(midX, midY, x, y, state.walls);

            if (hasOpponent && !wall1 && !wall2) {
                isValidMove = true;
            }
        }

        if (!isValidMove) return; // Хід не пройшов перевірку

        // Оновлюємо координати
        me.x = x;
        me.y = y;

        // Перевірка перемоги
        const p1Wins = playerKey === 'p1' && me.y === 8;
        const p2Wins = playerKey === 'p2' && me.y === 0;

        if (p1Wins || p2Wins) {
            io.to(roomId).emit('gameOver', { winnerId: me.id });
            io.to(roomId).emit('gameUpdate', state);
            return;
        }

        state.turn = opponent.id;
        io.to(roomId).emit('gameUpdate', state);
    });
    
    socket.on('placeWall', ({ roomId, x, y, orientation }) => {
        const room = clientRooms[roomId];
        if (!room || !room.gameState.p2) return;
        const state = room.gameState;
        if (state.turn !== socket.id) return;

        const playerKey = state.p1.id === socket.id ? 'p1' : 'p2';
        const player = state[playerKey];
        if (player.walls <= 0) return;

        // Перевірка накладання
        const isOverlap = state.walls.some(w => {
            if (w.x === x && w.y === y) return true;
            if (w.x === x && w.y === y && w.orientation !== orientation) return true;
            if (orientation === 'H') {
                if (w.orientation === 'H' && w.y === y && (w.x === x - 1 || w.x === x + 1)) return true;
            } else {
                if (w.orientation === 'V' && w.x === x && (w.y === y - 1 || w.y === y + 1)) return true;
            }
            return false;
        });
        if (isOverlap) return;

        // --- НОВЕ: ПЕРЕВІРКА НА БЛОКУВАННЯ ШЛЯХУ ---
        // Створюємо "майбутній" список стінок
        const futureWalls = [...state.walls, { x, y, orientation }];

        // Перевіряємо, чи зможе P1 дійти до низу (ряд 8)
        const p1HasPath = hasPath(state.p1.x, state.p1.y, 8, futureWalls);
        // Перевіряємо, чи зможе P2 дійти до верху (ряд 0)
        const p2HasPath = hasPath(state.p2.x, state.p2.y, 0, futureWalls);

        // Якщо хоча б одного заблокувало - забороняємо стінку
        if (!p1HasPath || !p2HasPath) {
            socket.emit('error', 'Ця стінка перекриває шлях!'); // Можна показати помилку
            return;
        }
        // --------------------------------------------

        state.walls.push({ x, y, orientation });
        player.walls -= 1;
        state.turn = state.p1.id === socket.id ? state.p2.id : state.p1.id;
        io.to(roomId).emit('gameUpdate', state);
    });


    socket.on('resetGame', ({ roomId }) => {
        const room = clientRooms[roomId];
        if (!room) return;

        // Скидаємо стан гри до початкового
        room.gameState.p1.x = 4;
        room.gameState.p1.y = 0;
        room.gameState.p1.walls = 10;

        if (room.gameState.p2) {
            room.gameState.p2.x = 4;
            room.gameState.p2.y = 8;
            room.gameState.p2.walls = 10;
        }

        room.gameState.walls = []; // Очищаємо стінки

        // Можна міняти чергу (хто виграв - той ходить другим), 
        // або просто завжди починає P1 (створювач). Залишимо P1 для простоти.
        room.gameState.turn = room.players[0];

        // Відправляємо всім оновлення
        io.to(roomId).emit('gameUpdate', room.gameState);

        // Спеціальна подія, щоб клієнт прибрав вікно перемоги
        io.to(roomId).emit('gameReset');
    });
    socket.on('disconnect', () => { });
});

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));