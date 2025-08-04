import config from "../../config"

let pestReady = false

register("tick", () => {
  if (!config.pestCooldownAlert) return

  const tabLines = TabList.getNames()

  for (let line of tabLines) {
    line = line.removeFormatting()

    if (line.includes("Cooldown:")) {
      if (line.includes("READY")) {
        if (!pestReady) {
          Client.showTitle("&2Pest Cooldown &aReady&r&2!", "", 0, 40, 0)
          World.playSound("random.orb", 1, 1)
          pestReady = true
        }
      } else {
        pestReady = false
      }
    }
  }
})