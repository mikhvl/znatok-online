import { createAssistant, createSmartappDebugger } from '@salutejs/client';

const createStub = () => ({
    on: () => {},
    off: () => {},
    sendData: () => {},
    sendAction: () => {},
    close: () => {},
    getInitialData: () => [],
    getRecoveryState: () => null,
    setGetState: () => {},
    setGetRecoveryState: () => {},
    cancelTts: () => {},
    subscribeToCommand: () => () => {},
});

export const initializeAssistant = (getState, getRecoveryState) => {
    const token = process.env.REACT_APP_TOKEN;
    const initPhrase = process.env.REACT_APP_INIT_PHRASE || 'Запусти знаток онлайн';

    try {
        if (process.env.NODE_ENV === 'development') {
            if (!token) {
                console.warn(
                    'REACT_APP_TOKEN is not set. Assistant debugger will not work. ' +
                    'Create a .env file with REACT_APP_TOKEN=<your_token>.'
                );
                return createStub();
            }

            return createSmartappDebugger({
                token,
                initPhrase,
                getState,
                getRecoveryState,
                settings: {
                    dubbing: true,
                },
            });
        }

        return createAssistant({ getState, getRecoveryState });
    } catch (err) {
        console.error('Failed to create assistant:', err);
        return createStub();
    }
};
