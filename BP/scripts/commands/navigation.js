export function registerNavigationCommands(reg){
 for(const name of ["spawn","home","sethome","delhome","tpa","tpaccept","rtp"]){
  reg.registerCommand({name:"be:"+name,description:"Navigation command",permissionLevel:"any"},({sourceEntity:p})=>p.sendMessage("§e!"+name+" is not configured on this server yet."));
 }
}
