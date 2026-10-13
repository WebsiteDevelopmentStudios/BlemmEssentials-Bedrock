import { system, world } from "@minecraft/server";
import { sendError } from "./utils/debug.js";
import { registerNavigationCommands } from "./commands/navigation.js";
import { registerEconomyCommands }    from "./commands/economy.js";
import { registerInfoCommands }       from "./commands/info.js";
import { registerSocialCommands }     from "./commands/social.js";
import { registerShopCommands }       from "./commands/shop.js";
import { registerModerationCommands } from "./commands/moderation.js";
import { registerAdminCommands }      from "./commands/admin.js";
import { registerStarMenu }           from "./starmenu.js";
import { SHOP_PRESETS, SELL_PRESETS } from "./presets.js";
import {
    getBans, saveBans, getMutes, getSettings,
    setMoney, getMoney, addLog,
    getShopItems, saveShopItems, getSellPrices, saveSellPrices
} from "./utils/db.js";
import { warn } from "./utils/format.js";
import { CustomCommandPermissionLevel } from "./utils/constants.js";
import { isAdmin } from "./utils/perm.js";

// ── Command registration ───────────────────────────────────────────────────────
const commandMap = new Map();

const mockReg = {
    registerCommand(opts, handler) {
        commandMap.set(opts.name, { opts, handler });
    }
};

for (const [label, fn] of [
    ["navigation",  () => registerNavigationCommands(mockReg)],
    ["economy",     () => registerEconomyCommands(mockReg)],
    ["info",        () => registerInfoCommands(mockReg)],
    ["social",      () => registerSocialCommands(mockReg)],
    ["shop",        () => registerShopCommands(mockReg)],
    ["moderation",  () => registerModerationCommands(mockReg)],
    ["admin",       () => registerAdminCommands(mockReg)],
]) {
    try { fn(); }
    catch (e) { sendError(`[register:${label}] ${e?.stack ?? e}`); }
}

registerStarMenu();

system.run(() => {
    try {
        if (getShopItems().length === 0) saveShopItems(SHOP_PRESETS);
        if (Object.keys(getSellPrices()).length === 0) saveSellPrices(SELL_PRESETS);
    } catch (e) { sendError("[shop-init] " + e); }
});

// ── Chat command dispatch ──────────────────────────────────────────────────────
function runCommand(player, rawMsg) {
    const parts   = rawMsg.slice(1).trim().split(/\s+/);
    const keyword = (parts[0] ?? "").toLowerCase();
    const cmdName = "be:" + keyword;
    const args    = parts.slice(1);

    // Wait a few ticks so the chat bar fully closes before any UI form is shown
    system.runTimeout(() => {
        try {
            const entry = commandMap.get(cmdName);
            if (!entry) {
                player.sendMessage(
                    `§c§lUnknown command: §e!${keyword}§c. Type §e!help§c for the list.`
                );
                return;
            }
            if (
                entry.opts.permissionLevel === CustomCommandPermissionLevel.GameDirectors &&
                !isAdmin(player)
            ) {
                player.sendMessage("§c§lNo permission for this command.");
                return;
            }
            entry.handler({ sourceEntity: player }, ...args);
        } catch (e) {
            try { player.sendMessage("§c§lCommand error: §r" + e); } catch {}
            sendError(`[!${keyword}] ${e?.stack ?? e}`);
        }
    }, 5);
}

// ── Chat interception ─────────────────────────────────────────────────────────
const _seen = new Map();

function tryDispatch(player, msg) {
    if (!player || !msg || !msg.startsWith("!")) return;

    try {
        if (getMutes()[player.name]) {
            system.run(() => {
                try { player.sendMessage(warn("You are muted.")); } catch {}
            });
            return;
        }
    } catch {}

    const key = (player.id ?? player.name ?? "?") + ":" + msg;
    if (_seen.has(key)) return;
    _seen.set(key, true);
    system.runTimeout(() => _seen.delete(key), 2);

    runCommand(player, msg);
}

// ── Chat interception (Bedrock 26.x compatibility) ────────────────────────────
// chatSend is a pre-release API in some Bedrock builds and may be unavailable
// unless Beta APIs are enabled. Probe capabilities instead of assuming the
// event exists. Before-events are preferred because they can hide !commands.
let chatHooked = false;
let chatCanCancel = false;

function subscribeChatEvent(signal, label, canCancel) {
    if (!signal || typeof signal.subscribe !== "function") return false;
    try {
        signal.subscribe((ev) => {
            const player = ev?.sender ?? ev?.player ?? ev?.sourceEntity ?? null;
            const msg = typeof ev?.message === "string"
                ? ev.message
                : (typeof ev?.text === "string" ? ev.text : "");
            if (!player || typeof player.sendMessage !== "function" || !msg.startsWith("!")) return;
            if (canCancel) {
                try { ev.cancel = true; } catch (e) {
                    console.warn(`[BE] ${label}: unable to cancel chat message: ${e}`);
                }
            }
            tryDispatch(player, msg);
        });
        console.log(`[BE] ${label} subscribed — !commands active${canCancel ? "" : " (command text may appear in chat)"}`);
        return true;
    } catch (e) {
        console.warn(`[BE] ${label} subscription failed: ${e}`);
        return false;
    }
}

try {
    chatHooked = subscribeChatEvent(world.beforeEvents?.chatSend, "beforeEvents.chatSend", true);
    chatCanCancel = chatHooked;
} catch (e) {
    console.warn("[BE] beforeEvents.chatSend unavailable: " + e);
}

// Fallbacks for builds where the experimental before-chat signal is absent.
if (!chatHooked) {
    const candidates = [
        ["beforeEvents.playerChat", world.beforeEvents?.playerChat, true],
        ["beforeEvents.chatMessage", world.beforeEvents?.chatMessage, true],
        ["afterEvents.chatSend", world.afterEvents?.chatSend, false],
        ["afterEvents.playerChat", world.afterEvents?.playerChat, false],
        ["afterEvents.chatMessage", world.afterEvents?.chatMessage, false],
    ];
    for (const [label, signal, canCancel] of candidates) {
        if (subscribeChatEvent(signal, label, canCancel)) {
            chatHooked = true;
            chatCanCancel = canCancel;
            break;
        }
    }
}

if (!chatHooked) {
    console.warn("[BE] Chat interception unavailable. Enable Beta APIs / use /scriptevent be:help.");
}

// ── /scriptevent fallback ─────────────────────────────────────────────────────
try {
    system.afterEvents.scriptEventReceive.subscribe((ev) => {
        if (!ev.id.startsWith("be:")) return;
        const player = ev.sourceEntity ?? null;
        if (!player || typeof player.sendMessage !== "function") return;
        const keyword = ev.id.slice(3);
        const argStr  = typeof ev.message === "string" ? ev.message.trim() : "";
        const fakeMsg = "!" + keyword + (argStr ? " " + argStr : "");
        tryDispatch(player, fakeMsg);
    });
    console.log("[BE] scriptEventReceive subscribed OK — /scriptevent be:<cmd> works");
} catch (e) { console.error("[BE] scriptEventReceive failed: " + e); }

// ── Player spawn ──────────────────────────────────────────────────────────────
world.afterEvents.playerSpawn.subscribe((event) => {
    if (!event.initialSpawn) return;
    const player = event.player;

    // Ban check
    try {
        const bans = getBans();
        const ban  = bans[player.name];
        if (ban) {
            if (ban.type === "temp" && Date.now() > ban.expires) {
                delete bans[player.name];
                saveBans(bans);
            } else {
                const reason = ban.reason ?? "No reason given";
                const extra  = ban.type === "temp"
                    ? `\n§7Expires: §f${new Date(ban.expires).toLocaleString()}` : "";
                system.run(() => {
                    player.runCommandAsync(
                        `kick "${player.name}" §cYou are banned.\n§7Reason: §f${reason}${extra}`
                    ).catch(() => {});
                });
                return;
            }
        }
    } catch (e) { sendError("[ban-check] " + e); }

    // Starting balance
    try {
        const settings = getSettings();
        if (getMoney(player) === 0 && settings.startingBalance > 0) {
            setMoney(player, settings.startingBalance);
        }
    } catch (e) { sendError("[money-init] " + e); }

    const chatNote = chatHooked
        ? `§7Type §e!help §7for commands.`
        : `§7Type §e/scriptevent be:help §7for commands. Enable Beta APIs for !commands.`;

    player.sendMessage([
        "",
        `§a§l[BE] §rBlemm Essentials loaded! §7(${commandMap.size} commands)`,
        `§6§l Welcome to the Server! §r`,
        chatNote,
        "",
    ].join("\n"));

    addLog({ action: "join", player: player.name });
});

world.afterEvents.playerLeave.subscribe((event) => {
    addLog({ action: "leave", player: event.playerName });
});
