// client/src/sounds.js

const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

// Функція для створення звуку
function playTone(freq, type, duration, vol = 0.1) {
    if (ctx.state === 'suspended') ctx.resume(); 
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type; 
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Плавне затухання звуку
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
}

export const sounds = {
    // Хід (Move)
    move: () => {
        playTone(600, 'sine', 0.1, 0.1);
        setTimeout(() => playTone(800, 'sine', 0.1, 0.05), 50);
    },

    // Стінка (Wall)
    wall: () => {
        playTone(150, 'square', 0.2, 0.1);
        playTone(100, 'triangle', 0.3, 0.1);
    },

    // Підтвердження (Confirm)
    confirm: () => {
        playTone(400, 'sine', 0.1, 0.08);
        setTimeout(() => playTone(600, 'sine', 0.2, 0.08), 100);
    },

    // --- ТУТ БУЛИ ЗМІНИ ГУЧНОСТІ ---

    // Перемога (Win) - було 0.2, стало 0.05
    win: () => {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            // Зменшили гучність до 0.05
            setTimeout(() => playTone(freq, 'triangle', 0.6, 0.05), i * 150);
        });
    },

    // Поразка (Lose) - було 0.2, стало 0.05
    lose: () => {
        // Зменшили гучність до 0.05
        playTone(300, 'sawtooth', 0.5, 0.05);
        setTimeout(() => playTone(200, 'sawtooth', 0.8, 0.05), 400);
    }
};