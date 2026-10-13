import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

// Keep the entry point self-contained: a broken optional module must never stop
// the whole pack from loading.
const PREFIX = "§6[§eBE§6]§r ";
const balances = new Map();
const homes = new Map();
let chatHooked = false;

function reply(player, message) {
  try { player.sendMessage(PREFIX + message); } catch {}
}
function help(player) {
  reply(player, "§eCommands: !help, !ping, !balance, !menu, !sethome, !home, !spawn");
  reply(player, "If chat aliases are unavailable, run §f/scriptevent be:help§r.");
}
function execute(player, text) {
  const parts = String(text ?? "").trim().split(/\s+/);
  const cmd = (parts.shift() ?? "").toLowerCase().replace(/^!/, "");
  switch (cmd) {
    case "help": case "?": help(player); break;
    case "ping": reply(player, "§aPong! Blemm Essentials is running."); break;
    case "balance": case "bal":
      reply(player, "Balance: §a$" + (balances.get(player.name) ?? 1000).toLocaleString());
      break;
    case "sethome":
      homes.set(player.name, { dimension: player.dimension, location: { ...player.location } });
      reply(player, "§aHome saved.");
      break;
    case "home": {
      const h = homes.get(player.name);
      if (!h) { reply(player, "§cNo home saved yet. Use !sethome first."); break; }
      try { player.teleport(h.location, { dimension: h.dimension }); reply(player, "§aTeleported home."); }
      catch { reply(player, "§cCouldn't teleport to your home."); }
      break;
    }
    case "spawn":
      reply(player, "§eNo server spawn is configured yet. Use !sethome to save a location.");
      break;
    case "menu": openMenu(player); break;
    default: reply(player, "§cUnknown command: !" + cmd + ". Type !help.");
  }
}
function openMenu(player) {
  try {
    new ActionFormData().title("§6Blemm Essentials").body("Choose an option")
      .button("Help / Commands").button("Balance").button("Set Home").button("Home")
      .show(player).then(r => {
        if (r.canceled) return;
        if (r.selection === 0) help(player);
        if (r.selection === 1) execute(player, "balance");
        if (r.selection === 2) execute(player, "sethome");
        if (r.selection === 3) execute(player, "home");
      }).catch(e => console.warn("[BE] menu error: " + e));
  } catch (e) { reply(player, "Menu unavailable: " + e); }
}
function chatHandler(ev, canCancel) {
  const player = ev?.sender ?? ev?.player ?? ev?.sourceEntity;
  const message = typeof ev?.message === "string" ? ev.message : "";
  if (!player || !message.startsWith("!")) return;
  if (canCancel) { try { ev.cancel = true; } catch {} }
  system.runTimeout(() => execute(player, message), 1);
}
try {
  const before = world.beforeEvents?.chatSend;
  if (before?.subscribe) { before.subscribe(ev => chatHandler(ev, true)); chatHooked = true; }
} catch (e) { console.warn("[BE] before chat hook failed: " + e); }
if (!chatHooked) {
  try {
    const after = world.afterEvents?.chatSend;
    if (after?.subscribe) { after.subscribe(ev => chatHandler(ev, false)); chatHooked = true; }
  } catch (e) { console.warn("[BE] after chat hook failed: " + e); }
}
try {
  system.afterEvents.scriptEventReceive.subscribe(ev => {
    if (!String(ev.id).startsWith("be:")) return;
    const player = ev.sourceEntity;
    if (player && typeof player.sendMessage === "function") {
      execute(player, String(ev.id).slice(3) + (ev.message ? " " + ev.message : ""));
    }
  });
} catch (e) { console.warn("[BE] scriptevent hook failed: " + e); }

world.afterEvents.playerSpawn.subscribe(ev => {
  if (!ev.initialSpawn) return;
  const player = ev.player;
  if (!balances.has(player.name)) balances.set(player.name, 1000);
  system.runTimeout(() => {
    try {
      const inventory = player.getComponent("minecraft:inventory")?.container;
      if (inventory && !Array.from({length: inventory.size}, (_, i) => inventory.getItem(i)).some(it => it?.typeId === "be:menu_star")) {
        inventory.addItem(new ItemStack("be:menu_star", 1));
      }
    } catch (e) { console.warn("[BE] menu star could not be given: " + e); }
    reply(player, "§aBlemm Essentials loaded! " + (chatHooked ? "Type §e!help§a for commands." : "Use §e/scriptevent be:help§a for commands."));
  }, 20);
});
world.afterEvents.itemUse.subscribe(ev => {
  if (ev.itemStack?.typeId === "be:menu_star") openMenu(ev.source);
});
console.warn("[BE] Blemm Essentials entry point loaded. Chat hook: " + chatHooked);
