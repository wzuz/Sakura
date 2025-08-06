//Functions
export function isInDungeon() {
    try {
        return TabList?.getNames()?.some(a => a.removeFormatting() == 'Dungeon: Catacombs')
    } catch (e) { }
}

export function getClass() {
    const scoreboard = Scoreboard.getLines().map(line => line.getName().removeFormatting());
    const username = Player.getName();

    for (const line of scoreboard) {
        if (line.includes(username)) {
            if (line.includes("[A]")) return "archer";
            if (line.includes("[B]")) return "berserker";
            if (line.includes("[M]")) return "mage";
            if (line.includes("[H]")) return "healer";
            if (line.includes("[T]")) return "tank";
        }
    }

    return null;
}

export function isDpsClass() {
    const isClass = getClass();
    return isClass === "archer" || isClass === "berserker" || isClass === "mage";
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
