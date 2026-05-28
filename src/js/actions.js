/**
 * Backend action functions for the SmartApp DSL scenario.
 * These functions send actions to the Canvas App frontend via $reactions.
 */

function start_game($context) {
    $reactions.action({ type: "start_game" });
}

function read_question($context) {
    $reactions.action({ type: "read_question" });
}

function enter_answer(answer, $context) {
    $reactions.action({ type: "enter_answer", answer: answer });
}

function check_answer($context) {
    $reactions.action({ type: "check_answer" });
}

function next_question($context) {
    $reactions.action({ type: "next_question" });
}

function end_game($context) {
    $reactions.action({ type: "end_game" });
}

function restart_game($context) {
    $reactions.action({ type: "restart_game" });
}
