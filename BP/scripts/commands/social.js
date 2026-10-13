export function registerSocialCommands(reg){
 for(const name of ["msg","reply","tell","ignore","report"]){
  reg.registerCommand({name:"be:"+name,description:"Social command",permissionLevel:"any"},({sourceEntity:p})=>p.sendMessage("§e!"+name+" usage depends on server configuration."));
 }
}
