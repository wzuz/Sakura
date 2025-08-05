export function handleCommand(args) {
    const command = args[0]?.toLowerCase()

    switch (command) {
        case undefined:
        case "gui":
        case "settings":
            return "open_gui"

        case "ping":
            ChatLib.chat("&5❀ &dSakura &5≫ Pong!")
            break

        case "help":
            ChatLib.chat("&5❀ &dSakura &5≫ &7Available Commands:")
            ChatLib.chat("&b/sk &7- Open the Sakura GUI")
            ChatLib.chat("&b/sk ping &7- Check if Sakura is active")
            ChatLib.chat("&b/sk help &7- Shows this help message")
            break

        default:
            ChatLib.chat(`&cUnknown subcommand: &e${command} &7(type &b/sk help&7)`)
    }
}
