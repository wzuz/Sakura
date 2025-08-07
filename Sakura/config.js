import {
    @ButtonProperty,
    @CheckboxProperty,
    Color,
    @ColorProperty,
    @PercentSliderProperty,
    @SelectorProperty,
    @SwitchProperty,
    @TextProperty,
    @Vigilant,
    @SliderProperty
} from '../Vigilance/index';

@Vigilant("Sakura", "§dSakura §8v0.0.9", {
  getCategoryComparator: () => (a, b) => {
    const categories = ["Dungeons", "Extras",]
    return categories.indexOf(a) - categories.indexOf(b)
  }
})
class Config {

    maskHudMover = new Gui()

   @SwitchProperty({
        name: "Sinseeker Timer",
        description: "Shows a 1 second countdown after teleporting with Sinseeker.\n§8by JohnCraftsYT",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    sinseekerEnabled = false
 
    @SwitchProperty({
        name: "Tactical Insertion Timer",
        description: "Shows a 3 second countdown after using Gorilla Tactics.",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    tacTimerEnabled = false

    @SwitchProperty({
        name: "0s Tactical Insertion Notification",
        description: "Notifies you before the Dungeon starts for 0s/IC using Gorilla Tactics.",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    zeroTacEnabled = false

    @TextProperty({
        name: "0s Tactical Insertion Title",
        description: "Set a custom title for 0s Tactical Insertion Notification.",
        category: "Dungeons",
        subcategory: "Dungeons",
        placeholder: "§l§5T.A.C"
    })
    zeroTacText = "§l§5T.A.C"

    @SwitchProperty({
        name: "Blood Timer",
        description: "Displays how long The Watcher took to move and notifies you when to kill mobs for dialogue skip.",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    bloodTimerEnabled = false

   @SwitchProperty({
        name: "Announce Prince Kill",
        description: "Announces Prince Kill in Party Chat.",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    announcePrince = false
   
    @SwitchProperty({
        name: "Rag Axe Reminder",
        description: "Notifies you when to use Ragnarock in M5, M6 and M7.",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    ragaxenotif = false

    @SwitchProperty({
        name: "Only Show Rag On DPS",
        description: "Only renders Ragnarock Notification when playing Archer, Berserker, or Mage.",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    ragondps = false

    @SwitchProperty({
        name: "Golem Shoutout",
        description: "Gives a shoutout to whoever wakes up golems before terras in M6.",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    golemShoutout = false

    @SwitchProperty({
        name: "Masks Timer",
        description: "Displays cooldowns for Bonzo's Mask, Spirit Mask, and Phoenix Pet.",
        category: "Dungeons",
        subcategory: "HUD"
    })
    masksTimerEnabled = false

    @ButtonProperty({
        name: "Move Mask Timer HUD",
        description: "Click to move the HUD (must be inside Dungeons).",
        category: "Dungeons",
        subcategory: "HUD",
        placeholder: "Move"
    })
    MoveMaskHud() {
        this.maskHudMover.open()
    }

    @SwitchProperty({
        name: "Pest Cooldown Alert",
        description: "Displays a title when Pest Cooldon is ready.",
        category: "Garden",
        subcategory: "Garden"
    })
    pestCooldownAlert = false

    @SwitchProperty({
        name: "Meow",
        description: "= ＾● ⋏ ●＾ =",
        category: "Extras",
        subcategory: "Extras"
    })
    meow = false

    @SwitchProperty({
        name: "Dub",
        description: "lucki my goat.",
        category: "Extras",
        subcategory: "Extras"
    })
    dub = false

    constructor() {
    this.initialize(this)
    this.addDependency("Only Show Rag On DPS", "Rag Axe Reminder")
    }
}

export default new Config()
