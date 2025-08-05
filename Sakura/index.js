import config from './config'

register("command", () => {
    config.openGUI()
}).setName("sakura").setAliases("sk")

import './features/dungeons/sinseeker'
import './features/dungeons/tacTimer'
import './features/dungeons/zerotac'
import './features/dungeons/bloodTimer'
import './features/dungeons/masksTimer'
import './features/dungeons/announcePrince'
import './features/dungeons/ragaxe'
import './features/dungeons/golemshoutout'
import './features/extras/helloChat'
import './features/extras/meow'
import './features/garden/pestCooldown'
import './features/extras/dub'
