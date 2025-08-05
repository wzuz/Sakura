import config from "../../config"

const AutoDub = ["dub"]

let lastDubTime = 0
let lastDubSender = null
const dubCooldown = 3000

register("chat", (username, message, event) => {
  if (!config.dub) return

  const strippedName = username.removeFormatting().replace(/\[[^\]]+\] ?/, "")
  const msgLower = message.toLowerCase()

  if (!msgLower.includes("dub")) return

  const now = Date.now()
  const isSelf = strippedName === Player.getName()
  const timeSinceLastDub = now - lastDubTime

  lastDubTime = now
  lastDubSender = strippedName

  if (isSelf) return

  if (timeSinceLastDub < dubCooldown) return

  const reply = AutoDub[Math.floor(Math.random() * AutoDub.length)]
  setTimeout(() => {
    ChatLib.command(`pc ${reply}`)
  }, 50 + Math.random() * 100)
}).setChatCriteria("Party > ${username}: ${message}")
