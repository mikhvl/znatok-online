import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeAssistant } from './utils/assistant';
import styled, { css } from 'styled-components';
import questionsData from './questions.json';

/* ─── Styled Components ─── */

const GlobalStyle = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #1e2a3a 0%, #0f1724 100%);
    color: #f0f0f0;
    font-family: 'Segoe UI', 'Arial', sans-serif;
    padding: 20px;
`;

const QuizContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 32px;
    padding: 30px 20px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const Title = styled.h1`
    text-align: center;
    font-size: 2.5rem;
    margin: 0;
    background: linear-gradient(135deg, #ffd89b, #c7e9fb);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
`;

const QuestionText = styled.div`
    font-size: 1.8rem;
    font-weight: bold;
    line-height: 1.4;
    text-align: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    @media (max-width: 768px) {
        font-size: 1.3rem;
    }
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 16px;
    font-size: 1.2rem;
    border-radius: 48px;
    border: none;
    background: #2d3e4f;
    color: white;
    outline: none;
    text-align: center;
    &::placeholder {
        color: #8aaec0;
    }
    &:disabled {
        opacity: 0.5;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
`;

// Use transient prop $primary to avoid DOM warning
const Button = styled.button`
    padding: 12px 24px;
    font-size: 1rem;
    border: none;
    border-radius: 48px;
    background: ${(p) => (p.$primary ? '#ff8c42' : '#3a5a6e')};
    color: white;
    cursor: pointer;
    transition: 0.2s;
    &:hover {
        transform: scale(1.02);
        background: ${(p) => (p.$primary ? '#ff9e5e' : '#4f7a94')};
    }
    &:disabled {
        opacity: 0.5;
        transform: none;
        cursor: not-allowed;
    }
`;

const Feedback = styled.div`
    background: rgba(0, 0, 0, 0.6);
    padding: 16px;
    border-radius: 24px;
    font-size: 1rem;
    line-height: 1.4;
`;

const ProgressBarContainer = styled.div`
    width: 100%;
    background: #2d3e4f;
    border-radius: 24px;
    height: 12px;
    overflow: hidden;
`;

const ProgressFill = styled.div`
    width: ${(p) => p.progress}%;
    height: 100%;
    background: #ff8c42;
    transition: width 0.3s ease;
`;

const ScoreText = styled.div`
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
`;

const VoiceHint = styled.div`
    text-align: center;
    font-size: 0.85rem;
    color: #8aaec0;
    font-style: italic;
`;

const HelpOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 20px;
`;

const HelpContent = styled.div`
    background: #1e2a3a;
    border-radius: 24px;
    padding: 30px;
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;

    h2 {
        margin-top: 0;
        text-align: center;
        color: #ffd89b;
    }

    h3 {
        color: #c7e9fb;
        margin-bottom: 8px;
    }

    ul {
        line-height: 2;
        padding-left: 20px;
    }

    code {
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 0.95rem;
    }
`;

/* ─── Helpers ─── */

const getRandomQuestions = (allQuestions, count = 5) => {
    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
};

/* ─── App Component ─── */

function App() {
    const [screen, setScreen] = useState('start');
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isAnswered, setIsAnswered] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [helpVisible, setHelpVisible] = useState(false);

    const assistantRef = useRef(null);

    // Stable ref to current state — avoids stale closures in assistant callbacks
    const stateRef = useRef({});
    stateRef.current = {
        screen,
        questions,
        currentIndex,
        score,
        currentQuestion,
        userAnswer,
        isAnswered,
        feedback,
    };

    /* ─── item_selector: описывает доступные голосовые команды ─── */

    const getItemSelectorItems = () => {
        const { screen } = stateRef.current;
        if (screen === 'start') {
            return [
                { title: 'Начать игру' },
                { title: 'Помощь' },
            ];
        }
        if (screen === 'gameover') {
            return [
                { title: 'Начать заново' },
                { title: 'Помощь' },
            ];
        }
        // quiz
        return [
            { title: 'Прочитать вопрос' },
            { title: 'Проверить ответ' },
            { title: 'Следующий вопрос' },
            { title: 'Закончить игру' },
        ];
    };

    /* ─── getState / getRecoveryState для ассистента ─── */

    const getStateForAssistant = useCallback(() => ({
        screen: stateRef.current.screen,
        currentQuestion: stateRef.current.currentQuestion?.text || '',
        score: stateRef.current.score,
        total: stateRef.current.questions?.length || 0,
        item_selector: {
            ignored_words: [],
            items: getItemSelectorItems(),
        },
    }), []);

    const getRecoveryState = useCallback(() => ({
        screen: stateRef.current.screen,
        currentIndex: stateRef.current.currentIndex,
        score: stateRef.current.score,
        questionsIds: stateRef.current.questions?.map((q) => q.id) || [],
    }), []);

    /* ─── Отправка action в бэкенд (для озвучки через ассистента) ─── */

    const sendActionValue = useCallback((actionId, value) => {
        assistantRef.current?.sendData(
            {
                action: {
                    action_id: actionId,
                    parameters: { value },
                },
            },
            (data) => {
                console.log('sendData response:', data);
            },
        );
    }, []);

    /* ─── Игровая логика ─── */

    const startNewGame = () => {
        const randomQs = getRandomQuestions(questionsData, 5);
        setQuestions(randomQs);
        setCurrentIndex(0);
        setScore(0);
        setUserAnswer('');
        setFeedback('');
        setIsAnswered(false);
        setCurrentQuestion(randomQs[0]);
        setScreen('quiz');
        setHelpVisible(false);
        sendActionValue('read_q', randomQs[0].text);
    };

    // Perform answer check and return result info (score delta, feedback).
    // If `silent` is true, skip voice announcement via sendData.
    const performCheck = (silent = false) => {
        const { currentQuestion, userAnswer, isAnswered } = stateRef.current;
        if (!currentQuestion || isAnswered) return null;

        const normalizedUser = userAnswer.trim().toLowerCase().replace(/[.,!?;]$/, '');
        const isCorrect = currentQuestion.correctAnswers.some(
            (ans) => ans.toLowerCase() === normalizedUser,
        );

        let msg;
        if (isCorrect) {
            setScore((prev) => prev + 1);
            msg = `Правильно! ${currentQuestion.comment || ''}`;
            setFeedback(`✅ ${msg}`);
        } else {
            const correctStr = currentQuestion.correctAnswers.join(' или ');
            msg = `Неправильно. Правильный ответ: ${correctStr}. ${currentQuestion.comment || ''}`;
            setFeedback(`❌ ${msg}`);
        }
        setIsAnswered(true);

        if (!silent) {
            sendActionValue('read', msg);
        }
        return { isCorrect, msg };
    };

    const checkAnswer = () => performCheck(false);

    const advanceToNext = () => {
        const { currentIndex, questions } = stateRef.current;
        if (currentIndex + 1 < questions.length) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            setCurrentQuestion(questions[nextIdx]);
            setUserAnswer('');
            setFeedback('');
            setIsAnswered(false);
            sendActionValue('read_q', questions[nextIdx].text);
        } else {
            endGame();
        }
    };

    const nextQuestion = () => {
        const { isAnswered, userAnswer } = stateRef.current;

        if (!isAnswered && userAnswer.trim()) {
            // Silent check — verify answer but don't voice it, then advance
            performCheck(true);
        }
        advanceToNext();
    };

    const endGame = () => {
        const { score, questions } = stateRef.current;
        setScreen('gameover');
        setHelpVisible(false);
        const total = questions?.length || 0;
        const msg = `Игра окончена! Ваш счёт: ${score} из ${total}`;
        sendActionValue('read', msg);
    };

    const readQuestion = () => {
        const q = stateRef.current.currentQuestion;
        if (q) {
            sendActionValue('read_q', q.text);
        }
    };

    /* ─── Обработка команд от ассистента (голос / бэкенд) ─── */

    const handleAction = (action) => {
        if (!action) return;
        const actionType = action.type || action.action_id;
        switch (actionType) {
            case 'start_game':
            case 'restart_game':
                startNewGame();
                break;
            case 'enter_answer':
                setUserAnswer(action.answer || action.parameters?.answer || '');
                break;
            case 'check_answer':
                checkAnswer();
                break;
            case 'next_question':
                nextQuestion();
                break;
            case 'read_question':
                // Frontend sends question text to backend for TTS via event!: read_q
                readQuestion();
                break;
            case 'end_game':
                endGame();
                break;
            case 'help':
                setHelpVisible(true);
                break;
            default:
                break;
        }
    };

    /* ─── Обработка навигации (пульт ТВ, SberBox) ─── */

    const handleNavigation = (command) => {
        const { screen, isAnswered, userAnswer } = stateRef.current;

        switch (command) {
            case 'FORWARD':
                if (screen === 'start' || screen === 'gameover') {
                    startNewGame();
                } else if (isAnswered) {
                    nextQuestion();
                } else if (userAnswer?.trim()) {
                    checkAnswer();
                }
                break;
            case 'BACK':
                if (screen === 'quiz') {
                    endGame();
                } else if (screen === 'gameover') {
                    setScreen('start');
                }
                break;
            default:
                break;
        }
    };

    /* ─── Обработчик ошибок ассистента ─── */

    const handleError = (error) => {
        console.error('Assistant error:', error);
    };

    /* ─── Стабильная подписка через ref ─── */

    const handlerRef = useRef(null);
    handlerRef.current = (event) => {
        try {
            if (!event || !event.type) return;

            console.log('assistant.on(data)', event);

            if (event.type === 'character') {
                return;
            }
            if (event.type === 'insets') {
                return;
            }
            if (event.type === 'navigation') {
                handleNavigation(event.navigation?.command);
                return;
            }
            if (event.type === 'smart_app_error') {
                handleError(event);
                return;
            }

            // Smart app commands: action is directly on the event object
            // (matching the @salutejs/client protocol used in the reference examples)
            if (event.action) {
                handleAction(event.action);
            }
        } catch (err) {
            console.error('Error handling assistant data event:', err);
        }
    };

    /* ─── Инициализация ассистента ─── */

    useEffect(() => {
        const assistant = initializeAssistant(getStateForAssistant, getRecoveryState);
        assistantRef.current = assistant;

        assistant.on('data', (event) => handlerRef.current(event));
        assistant.on('error', (err) => console.error('Assistant error event:', err));

        return () => {
            assistant.close?.();
        };
    }, []);

    // Обновляем getState при каждом рендере, чтобы ассистент видел свежее состояние
    useEffect(() => {
        assistantRef.current?.setGetState?.(getStateForAssistant);
    });

    /* ─── Клавиатура: Enter для проверки ответа ─── */

    const onAnswerKeyDown = (e) => {
        if (e.key === 'Enter' && !isAnswered && userAnswer.trim()) {
            checkAnswer();
        }
    };

    /* ─── Рендер ─── */

    if (helpVisible) {
        return (
            <GlobalStyle>
                <HelpOverlay onClick={() => setHelpVisible(false)}>
                    <HelpContent onClick={(e) => e.stopPropagation()}>
                        <h2>Помощь</h2>

                        <h3>Голосовые команды</h3>
                        <ul>
                            <li><code>Начать игру</code> — начать викторину</li>
                            <li><code>Ответ …</code> — ввести ответ голосом</li>
                            <li><code>Проверить</code> — проверить ответ</li>
                            <li><code>Дальше</code> / <code>Следующий вопрос</code></li>
                            <li><code>Закончить</code> — завершить игру</li>
                            <li><code>Повтори вопрос</code> — озвучить вопрос</li>
                            <li><code>Помощь</code> — показать эту подсказку</li>
                        </ul>

                        <h3>Управление с пульта (ТВ / SberBox)</h3>
                        <ul>
                            <li><code>Вперёд</code> — начать игру / проверить / следующий</li>
                            <li><code>Назад</code> — закончить игру / вернуться</li>
                        </ul>

                        <ButtonGroup style={{ marginTop: 24 }}>
                            <Button $primary onClick={() => setHelpVisible(false)}>
                                Закрыть
                            </Button>
                        </ButtonGroup>
                    </HelpContent>
                </HelpOverlay>
            </GlobalStyle>
        );
    }

    if (screen === 'start') {
        return (
            <GlobalStyle>
                <QuizContainer>
                    <Title>📚 Знаток Онлайн</Title>
                    <VoiceHint>Скажите «Начать игру» или нажмите кнопку</VoiceHint>
                    <Button $primary onClick={startNewGame}>
                        Начать игру
                    </Button>
                    <Button onClick={() => setHelpVisible(true)}>Помощь</Button>
                </QuizContainer>
            </GlobalStyle>
        );
    }

    if (screen === 'gameover') {
        const percent = Math.round((score / questions.length) * 100);
        return (
            <GlobalStyle>
                <QuizContainer>
                    <Title>🏁 Игра окончена</Title>
                    <ScoreText>
                        Ваш счёт: {score} из {questions.length} ({percent}%)
                    </ScoreText>
                    <VoiceHint>Скажите «Начать заново» или нажмите кнопку</VoiceHint>
                    <ButtonGroup>
                        <Button $primary onClick={startNewGame}>
                            Начать заново
                        </Button>
                        <Button onClick={() => setHelpVisible(true)}>Помощь</Button>
                    </ButtonGroup>
                </QuizContainer>
            </GlobalStyle>
        );
    }

    // Quiz screen
    const progress = ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100;

    return (
        <GlobalStyle>
            <QuizContainer>
                <Title>
                    ❓ Вопрос {currentIndex + 1} из {questions.length}
                </Title>
                <ProgressBarContainer>
                    <ProgressFill progress={progress} />
                </ProgressBarContainer>
                <QuestionText>{currentQuestion?.text}</QuestionText>
                <StyledInput
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={onAnswerKeyDown}
                    placeholder="Введите ответ или скажите голосом…"
                    disabled={isAnswered}
                />
                {feedback && <Feedback>{feedback}</Feedback>}
                <VoiceHint>
                    Скажите «Ответ …», «Проверить», «Дальше» или «Закончить»
                </VoiceHint>
                <ButtonGroup>
                    <Button onClick={readQuestion}>🔊 Прочитать вопрос</Button>
                    <Button $primary onClick={checkAnswer} disabled={isAnswered || !userAnswer.trim()}>
                        ✅ Проверить
                    </Button>
                    <Button onClick={nextQuestion} disabled={!isAnswered && !userAnswer.trim()}>
                        ⏩ Следующий вопрос
                    </Button>
                    <Button onClick={endGame}>🚪 Закончить</Button>
                </ButtonGroup>
            </QuizContainer>
        </GlobalStyle>
    );
}

export default App;
