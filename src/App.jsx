import React, { useState, useCallback } from 'react';
import { useAssistant } from './hooks/useAssistant';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QuizBoard } from './components/QuizBoard';
import { ResultScreen } from './components/ResultScreen';
import questionsData from './data/questions.json';
import './styles/App.css';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);

  const handleBackendAction = useCallback((action) => {
    const type = action?.type;
    if (type === 'start_game') setScreen('quiz');
    else if (type === 'restart_game') {
      setScore(0);
      setQIndex(0);
      setScreen('quiz');
    }
  }, []);

  const { isReady, sendData, character } = useAssistant(handleBackendAction);
  const currentQ = questionsData[qIndex];

  const handleStart = () => {
    setScreen('quiz');
    sendData({ type: 'start_game' });
  };

  const handleRestart = () => {
    setScore(0);
    setQIndex(0);
    setScreen('quiz');
    sendData({ type: 'restart_game' });
  };

  const handleRead = (text) => {
    sendData({ type: 'read_question', eventData: { value: text } });
  };

  const handleCheck = (userAnswer) => {
    const userAns = userAnswer.toLowerCase();
    const correct = currentQ.answer.toLowerCase();
    const isCorrect = userAns === correct || userAns.includes(correct);
    
    if (isCorrect) setScore((s) => s + 1);
    
    const msg = isCorrect 
      ? `Правильно! Ответ был: ${currentQ.answer}.` 
      : `Неверно. Правильный ответ: ${currentQ.answer}.`;
      
    sendData({ type: 'check_answer', eventData: { value: msg } });
  };

  const handleNext = () => {
    sendData({ type: 'next_question' });
    if (qIndex + 1 >= questionsData.length) setScreen('result');
    else setQIndex((i) => i + 1);
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
          onCheck={handleCheck}
          onNext={handleNext}
          onRead={handleRead}
        />
      )}
      {screen === 'result' && <ResultScreen score={score} total={questionsData.length} onRestart={handleRestart} />}
    </div>
  );
}
