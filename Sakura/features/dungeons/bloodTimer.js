import config from "../../config"
import { isInDungeon } from "../utils/utils"

const S32PacketConfirmTransaction = Java.type("net.minecraft.network.play.server.S32PacketConfirmTransaction")

const bloodStartMessages = [
  "[BOSS] The Watcher: Things feel a little more roomy now, eh?",
  "[BOSS] The Watcher: Oh.. hello?",
  "[BOSS] The Watcher: I'm starting to get tired of seeing you around here...",
  "[BOSS] The Watcher: You've managed to scratch and claw your way here, eh?",
  "[BOSS] The Watcher: So you made it this far... interesting.",
  "[BOSS] The Watcher: Ah, we meet again...",
  "[BOSS] The Watcher: Ah, you've finally arrived.",
]

bloodStartTime = Date.now()
display = false
let bloodStartTicks

register("chat", (message) => {
  if (!config.bloodTimerEnabled || !isInDungeon()) return
  if (!bloodStartMessages.includes(message)) return
  bloodStartTime = Date.now()
  bloodStartTicks = 0
}).setCriteria("${message}")

register("packetReceived", () => {
  if (!config.bloodTimerEnabled || !isInDungeon()) return
  bloodStartTicks++
}).setFilteredClass(S32PacketConfirmTransaction)

register("chat", () => {
  if (!config.bloodTimerEnabled || !isInDungeon()) return

  const bloodMove = ((Date.now() - bloodStartTime) / 1000 + 0.10)
  const bloodMoveTicks = (bloodStartTicks * 0.05 + 0.10)

  const drift = (bloodMove - bloodMoveTicks).toFixed(2)         // signed drift
  const absDrift = Math.abs(drift)                              // for confidence scoring
  let bloodMovePredictionTicks

  // Prediction based on ticks
  if (bloodMoveTicks >= 31 && bloodMoveTicks <= 33.99) bloodMovePredictionTicks = (36 + (drift - 0.6)).toFixed(2)
  else if (bloodMoveTicks >= 28 && bloodMoveTicks <= 30.99) bloodMovePredictionTicks = (33 + (drift - 0.6)).toFixed(2)
  else if (bloodMoveTicks >= 25 && bloodMoveTicks <= 27.99) bloodMovePredictionTicks = (30 + (drift - 0.6)).toFixed(2)
  else if (bloodMoveTicks >= 22 && bloodMoveTicks <= 24.99) bloodMovePredictionTicks = (27 + (drift - 0.6)).toFixed(2)
  else if (bloodMoveTicks >= 1 && bloodMoveTicks <= 21.99)  bloodMovePredictionTicks = (24 + (drift - 0.6)).toFixed(2)

  if (!bloodMovePredictionTicks) {
    bloodMovePredictionTicks = "Invalid Prediction"
    ChatLib.chat(`&5❀ &dSakura &5≫&c Invalid Blood Prediction`)
    return
  }

  // Color based on drift
  let lagColor = "&a"
  if (absDrift >= 0.5) lagColor = "&c"
  else if (absDrift >= 0.2) lagColor = "&e"

  const driftSign = (drift > 0 ? "+" : drift < 0 ? "−" : "") // +-symbol
  const formattedDrift = `${lagColor}${driftSign}${Math.abs(drift)}s drift`

  // Chat output
  ChatLib.chat(`&5❀ &dSakura &5≫&f The Watcher took &b${bloodMovePredictionTicks} &fseconds to move &7(${formattedDrift}&7)`)

  // Display overlay logic
  displayText = `&3${bloodMovePredictionTicks}`
  display = true

  setTimeout(() => {
    display = false
    displayText = `&cKill Mobs`
  }, 1250)

  setTimeout(() => {
    display = true
  }, (parseFloat(((bloodMovePredictionTicks - bloodMoveTicks) * 1000) - 150).toFixed(2)))

  setTimeout(() => {
    display = false
  }, (parseFloat(((bloodMovePredictionTicks - bloodMoveTicks) * 1000) + 850).toFixed(2)))
}).setCriteria("[BOSS] The Watcher: Let's see how you can handle this.")

register("renderOverlay", () => {
  if (!display || !config.bloodTimerEnabled || !isInDungeon()) return
  const scale = 3
  Renderer.scale(scale)
  Renderer.drawStringWithShadow(displayText, (Renderer.screen.getWidth() / scale - Renderer.getStringWidth(displayText)) / 2, Renderer.screen.getHeight() / scale / 2 - 15)
})
