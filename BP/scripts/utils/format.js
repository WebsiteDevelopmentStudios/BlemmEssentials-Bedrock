import { CONFIG } from "../config.js";
const { colors: C } = CONFIG;
export const TAG = `${C.primary}[${C.secondary}BE${C.primary}]${C.reset} `;
export function success(msg) { return TAG + C.success + msg + C.reset; }
export function error(msg) { return TAG + C.error + msg + C.reset; }
export function info(msg) { return TAG + C.info + msg + C.reset; }
export function warn(msg) { return TAG + "§e" + msg + C.reset; }
export function header(title) { return `${C.primary}${C.bold}━━━ ${C.secondary}${title} ${C.primary}━━━${C.reset}`; }
export function line(label, value) { return `${C.muted}▸ ${C.secondary}${label}${C.reset}: ${value}`; }
export function divider() { return `${C.muted}${"─".repeat(28)}${C.reset}`; }
export function money(amount) { return `${CONFIG.economy.currencySymbol}${amount.toLocaleString()}`; }
export function formatTime(ms) { const s=Math.floor(ms/1000); if(s<60)return `${s}s`; if(s<3600)return `${Math.floor(s/60)}m ${s%60}s`; return `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m`; }
export function parseTime(str) { const m=str.match(/^(\d+)(s|m|h|d)$/); if(!m)return null; const n=parseInt(m[1]); switch(m[2]) { case "s":return n*1000; case "m":return n*60000; case "h":return n*3600000; case "d":return n*86400000; } return null; }
