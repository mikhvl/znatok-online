import React, { useState, useCallback } from 'react';
import { useAssistant } from './hooks/useAssistant';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QuizBoard } from './components/QuizBoard';
import { ResultScreen } from './components/ResultScreen';
import questionsData from './data/questions.json';
import './styles/App.css';

export default function App() {
  const { isReady, sendData, character } = useAssistant();
  const [screen, setScreen] = useState('welcome'); // welcome | quiz | result
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);

  const currentQ = questionsData[qIndex];

  const handleStart = () => setScreen('quiz');

  const handleRead = useCallback((text) => {
    // Отправляем текст в бэкенд для озвучки
    sendData({ type: 'read_question', eventData: { value: text } });
  }, [sendData]);

  const handleCheck = useCallback(() => {
    const userAns = (document.querySelector('input')?.value || '').trim().toLowerCase();
    const correct = currentQ.answer.toLowerCase();
    const isCorrect = userAns === correct || userAns.includes(correct);
    const msg = isCorrect
      ? `Правильно! Ответ был: ${currentQ.answer}.`
      : `Неверно. Правильный ответ: ${currentQ.answer}.`;

    if (isCorrect) setScore((s) => s + 1);
    // Отправляем результат для озвучки ассистентом
    sendData({ type: 'check_answer', eventData: { value: msg } });
  }, [sendData, currentQ]);

  const handleNext = useCallback(() => {
    sendData({ type: 'next_question' });
    if (qIndex + 1 >= questionsData.length) {
      setScreen('result');
    } else {
      setQIndex((i) => i + 1);
    }
  }, [qIndex, sendData]);

  const handleRestart = () => {
    setScore(0);
    setQIndex(0);
    setScreen('welcome');
  };

  if (!isReady) return <div className="loading">Загрузка смартапа...</div>;

  return (
    <div className="app-container">
      {screen === 'welcome' && <WelcomeScreen onStart={handleStart} character={character} />}
      {screen === 'quiz' && (
        <QuizBoard
          question={currentQ}
          questionIndex={qIndex}
          total={questionsData.length}
          onSend={sendData}
          onCheck={handleCheck}
          onNext={handleNext}
          onRead={handleRead}
        />
      )}
      {screen === 'result' && <ResultScreen score={score} total={questionsData.length} onRestart={handleRestart} />}
    </div>
  );
}
