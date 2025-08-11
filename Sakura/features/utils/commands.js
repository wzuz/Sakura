const { request } = require("requestV2")

export function handleCommand(args) {
    const command = args[0]?.toLowerCase()

    switch (command) {
        case undefined:
        case "gui":
        case "settings":
            return "open_gui"

         case "ping":
            ChatLib.chat("&5❀ &dSakura &5≫&f This feature is currently disabled.")
            break

        case "rtca": 
            const username = args[1] ? args[1] : Player.getName()
            const url = `https://soopy.dev/api/soopyv2/botcommand?m=rtca&u=${username}`

            request({
                url: url,
                method: "GET",
                text: true
            }).then(raw => {
                const regex = /It will take ([\d,]+) m7 runs for (\w+) to reach class average 50 \((.*)\)/i
                const match = raw.match(regex)

                if (match) {
                    const runsNeeded = match[1]
                    const playerName = match[2]
                    const classBreakdown = match[3]

                    if (runsNeeded === "0" && (!classBreakdown || classBreakdown.trim() === "")) {
                        ChatLib.chat(`&5❀ &dSakura &5≫ &b${playerName} &fhas already reached &2⚛ Class Average &650`)
                        return
                    }

                    const formattedBreakdown = classBreakdown
                        .split(" | ")
                        .filter(Boolean)
                        .map(part => {
                            const [num, cls] = part.split(" ")
                            switch (cls?.toLowerCase()) {
                                case "tank":
                                    return `&7❈ ${cls.charAt(0).toUpperCase() + cls.slice(1)} &7${num}`
                                case "mage":
                                    return `&b✎ ${cls.charAt(0).toUpperCase() + cls.slice(1)} &7${num}`
                                case "healer":
                                    return `&a❤ ${cls.charAt(0).toUpperCase() + cls.slice(1)} &7${num}`
                                case "berserk":
                                    return `&c⚔ ${cls.charAt(0).toUpperCase() + cls.slice(1)} &7${num}`
                                case "archer":
                                    return `&6☣ ${cls.charAt(0).toUpperCase() + cls.slice(1)} &7${num}`
                                default:
                                    return `${cls} ${num}`
                            }
                        })
                        .join(" &8| ")

                    ChatLib.chat(`&5❀ &dSakura &5≫ &fIt will take &b${runsNeeded} &fM7 runs for &d${playerName} &fto reach &2⚛ Class Average &650 &7(${formattedBreakdown}&7)`)
                } else {
                    ChatLib.chat(`&5❀ &dSakura &5≫ &f(${username}) ${raw}`)
                }
            }).catch(error => {
                ChatLib.chat(`&5❀ &dSakura &5≫&c Request error: ${error}`)
            })

            break
            
        case "update":
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
                    ChatLib.chat("&5❀ &dSakura &5≫&c Failed to parse GitHub API response.")
                    return
                }

                let latestVersion = data.tag_name || data.name
                const htmlUrl = data.html_url || "https://github.com/wzuz/Sakura/releases"

                if (!latestVersion) {
                    ChatLib.chat("&5❀ &dSakura &5≫&c Could not determine latest version.")
                    return
                }

                const normalizedVersion = latestVersion.startsWith("v") ? latestVersion.substring(1) : latestVersion

                if (normalizedVersion === localVersion) {
                    ChatLib.chat("&5❀ &dSakura &5≫ &aYou are currently on the latest version.")
                } else {
                    ChatLib.chat(`&5❀ &dSakura &5≫ &eA new version &b${latestVersion} &eis available!`)
                    ChatLib.chat(`&aClick here:&b ${htmlUrl}`)
                }
            }).catch(error => {
                ChatLib.chat(`&5❀ &dSakura &5≫&c Update check failed: ${error}`)
            })

            break

        case "help":
            ChatLib.chat("&5❀ &dSakura &5≫ &7Available Commands:")
            ChatLib.chat("&b/sk &7- Opens the Sakura GUI")
            ChatLib.chat("&b/sk ping &7- Displays your current ping")
            ChatLib.chat("&b/sk rtca <username> &7- Shows number of M7 runs left till Class Average 50")
            ChatLib.chat("&b/sk update &7- Checks for the latest version of Sakura on GitHub")
            ChatLib.chat("&b/sk help &7- Shows this help message")
            break

        default:
            ChatLib.chat(`&cUnknown subcommand: &e${command} &7(type &b/sk help&7)`)
    }
}
