import React, { useState } from 'react';

export function QuizBoard({ question, questionIndex, total, onSend, onCheck, onNext, onRead }) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    const clean = input.trim();
    if (!clean) return;
    onSend({ type: 'enter_answer', answer: clean });
  };

  const handleCheck = () => {
    onCheck();
  };

  const handleRead = () => {
    onRead(question.text);
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
            placeholder='Введите ответ (например: Пушкин)'
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button className="btn-secondary" onClick={handleSubmit}>Отправить</button>
        </div>
      </div>

      <div className="suggestions">
        <button className="suggest-btn" onClick={handleRead}>Прочитать</button>
        <button className="suggest-btn" onClick={handleCheck}>Проверить</button>
        <button className="suggest-btn" onClick={onNext}>Следующий вопрос</button>
      </div>
    </div>
  );
}
