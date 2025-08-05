import config from "../../config"
import { data } from "../data"
import { isInDungeon } from "../utils/utils"

// Cooldowns
let bonzoCooldownEnd = 0
let spiritCooldownEnd = 0
let phoenixCooldownEnd = 0

// Move HUD logic
register("dragged", (dx, dy, x, y, bn) => {
    if (!config.maskHudMover.isOpen() || bn == 2) return
    data.masksTimerPos.x = x
    data.masksTimerPos.y = y
    data.save()
})

//register("scrolled", (x, y, dir) => {
//    if (!config.maskHudMover.isOpen()) return
//   if (dir == 1) data.masksTimerPos.scale += 0.05
//    else data.masksTimerPos.scale -= 0.05
//    data.save()
//})

register("guiMouseClick", (x, y, bn) => {
    if (!config.maskHudMover.isOpen() || bn != 2) return
    data.masksTimerPos = {
        x: Renderer.screen.getWidth() / 2,
        y: Renderer.screen.getHeight() / 2 + 10,
        scale: 1
    }
    data.save()
})

// Listen for mask triggers
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

// Render HUDS
register("renderOverlay", () => {
    if (!config.masksTimerEnabled || !isInDungeon()) return

    const { x, y, scale } = data.masksTimerPos
    Renderer.scale(scale)

    // Draw background if moving
    if (config.maskHudMover.isOpen()) {
        Renderer.drawRect(Renderer.GRAY, x / scale - 2, y / scale - 2, 124, 34)
    }

    // Bonzo
    const bonzoRemaining = bonzoCooldownEnd - Date.now()
    const bonzoText = bonzoRemaining > 0
        ? `§9Bonzo: §e${Math.ceil(bonzoRemaining / 1000)}s`
        : `§9Bonzo: §aReady`
    Renderer.drawStringWithShadow(bonzoText, x / scale, y / scale)

    // Spirit
    const spiritRemaining = spiritCooldownEnd - Date.now()
    const spiritText = spiritRemaining > 0
        ? `§bSpirit: §e${Math.ceil(spiritRemaining / 1000)}s`
        : `§bSpirit: §aReady`
    Renderer.drawStringWithShadow(spiritText, x / scale, y / scale + 10)

    // Phoenix
    const phoenixRemaining = phoenixCooldownEnd - Date.now()
    const phoenixText = phoenixRemaining > 0
        ? `§6Phoenix: §e${Math.ceil(phoenixRemaining / 1000)}s`
        : `§6Phoenix: §aReady`
    Renderer.drawStringWithShadow(phoenixText, x / scale, y / scale + 20)

    Renderer.scale(1)
})

//Big thanks to Tanner and Lisa for help with gui <3
