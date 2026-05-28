require: js/actions.js
require: js/reply.js
require: js/getters.js

patterns:
    $AnyText = $nonEmptyGarbage
    $AnswerText = $regexp<.+>

theme: /

    state: Start
        q!: $regex</start>
        q!: (* ~Запустить * * | * ~Активировать * * | * ~Открыть * * | * Запусти * * | * Активируй * * | * Открой * *) (Знаток Онлайн | знаток онлайн | викторину знаток онлайн | викторина знаток онлайн)

        if: $request.rawRequest.payload.character.name === "Джой"
            a: Привет! Я викторина «Знаток Онлайн». Хочешь проверить свои знания? Скажи «Начать игру».
        else:
            a: Здравствуйте! Я викторина «Знаток Онлайн». Хотите проверить свои знания? Скажите «Начать игру».

    state: StartGame
        q!: * (начать игру | поиграем | давай играть) *

        if: $request.rawRequest.payload.character.name === "Джой"
            a: Начинаем! Отвечай на вопросы текстом или голосом. Скажи «Ответ» и свой вариант.
        else:
            a: Начинаем! Отвечайте на вопросы текстом или голосом. Скажите «Ответ» и свой вариант.

        script:
            start_game($context);

    state: Help
        q!: * (*помощь* | умееш* | можеш* | помог* | подска*) *

        if: $request.rawRequest.payload.character.name === "Джой"
            a: Тебе нужно назвать ответ. Например, «Ответ — Пушкин». Чтобы прослушать вопрос, скажи «Прочитать». Для проверки ответа скажи «Проверить». Чтобы сменить вопрос, скажи «Следующий вопрос». Чтобы закончить — скажи «Закончить».
        else:
            a: Вам нужно назвать ответ. Например, «Ответ — Пушкин». Чтобы прослушать вопрос, скажите «Прочитать». Для проверки ответа скажите «Проверить». Чтобы сменить вопрос, скажите «Следующий вопрос». Чтобы закончить — скажите «Закончить».

    state: ReadQuestion
        q!: (*прочитай* | *прочитайте* | *озвучь* | *прочитать*)

        script:
            read_question($context);

    state: EnterAnswer
        q!: (~ответ | мой ответ | я думаю) $AnyText::answer

        if: $request.rawRequest.payload.character.name === "Джой"
            a: Ответ принят! Для проверки скажи «Проверить».
        else:
            a: Ответ принят! Для проверки скажите «Проверить».

        script:
            enter_answer($parseTree._answer, $context);

    state: CheckAnswer
        q!: (~проверить | *проверь* | *проверьте* | *не знаю* | какой ответ | я не знаю)

        script:
            check_answer($context);

    state: NextQuestion
        q!: (~Следующий вопрос | ~следующий | ~дальше)

        script:
            next_question($context);

    state: EndGame
        q!: (*закончить* | *хватит* | *выйти* | *завершить*)

        script:
            end_game($context);

    state: RestartGame
        q!: (*начать заново* | *новая игра* | *ещё раз* | *рестарт*)

        if: $request.rawRequest.payload.character.name === "Джой"
            a: Начинаем новую игру!
        else:
            a: Начинаем новую игру!

        script:
            restart_game($context);

    state: ReadAnswer
        event!: read

        script:
            var value = "";
            var serverAction = $request.payload.data && $request.payload.data.server_action;
            if (serverAction && serverAction.parameters) {
                value = serverAction.parameters.value || "";
            }
            if (!value) {
                var eventData = $context && $context.request && $context.request.data && $context.request.data.eventData;
                if (eventData) {
                    value = eventData.value || "";
                }
            }
            if (value) {
                $reactions.answer(value);
            }

    state: ReadQuestionText
        event!: read_q

        script:
            var value = "";
            var serverAction = $request.payload.data && $request.payload.data.server_action;
            if (serverAction && serverAction.parameters) {
                value = serverAction.parameters.value || "";
            }
            if (!value) {
                var eventData = $context && $context.request && $context.request.data && $context.request.data.eventData;
                if (eventData) {
                    value = eventData.value || "";
                }
            }
            if (value) {
                $reactions.answer(value);
            }

    state: Fallback
        event!: noMatch

        if: $request.rawRequest.payload.character.name === "Джой"
            a: Я не понял. Скажи «Помощь», чтобы узнать, что я умею.
        else:
            a: Я не понял. Скажите «Помощь», чтобы узнать, что я умею.
