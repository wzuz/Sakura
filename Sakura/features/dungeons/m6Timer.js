import config from "../../config"
import { data } from "../data"

// ================= Triggers (regex) =================
const M6_INTRO_REGEX = /^\[BOSS\] Sadan: So you made it all the way here\.\.\. Now you wish to defy me\? Sadan\?!$/;
const M6_GIANTS_START_REGEX = /^\[BOSS\] Sadan: ENOUGH!$/;
const M6_SADAN_START_REGEX = /^\[BOSS\] Sadan: You did it\. I understand now, you have earned my respect\.$/;
const M6_BOSS_END_PARTIAL = /Defeated Sadan in/i;

// ================= State =================
let tickCount = 0;
let packetListener = null;
let running = false;

// Split tick marks
let split_t_start = -1;      // Terracottas start (0)
let split_giants_start = -1; // Giants start
let split_sadan_start = -1;  // Sadan start
let split_end = -1;          // End (for Total)

// NEW: Gyro bookkeeping (Terracottas only)
const EXPECTED_ZONES = ["B", "A", "B", "A", "B"]; // Gyros 1..5 expected zones
let gyroTimes  = [-1, -1, -1, -1, -1];            // tickCount at detection
let gyroZones  = ["-", "-", "-", "-", "-"];       // "A"/"B"

// ================= GUI (HUD move) =================
register("dragged", (dx, dy, x, y, bn) => {
  if (!config.m6TimerHudMover.isOpen() || bn == 2) return
  data.m6Timer.x = x
  data.m6Timer.y = y
  data.save()
})

register("scrolled", (x, y, dir) => {
  if (!config.m6TimerHudMover.isOpen()) return
  if (dir == 1) data.m6Timer.scale += 0.05
  else data.m6Timer.scale -= 0.05
  data.save()
})

register("guiMouseClick", (x, y, bn) => {
  if (!config.m6TimerHudMover.isOpen() || bn != 2) return
  data.m6Timer.x = Renderer.screen.getWidth() / 2
  data.m6Timer.y = Renderer.screen.getHeight() / 2 + 10
  data.m6Timer.scale = 1
  data.save()
})

// ================= Helpers =================
function resetAll() {
  tickCount = 0;
  running = false;
  if (packetListener) {
    try { packetListener.unregister(); } catch (e) {}
    packetListener = null;
  }
  split_t_start = -1;
  split_giants_start = -1;
  split_sadan_start = -1;
  split_end = -1;

  // reset gyro state & locks
  gyroTimes = [-1, -1, -1, -1, -1];
  gyroZones = ["-", "-", "-", "-", "-"];
  lockUntil.A = 0;
  lockUntil.B = 0;
}

function startTickCounter() {
  if (packetListener) return;
  tickCount = 0;
  running = true;
  // Keep listener registered (no increment here; timing is from client tick)
  packetListener = register("packetReceived", () => {
    if (split_end >= 0) {
      try { packetListener.unregister(); } catch (e) {}
      packetListener = null;
      running = false;
    }
  }).setFilteredClass(Java.type("net.minecraft.network.play.server.S32PacketConfirmTransaction"));
}

// Tick fallback (≈20 per second, TPS-dependent)
register("tick", () => {
  if (running && split_end < 0) tickCount++;
});

// ticks delta → "ss.ss" (e.g., 12.80)
function fmtTicksDelta(tStart, tEnd) {
  if (tStart < 0 || tEnd < 0) return "—";
  const dt = Math.max(0, tEnd - tStart);
  return (dt / 20).toFixed(2);
}

// ================= Chat hooks =================

// Start: intro → start Terras & Total
register("chat", (message) => {
  if (!config.m6Timer) return;
  const msg = message.trim();
  if (M6_INTRO_REGEX.test(msg)) {
    resetAll();
    startTickCounter();
    split_t_start = 0; // Terras start at tick 0
    ChatLib.chat("&7[Debug] M6 Timer started — Terracottas & Total at 0");
  }
}).setChatCriteria("${message}");

// Terras → Giants
register("chat", (message) => {
  if (!config.m6Timer || !running) return;
  const msg = message.trim();
  if (M6_GIANTS_START_REGEX.test(msg)) {
    if (split_giants_start < 0) {
      split_giants_start = tickCount;
      const terrasStr = fmtTicksDelta(split_t_start, split_giants_start);
      ChatLib.chat(`&7[Debug] Phase switch: Terracottas → Giants | Terracottas: &f${terrasStr}s`);
    }
  }
}).setChatCriteria("${message}");

// Giants → Sadan
register("chat", (message) => {
  if (!config.m6Timer || !running) return;
  const msg = message.trim();
  if (M6_SADAN_START_REGEX.test(msg)) {
    if (split_sadan_start < 0) {
      if (split_giants_start < 0) split_giants_start = tickCount; // edge: 0-length giants
      split_sadan_start = tickCount;
      const giantsStr = fmtTicksDelta(split_giants_start, split_sadan_start);
      ChatLib.chat(`&7[Debug] Phase switch: Giants → Sadan | Giants: &f${giantsStr}s`);
    }
  }
}).setChatCriteria("${message}");

// Boss end (server “Defeated Sadan in …” line) (only while in boss)
register("chat", (message, event) => {
  if (!config.m6Timer || !running) return;
  if (event && event.sender) return; // server/system only

  const msg = message.trim();
  if (M6_BOSS_END_PARTIAL.test(msg)) {
    if (split_end < 0) split_end = tickCount;

    // compute all splits
    const terracottasStr = fmtTicksDelta(split_t_start, split_giants_start >= 0 ? split_giants_start : (split_sadan_start >= 0 ? split_sadan_start : split_end));
    const giantsStr      = (split_giants_start >= 0) ? fmtTicksDelta(split_giants_start, split_sadan_start >= 0 ? split_sadan_start : split_end) : (split_sadan_start >= 0 ? "0.00" : "—");
    const sadanStr       = (split_sadan_start >= 0) ? fmtTicksDelta(split_sadan_start, split_end) : "—";
    const totalStr       = fmtTicksDelta(0, split_end);

    setTimeout(() => {
      ChatLib.chat(`&5❀ &dSakura &5≫ &rTerracottas: &b${terracottasStr}s &r| Giants: &b${giantsStr}s &r| Sadan: &b${sadanStr}s &r| Total: &b${totalStr}s`);
    }, 200);

    if (packetListener) {
      try { packetListener.unregister(); } catch (e) {}
      packetListener = null;
    }
    running = false;
  }
}).setChatCriteria("${message}");

// world unload → stop and reset
register("worldUnload", () => {
  if (running && split_end < 0) {
    split_end = tickCount;
  }
  resetAll();
  ChatLib.chat("&7[Debug] M6 Timer reset (world unload)");
});

// ================= Overlay =================
register("renderOverlay", () => {
  if (!config.m6Timer) return;
  if (split_t_start < 0) return;
  let { x, y, scale } = data.m6Timer

  const nowT = (split_end >= 0 ? split_end : tickCount);

  const terrasEnd = (split_giants_start >= 0 ? split_giants_start : (split_sadan_start >= 0 ? split_sadan_start : nowT));
  const giantsEnd = (split_sadan_start >= 0 ? split_sadan_start : nowT);
  const totalEnd  = nowT;

  const terracottasStr = fmtTicksDelta(split_t_start, terrasEnd);
  const giantsStr      = (split_giants_start >= 0) ? fmtTicksDelta(split_giants_start, giantsEnd) : (split_sadan_start >= 0 ? "0.00" : "—");
  const sadanStr       = (split_sadan_start >= 0) ? fmtTicksDelta(split_sadan_start, totalEnd) : "—";
  const totalStr       = fmtTicksDelta(0, totalEnd);

  function gyroLine(i) {
    const t = gyroTimes[i];
    const z = gyroZones[i];
    const s = (t >= 0) ? fmtTicksDelta(split_t_start, t) : "—";
    // ordinal suffixes for display
    const suffix = ["st","nd","rd","th","th"][i] || "th"
    return `§d${i+1}${suffix} gyro: §f${s}s §7[${z}]`;
  }

  let timerText = new Text("", 0, 0).setShadow(true).setAlign("left").setFormatted(true)
  let lines =
    `§6Terracottas: §f${terracottasStr}s\n`+
    `§aGiants: §f${giantsStr}s\n`+
    `§cSadan: §f${sadanStr}s\n`+
    `${gyroLine(0)}\n`+
    `${gyroLine(1)}\n`+
    `${gyroLine(2)}\n`+
    `${gyroLine(3)}\n`+
    `${gyroLine(4)}\n`+
    `§5Total: §f${totalStr}s`
  timerText.setString(lines)
  timerText.setScale(scale)
  timerText.draw(x, y)
});

// ===== Gyro =====
const S2A = Java.type("net.minecraft.network.play.server.S2APacketParticles")

const GYRO_SOUND    = "mob.endermen.portal"
const GYRO_PARTICLE = "spell_witch"

const WINDOW_MS       = 160
const SOUND_MIN_COUNT = 6
const Z_SPLIT         = 41.5
const CAST_LOCK_MS    = 2300   // per-zone lock duration

let soundEvents = []   // {t,x,y,z}
let lastSpellTs = 0
const lockUntil = { A: 0, B: 0 }

const nowMs = () => Date.now()
const zone = z => (z >= Z_SPLIT ? "A" : "B")

function prune(t) {
  const cutoff = t - WINDOW_MS
  while (soundEvents.length && soundEvents[0].t < cutoff) soundEvents.shift()
}
function hasBurst(t) {
  prune(t)
  return soundEvents.length >= SOUND_MIN_COUNT
}

// record into the next free gyro slot (Terracottas only)
function recordGyro(x, y, z) {
  if (!running) return
  if (split_t_start < 0) return
  if (split_giants_start >= 0) return // only during Terras

  const idx = gyroTimes.findIndex(v => v < 0)  // 0..4, or -1 if full
  if (idx === -1) return

  gyroTimes[idx] = tickCount
  const Z = zone(z)
  gyroZones[idx] = Z

  // Optional: sanity check vs expected zone sequence (comment out if unwanted)
  const exp = EXPECTED_ZONES[idx]
  if (exp && exp !== Z) {
    ChatLib.chat(`&7[Debug] Gyro #${idx+1} zone mismatch: expected ${exp}, got ${Z}`)
  }
}

// fire helper (per-zone lock)
function tryFire(x, y, z) {
  const t = nowMs()
  const Z = zone(z)
  if (t < lockUntil[Z]) return
  lockUntil[Z] = t + CAST_LOCK_MS

  // record split/zone
  recordGyro(x, y, z)

  // Debug line for confirmation
  ChatLib.chat(`&d[DEBUG] Gyro @ &f${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)} &7[Zone ${Z}]`)
}

// sounds
register("soundPlay", (pos, name) => {
  if (String(name) !== GYRO_SOUND) return
  const t = nowMs()
  const x = pos ? pos.getX() : Player.getX()
  const y = pos ? pos.getY() : Player.getY()
  const z = pos ? pos.getZ() : Player.getZ()
  soundEvents.push({ t, x, y, z })
  prune(t)

  if (t - lastSpellTs <= WINDOW_MS && hasBurst(t)) {
    tryFire(x, y, z)
  }
})

// particles
register("packetReceived", (p) => {
  if (!(p instanceof S2A)) return
  const type = p.func_179749_a().toString().toLowerCase()
  if (type !== GYRO_PARTICLE) return

  const t = nowMs()
  lastSpellTs = t
  if (hasBurst(t)) {
    const s = soundEvents[soundEvents.length - 1]
    if (s) tryFire(s.x, s.y, s.z)
  }
})
