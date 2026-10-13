export function registerAdminCommands(reg){
 for(const name of ["setmoney","givemoney","broadcast","feed","heal","fly","gamemode","invsee","setspawn"]){
  reg.registerCommand({name:"be:"+name,description:"Admin command",permissionLevel:"gameDirectors"},({sourceEntity:p})=>p.sendMessage("§e!"+name+" requires server admin setup."));
 }
}
