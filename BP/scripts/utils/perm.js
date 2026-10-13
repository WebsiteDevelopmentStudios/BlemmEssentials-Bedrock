export function isAdmin(player) {
    try { if (typeof player.isOp === "function" && player.isOp()) return true; } catch {}
    return player.hasTag("admin") || player.hasTag("be_admin");
}
export function requireAdmin(player) {
    if (!isAdmin(player)) { player.sendMessage("§c§l[BE]§r §cYou don't have permission to use this command."); return false; }
    return true;
}
