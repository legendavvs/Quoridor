# 🧱 Quoridor Online

A real-time multiplayer implementation of the classic strategy board game **Quoridor**. Built with **React** and **Node.js**, featuring smooth animations, sound effects, and robust game logic.

🔗 **Demo:** [Insert your Vercel link here]

[Game Screenshot]<img src="https://github.com/user-attachments/assets/dca9d108-5659-4e2b-a367-e0e0039c5960" width="300" />
---

## ✨ Features

- **Real-time Multiplayer:** Instant state synchronization using Socket.io.
- **Game Logic:**
  - Full implementation of Quoridor rules.
  - **Move Validation:** Validates standard moves and "jump" moves over opponents.
  - **Wall Placement Algorithm:** Uses **BFS (Breadth-First Search)** to prevent players from completely blocking the path to the goal.
- **User Experience:**
  - **Valid Move Highlighting:** Shows possible moves (green dots) for better UX.
  - **Last Move Highlight:** Visual indicators for the opponent's last action (movement or wall placement).
  - **Animations:** Smooth piece movements using `framer-motion`.
  - **Sound Effects:** Custom synthesized sounds for moves, walls, interactions, and game events (Web Audio API).
- **Interactive Elements:**
  - **Quick Chat (Emotes):** Send real-time emoji reactions to your opponent during the game.
  - **Rematch System:** "Play Again" button allows restarting the game instantly in the same room.
- **Responsive Design:** Fully playable on both Desktop and Mobile devices with touch controls.

## 🛠 Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- Socket.io Client
- Lucide React (Icons)

**Backend:**
- Node.js
- Express
- Socket.io Server

---

# 🇺🇦 Quoridor Online (Українська версія)

Мультиплеєрна онлайн-версія класичної настільної гри **Quoridor**. Розроблена на **React** та **Node.js** з використанням WebSockets для миттєвої взаємодії.

## ✨ Особливості

- **Мультиплеєр в реальному часі:** Синхронізація гри через Socket.io.
- **Ігрова логіка:**
  - Повна реалізація правил Quoridor.
  - **Валідація ходів:** Перевірка звичайних ходів та "стрибків" через суперника.
  - **Алгоритм стін:** Використання пошуку в ширину (**BFS**) для заборони встановлення стін, що повністю перекривають шлях до фінішу.
- **Користувацький досвід (UX):**
  - **Підсвітка ходів:** Зелені крапки показують, куди можна піти.
  - **Історія ходу:** Підсвітка останнього ходу суперника (звідки прийшов або яку стіну поставив).
  - **Анімації:** Плавний рух фішок завдяки `framer-motion`.
  - **Звуки:** Синтезовані звукові ефекти для ходів, стін, перемоги та емоцій (Web Audio API).
- **Інтерактив:**
  - **Емоції:** Можливість відправляти смайлики-реакції під час гри.
  - **Реванш:** Кнопка "Зіграти ще раз" для миттєвого перезапуску партії без перестворення кімнати.
- **Адаптивність:** Зручно грати як з комп'ютера, так і з телефону.

## 🛠 Технології

**Frontend (Клієнт):**
- React, Vite
- Tailwind CSS
- Framer Motion
- Socket.io Client

**Backend (Сервер):**
- Node.js
- Express
- Socket.io Server
