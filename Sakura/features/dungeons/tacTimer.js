import config from "../../config"

const DURATION = 3000
let triggerTime = 0

const isActive = () => triggerTime !== 0 && (Date.now() - triggerTime) < DURATION

register("playerInteract", (action, pos, event) => {
  if (!config.tacTimerEnabled) return

  if (isActive()) return

  const name = Player.getHeldItem()?.getName()?.removeFormatting()
  if (!name?.includes("Tactical Insertion")) return

  triggerTime = Date.now()
})

register("renderOverlay", () => {
  if (!config.tacTimerEnabled || !isActive()) {
    if (triggerTime !== 0 && (Date.now() - triggerTime) >= DURATION) triggerTime = 0
    return
  }

  const remaining = DURATION - (Date.now() - triggerTime)
  const text = (remaining / 1000).toFixed(1)

  Renderer.drawStringWithShadow(
    text,
    Renderer.screen.getWidth() / 2 - 6,
    Renderer.screen.getHeight() / 2 - 12
  )
})
