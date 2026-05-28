function addAction(action, context) {
    var command = {
        type: "smart_app_data",
        action: action
    };
    for (var i = 0; context.response.replies && i < context.response.replies.length; i++) {
        if (context.response.replies[i].type === "raw" &&
            context.response.replies[i].body &&
            context.response.replies[i].body.items) {
            context.response.replies[i].body.items.push({command: command});
            return;
        }
    }
    reply({items: [{command: command}]}, context.response);
}

function start_game(context) {
    addAction({ type: "start_game" }, context);
}

function enter_answer(answer, context) {
    addAction({ type: "enter_answer", answer: answer }, context);
}

function check_answer(context) {
    addAction({ type: "check_answer" }, context);
}

function next_question(context) {
    addAction({ type: "next_question" }, context);
}

function read_question(context) {
    addAction({ type: "read_question" }, context);
}

function end_game(context) {
    addAction({ type: "end_game" }, context);
}

function restart_game(context) {
    addAction({ type: "restart_game" }, context);
}
