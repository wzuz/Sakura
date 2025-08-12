import config from './config'
import { checkForUpdate } from "./features/utils/utils"
import { handleCommand } from "./features/utils/commands"

register("command", (...args) => {
    const result = handleCommand(args)
    if (result === "open_gui") config.openGUI()
}).setName("sakura").setAliases("sk")

import './features/dungeons/sinseeker'
import './features/dungeons/tacTimer'
import './features/dungeons/zerotac'
import './features/dungeons/bloodTimer'
import './features/dungeons/masksTimer'
import './features/dungeons/announcePrince'
import './features/dungeons/ragaxe'
import './features/dungeons/lividTimer'
import './features/dungeons/golemshoutout'
import './features/extras/meow'
import './features/garden/pestCooldown'
import './features/extras/dub'

register("worldLoad", () => {
    setTimeout(() => {
        checkForUpdate(true)
    }, 3000)
})
