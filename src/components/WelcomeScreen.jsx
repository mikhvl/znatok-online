import React from 'react';

export function WelcomeScreen({ onStart, character }) {
  const isJoy = character === 'joy';
  return (
    <div className="screen center-content">
      <h1>🎓 Викторина «Знаток Онлайн»</h1>
      <p className="subtitle">
        {isJoy ? 'Тебе' : 'Вам'} нужно ответить на 5 вопросов. Готов{isJoy ? 'а' : 'ы'} проверить знания?
      </p>
      <button className="btn-primary" onClick={onStart}>
        Начать игру
      </button>
    </div>
  );
}
