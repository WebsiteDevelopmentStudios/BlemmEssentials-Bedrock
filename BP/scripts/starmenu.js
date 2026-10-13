import { world } from "@minecraft/server";
export function registerStarMenu(){
  world.afterEvents.itemUse.subscribe(ev=>{
    if(ev.itemStack?.typeId!=="be:menu_star") return;
    try{ev.source.sendMessage("§6Blemm Essentials§r — type §e!help§r for commands.");}catch{}
  });
}
