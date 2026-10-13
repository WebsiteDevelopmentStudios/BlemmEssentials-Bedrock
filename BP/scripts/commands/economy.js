import { getMoney,setMoney } from "../utils/db.js";
import { money } from "../utils/format.js";
export function registerEconomyCommands(reg){
 reg.registerCommand({name:"be:balance",description:"Check your balance",permissionLevel:"any"},({sourceEntity:p})=>p.sendMessage("§6Balance: §a"+money(getMoney(p))));
 reg.registerCommand({name:"be:pay",description:"Pay a player",permissionLevel:"any"},({sourceEntity:p},target,amount)=>{
  const n=Number(amount);const t=worldPlayers().find(x=>x.name.toLowerCase()===String(target??"").toLowerCase());
  if(!t||!Number.isFinite(n)||n<=0||getMoney(p)<n){p.sendMessage("§cUsage: !pay <player> <amount> (check player and balance).");return;}
  setMoney(p,getMoney(p)-n);setMoney(t,getMoney(t)+n);p.sendMessage("§aPayment sent.");
 });
}
function worldPlayers(){try{return [...globalThis.__bePlayers()];}catch{return [];}}
