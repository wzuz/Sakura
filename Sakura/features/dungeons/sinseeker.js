import config from "../../config"

let lastTP = 0

register("playerInteract", () => {
  if (config.sinseekerEnabled && Player.getHeldItem()?.getName()?.removeFormatting()?.includes("Sinseeker Scythe")) {
    lastTP = Date.now()
  }
})

register("renderOverlay", () => {
  if (!config.sinseekerEnabled) return
  const rem = 1000 - (Date.now() - lastTP)
  if (rem > 0) Renderer.drawStringWithShadow(
    ~~(rem / 100),
    Renderer.screen.getWidth() / 2 - 2,
    Renderer.screen.getHeight() / 2 - 12
  )
})

// Credits of the original Sinseeker module go to JohnCraftsYT
