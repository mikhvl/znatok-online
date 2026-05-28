function reply(body, response) {
    var replyData = {
        type: "raw",
        body: body
    };
    response.replies = response.replies || [];
    response.replies.push(replyData);
}

function addSuggestions(suggestions, context) {
    var buttons = [];
    suggestions.forEach(function(suggest) {
        buttons.push({
            action: { text: suggest, type: "text" },
            title: suggest
        });
    });
    reply({ suggestions: { buttons: buttons } }, context.response);
}

function getSuggestionsByScreen(screen) {
    if (screen === "quiz") {
        return ["Прочитай вопрос", "Проверить", "Следующий вопрос", "Закончить"];
    } else if (screen === "gameover") {
        return ["Начать заново", "Помощь"];
    } else {
        return ["Начать игру", "Помощь"];
    }
}

function getQuizSuggestions() {
    return ["Прочитай вопрос", "Проверить", "Следующий вопрос", "Закончить"];
}
