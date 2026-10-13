export function registerShopCommands(reg){
 for(const name of ["shop","sell","worth"]){
  reg.registerCommand({name:"be:"+name,description:"Shop command",permissionLevel:"any"},({sourceEntity:p})=>p.sendMessage("§eThe shop has no items configured yet."));
 }
}
