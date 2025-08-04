import config from "../../config";
import { isInDungeon } from "../utils/utils";

let showTitleUntil = 0;

const M5_MESSAGE = "[BOSS] Livid: I can now turn those Spirits into shadows of myself, identical to their creator.";
const M6_MESSAGE = "[BOSS] Sadan: So you made it all the way here... Now you wish to defy me? Sadan?!";
const M6_MESSAGE_2 = "[BOSS] Sadan: ENOUGH!";
const M7_MESSAGE = "[BOSS] Wither King: I no longer wish to fight, but I know that will not stop you.";

const showRagAxeNotification = (delay = 0) => {
    setTimeout(() => {
        showTitleUntil = Date.now() + 1500;
        World.playSound("random.orb", 1, 1);
    }, delay);
};

register("chat", (message, event) => {
    if (!config.ragaxenotif || !isInDungeon()) return;

    const trimmedMessage = message.trim();

    if (trimmedMessage === M5_MESSAGE) {
        showRagAxeNotification(1400); // 1.4s delay
    } 
    else if (trimmedMessage === M6_MESSAGE) {
        showRagAxeNotification(7200); // 7.2s delay
    }
    else if (trimmedMessage === M6_MESSAGE_2){
        showRagAxeNotification(500); // 0.5s delay
    }
    else if (trimmedMessage === M7_MESSAGE) {
        showRagAxeNotification(); // No delay
    }
}).setChatCriteria("${message}");

register("renderOverlay", () => {
    if (!config.ragaxenotif || !isInDungeon()) return;
    if (Date.now() < showTitleUntil) {
        const scale = 7;
        const text = "§cRag Axe!";

        Renderer.scale(scale);
        Renderer.drawStringWithShadow(
            text,
            (Renderer.screen.getWidth() / scale - Renderer.getStringWidth(text)) / 2,
            (Renderer.screen.getHeight() / scale) / 2 - 10
        );
        Renderer.scale(1 / scale);
    }
});
