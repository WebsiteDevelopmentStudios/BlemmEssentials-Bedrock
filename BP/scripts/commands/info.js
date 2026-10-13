export function registerInfoCommands(reg){
 const add=(name,desc,fn)=>reg.registerCommand({name:"be:"+name,description:desc,permissionLevel:"any"},fn);
 add("help","Show command help",({sourceEntity:p})=>p.sendMessage("§6Blemm Essentials commands: §e!help, !balance, !pay, !spawn, !home, !sethome, !msg, !rules, !ping"));
 add("ping","Check addon response",({sourceEntity:p})=>p.sendMessage("§aPong! Blemm Essentials is running."));
 add("rules","Show server rules",({sourceEntity:p})=>p.sendMessage("§6Ask a server admin to provide the server rules."));
 add("version","Show addon version",({sourceEntity:p})=>p.sendMessage("§6Blemm Essentials Bedrock 26.52 compatibility patch."));
}
