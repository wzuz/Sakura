import config from "../../config"

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

  const nowT = (split_end >= 0 ? split_end : tickCount);

  const terrasEnd = (split_giants_start >= 0 ? split_giants_start : (split_sadan_start >= 0 ? split_sadan_start : nowT));
  const giantsEnd = (split_sadan_start >= 0 ? split_sadan_start : nowT);
  const totalEnd  = nowT;

  const terracottasStr = fmtTicksDelta(split_t_start, terrasEnd);
  const giantsStr      = (split_giants_start >= 0) ? fmtTicksDelta(split_giants_start, giantsEnd) : (split_sadan_start >= 0 ? "0.00" : "—");
  const sadanStr       = (split_sadan_start >= 0) ? fmtTicksDelta(split_sadan_start, totalEnd) : "—";
  const totalStr       = fmtTicksDelta(0, totalEnd);

  const lines = [
    `§6Terracottas: §f${terracottasStr}s`,
    `§aGiants: §f${giantsStr}s`,
    `§cSadan: §f${sadanStr}s`,
    `§dTotal: §f${totalStr}s`
  ];

  const x = Renderer.screen.getWidth() / 2 - 70;
  const y = Renderer.screen.getHeight() / 2 - 35;
  let dy = 0;
  lines.forEach(line => {
    Renderer.drawStringWithShadow(line, x, y + dy);
    dy += 10;
  });
});
