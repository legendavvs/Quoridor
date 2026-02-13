import { useState } from 'react';
import { Users, Lock, Gamepad2, ArrowRight } from 'lucide-react';

export default function Lobby({ joinRoom, createRoom, error }) {
    const [roomCode, setRoomCode] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('join'); // 'join' або 'create'

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">

            {/* Логотип / Заголовок */}
            <div className="mb-8 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-slate-800 rounded-2xl shadow-lg border border-slate-700">
                        <Gamepad2 size={48} className="text-cyan-400" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-slate-100 tracking-tight">Quoridor</h1>
                <p className="text-slate-400 mt-2">Стратегічна гра для двох</p>
            </div>

            {/* Картка входу */}
            <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700">

                {/* Перемикач вкладок */}
                <div className="flex border-b border-slate-700">
                    <button
                        onClick={() => setActiveTab('join')}
                        className={`flex-1 p-4 font-medium transition-colors ${activeTab === 'join' ? 'bg-slate-700 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Приєднатися
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`flex-1 p-4 font-medium transition-colors ${activeTab === 'create' ? 'bg-slate-700 text-rose-400' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Створити
                    </button>
                </div>

                <div className="p-6 space-y-4">

                    {/* Вивід помилок */}
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center animate-pulse">
                            {error}
                        </div>
                    )}

                    {activeTab === 'join' ? (
                        // ФОРМА ПРИЄДНАННЯ
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-slate-500 font-bold mb-2 tracking-wider">Код кімнати</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 text-slate-500" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Напр: X7A2"
                                        value={roomCode}
                                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                        className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all uppercase placeholder-slate-600"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => joinRoom(roomCode)}
                                disabled={!roomCode}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
                            >
                                Увійти в гру <ArrowRight size={20} />
                            </button>
                        </div>
                    ) : (
                        // ФОРМА СТВОРЕННЯ
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-slate-500 font-bold mb-2 tracking-wider">Пароль Адміна</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
                                    <input
                                        type="password"
                                        placeholder="Введіть секретний ключ"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder-slate-600"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => createRoom(password)}
                                disabled={!password}
                                className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20"
                            >
                                Створити лоббі <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}