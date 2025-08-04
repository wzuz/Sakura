import config from "../../config"

let last_tp = 0

register("playerInteract", (action, position, event) => {
  if (!config.sinseekerEnabled) return

  const name = Player.getHeldItem()?.getName()?.removeFormatting()
  if (!name?.includes("Sinseeker Scythe")) return

  last_tp = Date.now()
})

register("renderOverlay", () => {
  if (!config.sinseekerEnabled) return

  const remaining = 1000 - (Date.now() - last_tp)
  if (remaining > 0) {
    Renderer.drawStringWithShadow(
      parseInt(remaining / 100),
      Renderer.screen.getWidth() / 2 - 2,
      Renderer.screen.getHeight() / 2 - 12
    )
  }
})