// client/src/sounds.js

const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

// Функція для створення звуку
function playTone(freq, type, duration, vol = 0.1) {
    if (ctx.state === 'suspended') ctx.resume(); // Браузери блокують звук до першого кліку
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
}

export const sounds = {
    // Звук ходу: короткий, високий "тік"
    move: () => {
        playTone(600, 'sine', 0.1, 0.1);
        setTimeout(() => playTone(800, 'sine', 0.1, 0.05), 50);
    },

    // Звук стінки: глухий, низький "тук"
    wall: () => {
        playTone(150, 'square', 0.2, 0.15);
        playTone(100, 'triangle', 0.3, 0.2);
    },

    // Звук підтвердження (коли натискаєш зелену кнопку)
    confirm: () => {
        playTone(400, 'sine', 0.1, 0.1);
        setTimeout(() => playTone(600, 'sine', 0.2, 0.1), 100);
    },

    // Перемога: мажорний акорд
    win: () => {
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            setTimeout(() => playTone(freq, 'triangle', 0.6, 0.2), i * 150);
        });
    },

    // Поразка: сумний низхідний тон
    lose: () => {
        playTone(300, 'sawtooth', 0.5, 0.2);
        setTimeout(() => playTone(200, 'sawtooth', 0.8, 0.2), 400);
    }
};