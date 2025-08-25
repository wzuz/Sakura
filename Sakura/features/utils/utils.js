//Functions

// Is in dungeon
export function isInDungeon() {
    try {
        return TabList?.getNames()?.some(a => a.removeFormatting() == 'Dungeon: Catacombs')
    } catch (e) { }
}

// Is in boss
let inBossRoom = false;

const bossEntryRegexes = [
    /^\[BOSS\] Bonzo: Gratz for making it this far, but I'm basically unbeatable\.$/,
    /^\[BOSS\] Scarf: This is where the journey ends for you, Adventurers\.$/,
    /^\[BOSS\] The Professor: I was burdened with terrible news recently\.\.\.$/,
    /^\[BOSS\] Thorn: Welcome Adventurers! I am Thorn, the Spirit! And host of the Vegan Trials!$/,
    /^\[BOSS\] Livid: Welcome, you've arrived right on time. I am Livid, the Master of Shadows\.$/,
    /^\[BOSS\] Sadan: So you made it all the way here\.\.\. Now you wish to defy me\? Sadan\?!$/,
    /^\[BOSS\] Maxor: WELL! WELL! WELL! LOOK WHO'S HERE!$/
];

let bossEntryHandlers = [];

function unregisterBossHandlers() {
    bossEntryHandlers.forEach(h => {
        try { h.unregister(); } catch (e) {}
    });
    bossEntryHandlers = [];
}

function registerBossHandlers() {
    unregisterBossHandlers();
    bossEntryHandlers = bossEntryRegexes.map(regex => {
        const handler = register("chat", () => {
            inBossRoom = true;
            unregisterBossHandlers();
        }).setCriteria(regex);
        return handler;
    });
}

registerBossHandlers();

register("worldUnload", () => {
    inBossRoom = false;
    registerBossHandlers();
});

export function isInBoss() {
    return inBossRoom;
}

// Classes
let cachedClass = null;

export function getClass() {
    const username = Player.getName();
    const scoreboard = Scoreboard.getLines().map(line => line.getName().removeFormatting());

    for (const line of scoreboard) {
        if (line.includes(username)) {
            if (line.includes("[A]")) return "archer";
            if (line.includes("[B]")) return "berserker";
            if (line.includes("[M]")) return "mage";
            if (line.includes("[H]")) return "healer";
            if (line.includes("[T]")) return "tank";
        }
    }

    const tabList = TabList.getNames().map(name => name.removeFormatting());

    for (const line of tabList) {
        if (line.includes(username)) {
            let newClass = null;
            if (line.includes("Archer")) newClass = "archer";
            else if (line.includes("Berserk")) newClass = "berserker";
            else if (line.includes("Mage")) newClass = "mage";
            else if (line.includes("Healer")) newClass = "healer";
            else if (line.includes("Tank")) newClass = "tank";

            if (newClass) {
                if (cachedClass !== newClass) {
                    cachedClass = newClass;
                }
                return cachedClass;
            }
        }
    }

    return cachedClass;
}

export function isDpsClass() {
    const playerClass = getClass();
    return playerClass === "archer" || playerClass === "berserker" || playerClass === "mage";
}

//Check for updates
const { request } = require("requestV2")

let updateCheckedThisSession = false

export function checkForUpdate(silent = false) {
    if (updateCheckedThisSession) return
    updateCheckedThisSession = true

    const localVersion = JSON.parse(FileLib.read("Sakura", "metadata.json")).version
    const githubApi = "https://api.github.com/repos/wzuz/Sakura/releases/latest"

    request({
        url: githubApi,
        method: "GET",
        headers: { "User-Agent": "Mozilla/5.0" },
        text: true
    }).then(raw => {
        let data
        try {
            data = JSON.parse(raw)
        } catch (e) {
            if (!silent) ChatLib.chat("&5❀ &dSakura &5≫&c Failed to parse GitHub API response.")
            return
        }

        let latestVersion = data.tag_name || data.name
        const releaseUrl = data.html_url || "https://github.com/wzuz/Sakura/releases"

        if (!latestVersion) return

        if (latestVersion.startsWith("v")) {
            latestVersion = latestVersion.substring(1)
        }

        if (latestVersion !== localVersion) {
            ChatLib.chat(`&5❀ &dSakura &5≫ &eUpdate available: &b${data.tag_name} &7(Currently on: ${localVersion})`)
            ChatLib.chat(`&aClick here:&b ${releaseUrl}`)
        } else if (!silent) {
            ChatLib.chat("&5❀ &dSakura &5≫ &aYou are on the latest version.")
        }
    }).catch(error => {
        if (!silent) ChatLib.chat(`&5❀ &dSakura &5≫&c Update check failed: ${error}`)
    })
}

//Author
const AUTHOR_NAME = JSON.parse(FileLib.read("Sakura", "metadata.json")).author

register("chat", (whoRaw) => {
    const who = whoRaw.removeFormatting().replace(/^\[[^\]]+\]\s*/, "")

    if (who === AUTHOR_NAME) {
        ChatLib.command(`pc :(`)
    }
}).setCriteria("${who} has left the party.")
