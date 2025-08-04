import config from "../../config"

const AutoDub = [
  "dub"
]

let lastDubTime = 0
const dubCooldown = 3000

register("chat", (username, message, event) => {
  if (!config.dub) return

  const strippedName = username.removeFormatting().replace(/\[[^\]]+\] ?/, "")
  if (strippedName === Player.getName()) return

  if (!message.toLowerCase().includes("dub")) return
  if (Date.now() - lastDubTime < dubCooldown) return

  lastDubTime = Date.now()

  const reply = AutoDub[Math.floor(Math.random() * AutoDub.length)]
  setTimeout(() => {
    ChatLib.command(`pc ${reply}`)
  }, 50 + Math.random() * 100)

}).setChatCriteria("Party > ${username}: ${message}")