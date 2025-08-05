import config from "../../config"

const meowReplies = [
  "meow :3",
  ":cat:",
  "meow meow!",
  "rawr~",
  "meow",
  "meow~"
]

let lastMeowTime = 0
let lastMeowSender = null
const cooldown = 3000

register("chat", (username, message, event) => {
  if (!config.meow) return

  const fullMessage = message.toLowerCase()
  const strippedName = username.removeFormatting().replace(/\[[^\]]+\] ?/, "")

  if (!fullMessage.includes("meow")) return

  const now = Date.now()
  const isSelf = strippedName === Player.getName()
  const timeSinceLastMeow = now - lastMeowTime

  lastMeowTime = now
  lastMeowSender = strippedName

  if (isSelf) return
  if (timeSinceLastMeow < cooldown) return

  const reply = meowReplies[Math.floor(Math.random() * meowReplies.length)]
  setTimeout(() => {
    ChatLib.command(`pc ${reply}`)
  }, 50 + Math.random() * 100)
}).setChatCriteria("Party > ${username}: ${message}")
