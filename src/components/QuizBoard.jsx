import React, { useState } from 'react';

export function QuizBoard({ question, questionIndex, total, onCheck, onNext, onRead }) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    const clean = input.trim();
    if (!clean) return;
    onCheck(clean);
  };

  return (
    <div className="screen">
      <div className="progress">Вопрос {questionIndex + 1} из {total}</div>
      <div className="card question-card">
        <h2>{question.text}</h2>
        <div className="input-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите ответ и нажмите Enter"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button className="btn-secondary" onClick={handleSubmit}>Отправить</button>
        </div>
      </div>
      <div className="voice-hint">
        💡 Голосом: «Прочитать», «Проверить», «Следующий вопрос» или «Ответ — ...»
      </div>
    </div>
  );
}
