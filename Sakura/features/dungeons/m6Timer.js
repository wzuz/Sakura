import config from "../../config"
import { data } from "../data"
import { isInBoss } from "../utils/utils"

// ================= Triggers (regex) =================
const M6_INTRO_REGEX = /^\[BOSS\] Sadan: So you made it all the way here\.\.\. Now you wish to defy me\? Sadan\?!$/;
const M6_GIANTS_START_REGEX = /^\[BOSS\] Sadan: ENOUGH!$/;
const M6_SADAN_START_REGEX = /^\[BOSS\] Sadan: You did it\. I understand now, you have earned my respect\.$/;
const M6_BOSS_END_PARTIAL = /Defeated Sadan in/i;

// ================= State =================
let tickCount = 0;
let packetListener = null;
let running = false;

// High-res, monotonic time (for real-time clock)
const System = Java.type("java.lang.System")
const nowMs = () => System.nanoTime() / 1e6

// Split tick marks
let split_t_start = -1;      // Terracottas start (0)
let split_giants_start = -1; // Giants start
let split_sadan_start = -1;  // Sadan start
let split_end = -1;          // End (for Total)

// Realtime (ms) split marks
let start_ms = -1;
let split_giants_start_ms = -1;
let split_sadan_start_ms  = -1;
let split_end_ms          = -1;

// Gyro bookkeeping (Terracottas only)
let gyroTimes  = [-1, -1, -1, -1, -1];      // tickCount at detection
let gyroZones  = ["-", "-", "-", "-", "-"]; // "A"/"B"
let gyroTimesMs = [-1, -1, -1, -1, -1];     // realtime ms stamps

// Zone split
const Z_SPLIT = 41.5
const zone = z => (z >= Z_SPLIT ? "A" : "B")

// ===== GUI (HUD move) =====
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

// ===== Helpers =====
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

  // realtime resets
  start_ms = -1;
  split_giants_start_ms = -1;
  split_sadan_start_ms  = -1;
  split_end_ms          = -1;

  // reset gyro state & locks + pointers
  gyroTimes = [-1, -1, -1, -1, -1];
  gyroZones = ["-", "-", "-", "-", "-"];
  gyroTimesMs = [-1, -1, -1, -1, -1];
  lockUntil.A = 0;
  lockUntil.B = 0;
  nextOrdinal = 1; // reset global expected ordinal
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

// ticks delta → "ss.ss"
function fmtTicksDelta(tStart, tEnd) {
  if (tStart < 0 || tEnd < 0) return "—";
  const dt = Math.max(0, tEnd - tStart);
  return (dt / 20).toFixed(2);
}

// realtime delta → "ss.ss"
function fmtMsDelta(startMs, endMs) {
  if (startMs < 0 || endMs < 0) return "—";
  const dt = Math.max(0, endMs - startMs);
  return (dt / 1000).toFixed(2);
}

// ===== Chat hooks =====

// Start: intro → start Terras & Total
register("chat", (message) => {
  if (!config.m6Timer) return;
  const msg = message.trim();
  if (M6_INTRO_REGEX.test(msg)) {
    resetAll();
    startTickCounter();
    split_t_start = 0;
    start_ms = nowMs(); // start realtime clock
  }
}).setChatCriteria("${message}");

// Terras → Giants
register("chat", (message) => {
  if (!config.m6Timer || !running) return;
  const msg = message.trim();
  if (M6_GIANTS_START_REGEX.test(msg)) {
    if (split_giants_start < 0) {
      split_giants_start = tickCount;
      split_giants_start_ms = nowMs();
      const terrasStr_tick = fmtTicksDelta(split_t_start, split_giants_start);
      const terrasStr_rt   = fmtMsDelta(start_ms, split_giants_start_ms);
      ChatLib.chat(`&6Terracottas&r: &b${terrasStr_rt}s &7(${terrasStr_tick})`);
    }
  }
}).setChatCriteria("${message}");

// Giants → Sadan
register("chat", (message) => {
  if (!config.m6Timer || !running) return;
  const msg = message.trim();
  if (M6_SADAN_START_REGEX.test(msg)) {
    if (split_sadan_start < 0) {
      if (split_giants_start < 0) {
        split_giants_start = tickCount;
        split_giants_start_ms = nowMs();
      }
      split_sadan_start = tickCount;
      split_sadan_start_ms = nowMs();
      const giantsStr_tick = fmtTicksDelta(split_giants_start, split_sadan_start);
      const giantsStr_rt   = fmtMsDelta(split_giants_start_ms, split_sadan_start_ms);
      ChatLib.chat(`&aGiants&r: &b${giantsStr_rt}s &7(${giantsStr_tick})`);
    }
  }
}).setChatCriteria("${message}");

// Boss end
register("chat", (message, event) => {
  if (!config.m6Timer || !running) return;
  if (event && event.sender) return; // server/system only

  const msg = message.trim();
  if (M6_BOSS_END_PARTIAL.test(msg)) {
    if (split_end < 0) split_end = tickCount;
    if (split_end_ms < 0) split_end_ms = nowMs();

    // compute all splits (tick and rt)
    const terras_tick_end = (split_giants_start >= 0 ? split_giants_start : (split_sadan_start >= 0 ? split_sadan_start : split_end));
    const giants_tick_end = (split_sadan_start >= 0 ? split_sadan_start : split_end);
    const terracottasStr_tick = fmtTicksDelta(split_t_start, terras_tick_end);
    const giantsStr_tick      = (split_giants_start >= 0) ? fmtTicksDelta(split_giants_start, giants_tick_end) : (split_sadan_start >= 0 ? "0.00" : "—");
    const sadanStr_tick       = (split_sadan_start >= 0) ? fmtTicksDelta(split_sadan_start, split_end) : "—";
    const totalStr_tick       = fmtTicksDelta(0, split_end);

    const rt_now_end = split_end_ms;
    const terras_rt_end = (split_giants_start_ms >= 0 ? split_giants_start_ms : (split_sadan_start_ms >= 0 ? split_sadan_start_ms : rt_now_end));
    const giants_rt_end = (split_sadan_start_ms  >= 0 ? split_sadan_start_ms : rt_now_end);
    const terracottasStr_rt = fmtMsDelta(start_ms, terras_rt_end);
    const giantsStr_rt      = (split_giants_start_ms >= 0) ? fmtMsDelta(split_giants_start_ms, giants_rt_end) : (split_sadan_start_ms >= 0 ? "0.00" : "—");
    const sadanStr_rt       = (split_sadan_start_ms >= 0) ? fmtMsDelta(split_sadan_start_ms, rt_now_end) : "—";
    const totalStr_rt       = fmtMsDelta(start_ms, rt_now_end);

    setTimeout(() => {
      ChatLib.chat(`&5❀ &dSakura &5≫&r ` +
        `&6Terracottas&r: &b${terracottasStr_rt}s &7(${terracottasStr_tick}) &r| ` +
        `&aGiants&r: &b${giantsStr_rt}s &7(${giantsStr_tick}) &r| ` +
        `&cSadan&r: &b${sadanStr_rt}s &7(${sadanStr_tick}) &r| ` +
        `&5Total&r: &b${totalStr_rt}s &7(${totalStr_tick})`);
    }, 200);

    if (packetListener) {
      try { packetListener.unregister(); } catch (e) {}
      packetListener = null;
    }
    running = false;
  }
}).setChatCriteria("${message}");

// Only reset if the timer is/was active this run
register("worldUnload", () => {
  const timerLoaded =
    running ||
    split_t_start >= 0 ||
    split_giants_start >= 0 ||
    split_sadan_start >= 0 ||
    gyroTimes.some(t => t >= 0);

  if (!timerLoaded) return;

  // If mid-run, close it out with current stamps
  if (running && split_end < 0) {
    split_end = tickCount;
    split_end_ms = nowMs();
  }

  resetAll();
});

// ===== Overlay =====
register("renderOverlay", () => {
  if (!config.m6Timer) return;
  if (!isInBoss() && !config.m6TimerHudMover.isOpen()) return;
  if (split_t_start < 0 && !config.m6TimerHudMover.isOpen()) return;
  let { x, y, scale } = data.m6Timer

  const nowT  = (split_end >= 0 ? split_end : tickCount);
  const nowRT = (split_end_ms >= 0 ? split_end_ms : nowMs());

  const terrasTickEnd = (split_giants_start >= 0 ? split_giants_start : (split_sadan_start >= 0 ? split_sadan_start : nowT));
  const giantsTickEnd = (split_sadan_start >= 0 ? split_sadan_start : nowT);
  const totalTickEnd  = nowT;

  const terrasRtEnd = (split_giants_start_ms >= 0 ? split_giants_start_ms : (split_sadan_start_ms >= 0 ? split_sadan_start_ms : nowRT));
  const giantsRtEnd = (split_sadan_start_ms  >= 0 ? split_sadan_start_ms  : nowRT);
  const totalRtEnd  = nowRT;

  const terracottasStr_tick = fmtTicksDelta(split_t_start, terrasTickEnd);
  const giantsStr_tick      = (split_giants_start >= 0) ? fmtTicksDelta(split_giants_start, giantsTickEnd) : (split_sadan_start >= 0 ? "0.00" : "—");
  const sadanStr_tick       = (split_sadan_start >= 0) ? fmtTicksDelta(split_sadan_start, totalTickEnd) : "—";
  const totalStr_tick       = fmtTicksDelta(0, totalTickEnd);

  const terracottasStr_rt = fmtMsDelta(start_ms, terrasRtEnd);
  const giantsStr_rt      = (split_giants_start_ms >= 0) ? fmtMsDelta(split_giants_start_ms, giantsRtEnd) : (split_sadan_start_ms >= 0 ? "0.00" : "—");
  const sadanStr_rt       = (split_sadan_start_ms >= 0) ? fmtMsDelta(split_sadan_start_ms, totalRtEnd) : "—";
  const totalStr_rt       = fmtMsDelta(start_ms, totalRtEnd);

  function gyroLine(i) {
    const tTick = gyroTimes[i];
    const tMs   = gyroTimesMs[i];
    const sTick = (tTick >= 0) ? fmtTicksDelta(split_t_start, tTick) : "—";
    const sRt   = (tMs   >= 0) ? fmtMsDelta(start_ms, tMs)         : "—";
    const suffix = ["st","nd","rd","th","th"][i] || "th"
    return `§d${i+1}${suffix} gyro: §f${sRt}s §7(${sTick})`;
  }

  let timerText = new Text("", 0, 0).setShadow(true).setAlign("left").setFormatted(true)
  let lines =
    `§6Terracottas: §f${terracottasStr_rt}s §7(${terracottasStr_tick})\n`+
    `§aGiants: §f${giantsStr_rt}s §7(${giantsStr_tick})\n`+
    `§cSadan: §f${sadanStr_rt}s §7(${sadanStr_tick})\n`+
    `${gyroLine(0)}\n`+
    `${gyroLine(1)}\n`+
    `${gyroLine(2)}\n`+
    `${gyroLine(3)}\n`+
    `${gyroLine(4)}\n`+
    `§5Total: §f${totalStr_rt}s §7(${totalStr_tick})`
  if (config.m6TimerHudMover.isOpen()) {
          Renderer.drawRect(Renderer.GRAY, x-2, y-2, 140 * scale, 93 * scale)
          timerText.setString(lines)
          timerText.setScale(scale)
          timerText.draw(x, y)
          }
  timerText.setString(lines)
  timerText.setScale(scale)
  timerText.draw(x, y)
});

// ===== Gyro detection =====
const S2A = Java.type("net.minecraft.network.play.server.S2APacketParticles")

const GYRO_SOUND    = "mob.endermen.portal"
const GYRO_PARTICLE = "spell_witch"

const WINDOW_MS       = 160
const SOUND_MIN_COUNT = 6
const CAST_LOCK_MS    = 2300   // per-zone lock duration

let soundEvents = []   // {t,x,y,z}
let lastSpellTs = 0
const lockUntil = { A: 0, B: 0 }

function prune(t) {
  const cutoff = t - WINDOW_MS
  while (soundEvents.length && soundEvents[0].t < cutoff) soundEvents.shift()
}
function hasBurst(t) {
  prune(t)
  return soundEvents.length >= SOUND_MIN_COUNT
}

// Expected global order through Terras: 1=B, 2=A, 3=B, 4=A, 5=B
const EXPECTED_ORDER = ["B", "A", "B", "A", "B"];
let nextOrdinal = 1; // 1..6 (moves forward only)

// record into the next matching ordinal ≥ nextOrdinal
function recordGyro(x, y, z) {
  if (!running) return
  if (split_t_start < 0) return
  if (split_giants_start >= 0) return // only during Terras

  const Z = zone(z)

  // Find smallest ordinal >= nextOrdinal that expects this zone and is empty
  let assignedOrd = -1
  for (let ord = nextOrdinal; ord <= 5; ord++) {
    if (EXPECTED_ORDER[ord - 1] === Z && gyroTimes[ord - 1] < 0) {
      assignedOrd = ord
      break
    }
  }
  if (assignedOrd === -1) return

  const idx = assignedOrd - 1
  gyroTimes[idx] = tickCount
  gyroZones[idx] = Z
  gyroTimesMs[idx] = nowMs() // realtime stamp for this gyro

  // Advance pointer past the assigned ordinal
  nextOrdinal = assignedOrd + 1
}

// fire helper (per-zone lock)
function tryFire(x, y, z) {
  const t = nowMs()
  const Z = zone(z)
  if (t < lockUntil[Z]) return
  lockUntil[Z] = t + CAST_LOCK_MS

  // record split/zone
  recordGyro(x, y, z)

  // Debug confirm
  ChatLib.chat(`&d[DEBUG] Gyro @ &f${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)} &7[Zone ${Z}]`)
}

// sounds
register("soundPlay", (pos, name) => {
  if (!isInBoss()) return;
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
  if (!isInBoss()) return;
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
