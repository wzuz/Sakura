import config from "../../config";
import { isInDungeon } from "../utils/utils";

const SADAN_GOLEM_MESSAGES = [
    "[BOSS] Sadan: Interesting strategy, waking up my Golems. Or was that unintentional, (player)?",
    "[BOSS] Sadan: You weren't supposed to wake up that Golem, (player)!",
    "[BOSS] Sadan: My Terracotta Army wasn't enough? You had to awaken a Golem on top, (player)?!",
    "[BOSS] Sadan: Those Golems will be your undoing, (player)!",
    "[BOSS] Sadan: How many more of my Golems will you disturb, (player)?",
    "[BOSS] Sadan: Reckless humans! You should know by now my Golems do not want to be awoken, (player)!",
    "[BOSS] Sadan: All my Golems want is some peace and quiet! Can you not, (player)?!"
];

const awokenGolems = new Set();

let sadanIntroTime = null;
let trackingEnabled = false;
let earlyWakeDetected = false;
let terracottaTriggered = false;

const terracottaPositions = new Map();

function hasMoved(entity) {
    const uuid = entity.getUUID().toString();
    const pos = [entity.getX(), entity.getY(), entity.getZ()];
    const prev = terracottaPositions.get(uuid);
    terracottaPositions.set(uuid, pos);
    if (!prev) return false;
    return prev[0] !== pos[0] || prev[1] !== pos[1] || prev[2] !== pos[2];
}

register("chat", () => {
    if (!config.golemShoutout || !isInDungeon()) return;

    awokenGolems.clear();
    terracottaPositions.clear();
    sadanIntroTime = Date.now();
    trackingEnabled = true;
    earlyWakeDetected = false;
    terracottaTriggered = false;
}).setChatCriteria("[BOSS] Sadan: So you made it all the way here... Now you wish to defy me? Sadan?!");

register("step", () => {
    if (!config.golemShoutout || !isInDungeon() || !trackingEnabled) return;

    const now = Date.now();

    if (!earlyWakeDetected && now - sadanIntroTime > 9000) {
        trackingEnabled = false;
        return;
    }

    World.getAllEntities().forEach(entity => {
        const name = entity.getName().removeFormatting();
        const uuid = entity.getUUID().toString();

        if (name.startsWith("Woke Golem") && !awokenGolems.has(uuid)) {
            awokenGolems.add(uuid);
            if (!earlyWakeDetected && now - sadanIntroTime <= 9000) {
                earlyWakeDetected = true;
            }
        }

        if (
            earlyWakeDetected &&
            !terracottaTriggered &&
            name.includes("Terracotta") &&
            hasMoved(entity)
        ) {
            terracottaTriggered = true;
            trackingEnabled = false;
        }
    });
}).setFps(5);

register("chat", (message, event) => {
    if (!config.golemShoutout || !isInDungeon()) return;
    if (event.sender) return;

    const trimmedMessage = message.trim();

    for (const msg of SADAN_GOLEM_MESSAGES) {
        const prefix = msg.split("(player)")[0];
        if (trimmedMessage.startsWith(prefix)) {
            const playerName = trimmedMessage
                .substring(prefix.length)
                .replace(/[^a-zA-Z0-9_]/g, "")
                .trim();

            if (playerName && earlyWakeDetected && trackingEnabled) {
                setTimeout(() => {
                    ChatLib.command(`pc Shoutout to ${playerName} for waking up a golem early.`);
                }, 500);
            }

            break;
        }
    }
}).setChatCriteria("${message}");

register("chat", () => {
    if (!config.golemShoutout || !isInDungeon()) return;
    awokenGolems.clear();
    trackingEnabled = false;
    terracottaPositions.clear();
}).setChatCriteria("[BOSS] Sadan: I'm sorry, but I need to concentrate. I wish it didn't have to come to this.");
