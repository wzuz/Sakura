const { request } = require("requestV2")

export function handleCommand(args) {
    const command = args[0]?.toLowerCase()

    switch (command) {
        case undefined:
        case "gui":
        case "settings":
            return "open_gui"

         case "ping":
            ChatLib.chat("&5❀ &dSakura &5≫&f This feature has not been enabled yet.")
            break

        case "rtca":
            if (!args[1]) {
                ChatLib.chat("&cUsage: /sk rtca <username>")
                break
            }

            const username = args[1]
            const url = `https://soopy.dev/api/soopyv2/botcommand?m=rtca&u=${username}`

            request({
                url: url,
                method: "GET",
                text: true
            }).then(raw => {
                ChatLib.chat(`&5❀ &dSakura &5≫ &f${raw}`)
            }).catch(error => {
                ChatLib.chat(`&5❀ &dSakura &5≫&c Request error: ${error}`)
            })

            break

        case "help":
            ChatLib.chat("&5❀ &dSakura &5≫ &7Available Commands:")
            ChatLib.chat("&b/sk &7- Open the Sakura GUI")
            ChatLib.chat("&b/sk ping &7- Check your current ping")
            ChatLib.chat("&b/sk rtca <username> &7- Check M7 runs left till Class Average 50")
            ChatLib.chat("&b/sk help &7- Shows this help message")
            break

        default:
            ChatLib.chat(`&cUnknown subcommand: &e${command} &7(type &b/sk help&7)`)
    }
}
