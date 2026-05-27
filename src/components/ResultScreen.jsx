import React from 'react';

export function ResultScreen({ score, total, onRestart }) {
  return (
    <div className="screen center-content">
      <h1>🏆 Результаты</h1>
      <p className="score-text">
        Правильных ответов: <strong>{score}</strong> из {total}
      </p>
      <div className="score-bar">
        <div className="score-fill" style={{ width: `${(score / total) * 100}%` }} />
      </div>
      <button className="btn-primary" onClick={onRestart}>Играть снова</button>
    </div>
  );
}
