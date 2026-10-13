export function registerModerationCommands(reg){
 for(const name of ["mute","unmute","ban","unban","kick","warn"]){
  reg.registerCommand({name:"be:"+name,description:"Moderation command",permissionLevel:"gameDirectors"},({sourceEntity:p})=>p.sendMessage("§e!"+name+" requires server admin setup."));
 }
}
