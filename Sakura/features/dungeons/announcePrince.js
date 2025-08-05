import config from "../../config"

register("chat", (message) => {
    if (!config.announcePrince) return

    if (message.trim() === "A Prince falls. +1 Bonus Score") {
        ChatLib.command("pc Prince Killed!")
    }
}).setChatCriteria("${message}").setContains()
