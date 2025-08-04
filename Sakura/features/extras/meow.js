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
const cooldown = 3000

register("chat", (username, message, event) => {
  if (!config.meow) return

  const fullMessage = message.toLowerCase()

  const strippedName = username.removeFormatting().replace(/\[[^\]]+\] ?/, "")
  if (strippedName === Player.getName()) return

  if (!fullMessage.includes("meow")) return
  if (Date.now() - lastMeowTime < cooldown) return

  lastMeowTime = Date.now()

  const reply = meowReplies[Math.floor(Math.random() * meowReplies.length)]
  setTimeout(() => {
    ChatLib.command(`pc ${reply}`)
  }, 50 + Math.random() * 100)

}).setChatCriteria("Party > ${username}: ${message}")