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

const safeCreateAssistant = (factory, fallbackLabel) => {
    try {
        const instance = factory();

        // If the library returns a broken object (missing critical methods),
        // fall back to the stub so the app keeps working.
        if (!instance || typeof instance.on !== 'function') {
            console.warn(`${fallbackLabel} returned invalid instance, using stub.`);
            return createStub();
        }

        // Wrap 'on' so that internal errors (e.g. malformed backend responses
        // missing applicationId) don't propagate as unhandled exceptions.
        const originalOn = instance.on.bind(instance);
        instance.on = (event, callback) => {
            const safeCallback = (...args) => {
                try {
                    return callback(...args);
                } catch (err) {
                    console.error(`Assistant 'on(${event})' callback error:`, err);
                }
            };
            return originalOn(event, safeCallback);
        };

        return instance;
    } catch (err) {
        console.error(`Failed to create ${fallbackLabel}:`, err);
        return createStub();
    }
};

export const initializeAssistant = (getState, getRecoveryState) => {
    const token = process.env.REACT_APP_TOKEN;
    const initPhrase = process.env.REACT_APP_INIT_PHRASE || 'Запусти знаток онлайн';

    if (process.env.NODE_ENV === 'development') {
        if (!token) {
            console.warn(
                'REACT_APP_TOKEN is not set. Assistant debugger will not work. ' +
                'Create a .env file with REACT_APP_TOKEN=<your_token>. '
            );
            return createStub();
        }

        return safeCreateAssistant(
            () => createSmartappDebugger({
                token,
                initPhrase,
                getState,
                getRecoveryState,
                settings: {
                    dubbing: true,
                },
            }),
            'SmartappDebugger',
        );
    }

    return safeCreateAssistant(
        () => createAssistant({ getState, getRecoveryState }),
        'Assistant',
    );
};
