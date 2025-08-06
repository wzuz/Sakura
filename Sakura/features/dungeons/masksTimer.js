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

register("scrolled", (x, y, dir) => {
    if (!config.maskHudMover.isOpen()) return
    if (dir == 1) data.masksTimerPos.scale += 0.05
    else data.masksTimerPos.scale -= 0.05
    scale = data.masksTimerPos.scale
    data.save() 
})

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

    let { x, y, scale } = data.masksTimerPos

    const now = Date.now()
    const spiritRemaining = spiritCooldownEnd - now
    const bonzoRemaining = bonzoCooldownEnd - now
    const phoenixRemaining = phoenixCooldownEnd - now

    const spiritText = spiritRemaining > 0
        ? `§bSpirit: §e${Math.ceil(spiritRemaining / 1000)}s`
        : `§bSpirit: §aReady`
    const bonzoText = bonzoRemaining > 0
        ? `§9Bonzo: §e${Math.ceil(bonzoRemaining / 1000)}s`
        : `§9Bonzo: §aReady`
    const phoenixText = phoenixRemaining > 0
        ? `§6Phoenix: §e${Math.ceil(phoenixRemaining / 1000)}s`
        : `§6Phoenix: §aReady`

    let masksText = new Text("", 0, 0).setShadow(true).setAlign("left").setFormatted(true)
    let drawString = 
                    ` ${spiritText}\n` +
                    ` ${bonzoText}\n` +
                    ` ${phoenixText}\n` 

    // rectangle box thingy
    if (config.maskHudMover.isOpen()) {
        Renderer.drawRect(Renderer.GRAY, x - 2, y - 2, 124 * scale, 34 * scale)
        masksText.setString(drawString)
        masksText.setScale(scale)
        masksText.draw(x, y)
    }
    masksText.setString(drawString)
    masksText.setScale(scale)
    masksText.draw(x, y)

})

// Big thanks to Lisa and Tanner for help with issues <3
