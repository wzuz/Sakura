import config from "../../config"
import { isInDungeon } from "../utils/utils"

let showTitleUntil = 0

register("chat", () => {
  if (!config.zeroTacEnabled || !isInDungeon()) return
  showTitleUntil = Date.now() + 1500
  World.playSound("mob.cat.meow", 7, 1)
}).setChatCriteria("Starting in 3 seconds.").setContains()

register("renderOverlay", () => {
  if (!config.zeroTacEnabled || !isInDungeon()) return
  if (Date.now() < showTitleUntil) {
    const scale = 7
    const text =  config.zeroTacText

    Renderer.scale(scale)
    Renderer.drawStringWithShadow(
      text,
      (Renderer.screen.getWidth() / scale - Renderer.getStringWidth(text)) / 2,
      (Renderer.screen.getHeight() / scale) / 2 - 10
    )
    Renderer.scale(1 / scale)
  }
})
