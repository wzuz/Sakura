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

register('packetReceived', () => {
  if (!config.bloodTimerEnabled || !isInDungeon()) return
  bloodStartTicks++
}).setFilteredClass(S32PacketConfirmTransaction)

register("chat", () => {
  if (!config.bloodTimerEnabled || !isInDungeon()) return
  
  let bloodMove = ((Math.floor((Date.now() - bloodStartTime)/10)/100) + 0.10).toFixed(2)
  let bloodMoveTicks = (bloodStartTicks*0.05+0.1).toFixed(2)
  let bloodMovePredictionTicks
  let bloodMoveLag

  bloodMoveLag = (bloodMove - bloodMoveTicks)
    if (bloodMoveTicks >= 31 && bloodMoveTicks <= 33.99) bloodMovePredictionTicks = (36 + bloodMoveLag - 0.6).toFixed(2)
    if (bloodMoveTicks >= 28 && bloodMoveTicks <= 30.99) bloodMovePredictionTicks = (33 + bloodMoveLag - 0.6).toFixed(2)
    if (bloodMoveTicks >= 25 && bloodMoveTicks <= 27.99) bloodMovePredictionTicks = (30 + bloodMoveLag - 0.6).toFixed(2)
    if (bloodMoveTicks >= 22 && bloodMoveTicks <= 24.99) bloodMovePredictionTicks = (27 + bloodMoveLag - 0.6).toFixed(2)
    if (bloodMoveTicks >= 1 && bloodMoveTicks <= 21.99) bloodMovePredictionTicks = (24 + bloodMoveLag - 0.6).toFixed(2)
    if (!bloodMovePredictionTicks) bloodMovePredictionTicks = "Invalid Prediction"
  else predicted = "&5❀ &dSakura &5≫&f Invalid Blood Prediction"
  ChatLib.chat(`&5❀ &dSakura &5≫&f The Watcher took &b${bloodMovePredictionTicks} &fseconds to move.`)
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
});