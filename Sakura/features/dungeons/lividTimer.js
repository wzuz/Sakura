import config from "../../config"

let lividTriggerTime = 0
let tickCount = 0
let packetReceived

register("chat", () => {
    if (!config.lividTimer) return
    
    tickCount = 0
    lividTriggerTime = 0

    packetReceived = register("packetReceived", () => {
        tickCount++

        if (tickCount === 195) { 
            lividTriggerTime = Date.now()
        }

        if (tickCount >= 395) {
            packetReceived.unregister()
        }
    }).setFilteredClass(Java.type("net.minecraft.network.play.server.S32PacketConfirmTransaction"))

}).setCriteria("[BOSS] Livid: Welcome, you've arrived right on time. I am Livid, the Master of Shadows.")

register("renderOverlay", () => {
    if (!config.lividTimer || lividTriggerTime === 0) return

    const remaining = 10000 - (Date.now() - lividTriggerTime)
    if (remaining > 0) {
        const text = (remaining / 1000).toFixed(1)
        Renderer.drawStringWithShadow(
            text,
            Renderer.screen.getWidth() / 2 - 6,
            Renderer.screen.getHeight() / 2 - 12
        )
    }
})