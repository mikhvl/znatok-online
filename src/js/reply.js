/**
 * Reply helper functions for the SmartApp DSL scenario.
 * Used for TTS responses triggered by frontend sendData calls.
 */

function reply_text($context, text) {
    $reactions.answer(text);
}
