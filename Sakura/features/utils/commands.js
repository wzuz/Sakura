import config from "../../config"
const { request } = require("requestV2")

// ------------------------------
// Helpers
// ------------------------------
function handleRtca(username, sendFn, stripColors = false) {
    const url = `https://soopy.dev/api/soopyv2/botcommand?m=rtca&u=${username}`

    request({
        url: url,
        method: "GET",
        text: true
    }).then(raw => {
        const regex = /It will take ([\d,]+) m7 runs for (\w+) to reach class average 50 \((.*)\)/i
        const match = raw.match(regex)

        let out
        if (match) {
            const runsNeeded = match[1]
            const playerName = match[2]
            const classBreakdown = match[3]

            if (runsNeeded === "0" && (!classBreakdown || classBreakdown.trim() === "")) {
                out = `&5❀ &dSakura &5≫ &b${playerName} &fhas already reached &2⚛ Class Average &650`
            } else {
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

                out = `&5❀ &dSakura &5≫ &fIt will take &b${runsNeeded} &fM7 runs for &d${playerName} &fto reach &2⚛ Class Average &650 &7(${formattedBreakdown}&7)`
            }
        } else {
            out = `&5❀ &dSakura &5≫ &f(${username}) ${raw}`
        }

        if (stripColors) {
            out = out.replace(/§.|&./g, "")
        }

        sendFn(out)
    }).catch(error => {
        let msg = `&5❀ &dSakura &5≫&c Request error: ${error}`
        if (stripColors) msg = msg.replace(/§.|&./g, "")
        sendFn(msg)
    })
}

// ------------------------------
// /sakura or /sk commands
// ------------------------------
export function handleCommand(args) {
    const command = args[0]?.toLowerCase()

    switch (command) {
        case undefined:
        case "gui":
        case "settings":
            return "open_gui"

        case "ping": 
            const C16PacketClientStatus = Java.type("net.minecraft.network.play.client.C16PacketClientStatus")
            const EnumState = Java.type("net.minecraft.network.play.client.C16PacketClientStatus$EnumState")
            const S37PacketStatistics = Java.type("net.minecraft.network.play.server.S37PacketStatistics")
            const System = Java.type("java.lang.System")

            if (typeof sakuraPingInFlight === "undefined") sakuraPingInFlight = false
            if (typeof sakuraPingStartNano === "undefined") sakuraPingStartNano = 0
            if (typeof sakuraPingListenerRegistered === "undefined") sakuraPingListenerRegistered = false

            if (sakuraPingInFlight) {
                ChatLib.chat("&5❀ &dSakura &5≫&e Already pinging. Patience is a virtue.")
                break
            }

            if (!sakuraPingListenerRegistered) {
                register("packetReceived", () => {
                if (!sakuraPingInFlight) return
                const deltaNs = System.nanoTime() - sakuraPingStartNano
                sakuraPingInFlight = false

                const rtt = deltaNs / 1e6
                const rttStr = rtt.toFixed(2)
                const color =
                    rtt < 100 ? "&a" :
                    rtt < 150 ? "&2" :
                    rtt < 200 ? "&e" :
                    rtt < 250 ? "&6" :
                    rtt < 300 ? "&c" : "&4"

                ChatLib.chat(`&5❀ &dSakura &5≫&r ${color}${rttStr}&7ms`)
                }).setFilteredClass(S37PacketStatistics)
                sakuraPingListenerRegistered = true
            }

            try {
                const netHandler = Client.getMinecraft().func_147114_u()
                sakuraPingInFlight = true
                sakuraPingStartNano = System.nanoTime()
                const pkt = new C16PacketClientStatus(EnumState.REQUEST_STATS)
                netHandler.func_147297_a(pkt)
            } catch (e) {
                sakuraPingInFlight = false
                ChatLib.chat(`&5❀ &dSakura &5≫&c Ping check failed: ${e}`)
            }
            break

        case "rtca": {
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
        }

        case "update": {
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
        }

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

// ------------------------------
// Chat commands (!<command>)
// ------------------------------

// !rtca (Party, Guild, From msg)
register("chat", (player, message) => {
    if (!config.chatCommands) return
    const match = message.match(/^!rtca(?:\s+(\w+))?$/i)
    if (!match) return
    const cleanPlayer = player.replace(/(\[[^\]]+\]\s*)/g, "").trim()
    const username = match[1] ? match[1] : cleanPlayer
    const partySend = msg => ChatLib.command(`pc ${msg}`)
    handleRtca(username, partySend, true)
}).setChatCriteria("Party > ${player}: ${message}").setParameter("contains")

register("chat", (player, message) => {
    if (!config.chatCommands) return
    const match = message.match(/^!rtca(?:\s+(\w+))?$/i)
    if (!match) return
    const cleanPlayer = player.replace(/(\[[^\]]+\]\s*)/g, "").trim()
    const username = match[1] ? match[1] : cleanPlayer
    const msgSend = msg => ChatLib.command(`msg ${cleanPlayer} ${msg}`)
    handleRtca(username, msgSend, true)
}).setChatCriteria("From ${player}: ${message}").setParameter("contains")

register("chat", (player, message) => {
    if (!config.chatCommands) return
    const match = message.match(/^!rtca(?:\s+(\w+))?$/i)
    if (!match) return
    const cleanPlayer = player.replace(/(\[[^\]]+\]\s*)/g, "").trim()
    const username = match[1] ? match[1] : cleanPlayer
    const guildSend = msg => ChatLib.command(`gc ${msg}`)
    handleRtca(username, guildSend, true)
}).setChatCriteria("Guild > ${player}: ${message}").setParameter("contains")
