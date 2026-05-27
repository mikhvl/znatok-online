import { useEffect, useRef, useState, useCallback } from 'react';
import { createSmartappDebugger, createAssistant } from '@salutejs/client';

export function useAssistant() {
  const assistantRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [character, setCharacter] = useState('joy');

  useEffect(() => {
    const init = () => {
      const isDev = process.env.NODE_ENV === 'development';
      const assistant = isDev
        ? createSmartappDebugger({
            token: process.env.REACT_APP_TOKEN || 'dev_token',
            initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP || 'Викторину Знаток Онлайн'}`,
            getState: () => ({}),
            getRecoveryState: () => ({}),
            nativePanel: { defaultText: 'Ответ - Пушкин' }
          })
        : createAssistant({ getState: () => ({}), getRecoveryState: () => ({}) });

      assistant.on('start', () => setIsReady(true));
      assistant.on('data', (command) => {
        if (command.type === 'character') {
          setCharacter(command.character?.id || 'joy');
        }
      });

      assistantRef.current = assistant;
    };

    init();
    return () => assistantRef.current?.close();
  }, []);

  const sendData = useCallback((action) => {
    if (assistantRef.current) {
      // Формат действия полностью соответствует ожиданиям DSL ($context.request.data.eventData)
      assistantRef.current.sendData({ action: { type: action.type, eventData: action.eventData || {} } });
    }
  }, []);

  return { isReady, sendData, character };
}
