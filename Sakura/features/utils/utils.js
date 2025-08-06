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
