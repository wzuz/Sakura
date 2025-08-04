import config from "../../config"

let triggerTime = 0

register("playerInteract", (action, pos, event) => {
  if (!config.tacTimerEnabled) return

  const name = Player.getHeldItem()?.getName()?.removeFormatting()
  if (!name?.includes("Tactical Insertion")) return

  triggerTime = Date.now()
})

register("renderOverlay", () => {
  if (!config.tacTimerEnabled || triggerTime === 0) return

  const remaining = 3000 - (Date.now() - triggerTime)
  if (remaining > 0) {
    const text = (remaining / 1000).toFixed(1)
    Renderer.drawStringWithShadow(
      text,
      Renderer.screen.getWidth() / 2 - 6,
      Renderer.screen.getHeight() / 2 - 12
    )
  }
})