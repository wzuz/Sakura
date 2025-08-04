import config from "../../config"
import { isInDungeon } from "../utils/utils"

let bonzoCooldownEnd = 0
let spiritCooldownEnd = 0
let phoenixCooldownEnd = 0

register("chat", (event) => {
  if (!config.masksTimerEnabled || !isInDungeon()) return

  const msg = ChatLib.getChatMessage(event)

  if (msg.includes("Bonzo's Mask saved your life!")) {
    bonzoCooldownEnd = Date.now() + 180000 // 180s
  }

  if (msg.includes("Second Wind Activated! Your Spirit Mask saved your life!")) {
    spiritCooldownEnd = Date.now() + 30000 // 30s
  }

  if (msg.includes("Your Phoenix Pet saved you from certain death!")) {
    phoenixCooldownEnd = Date.now() + 60000 // 60s
  }
})

register("renderOverlay", () => {
  if (!config.masksTimerEnabled || !isInDungeon()) return

  // Bonzo
  const bonzoRemaining = bonzoCooldownEnd - Date.now()
  const bonzoText = bonzoRemaining > 0
    ? `§9Bonzo: §e${Math.ceil(bonzoRemaining / 1000)}s`
    : `§9Bonzo: §aReady`
  Renderer.drawStringWithShadow(bonzoText, 2, 175)

  // Spirit
  const spiritRemaining = spiritCooldownEnd - Date.now()
  const spiritText = spiritRemaining > 0
    ? `§bSpirit: §e${Math.ceil(spiritRemaining / 1000)}s`
    : `§bSpirit: §aReady`
  Renderer.drawStringWithShadow(spiritText, 2, 185)

  // Phoenix
  const phoenixRemaining = phoenixCooldownEnd - Date.now()
  const phoenixText = phoenixRemaining > 0
    ? `§6Phoenix: §e${Math.ceil(phoenixRemaining / 1000)}s`
    : `§6Phoenix: §aReady`
  Renderer.drawStringWithShadow(phoenixText, 2, 195)
})