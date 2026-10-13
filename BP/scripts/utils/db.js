import { world } from "@minecraft/server";
const KEY="be:data";
const defaults={money:{},bans:{},mutes:{},settings:{startingBalance:1000},logs:[],shopItems:[],sellPrices:{}};
function read(){try{return {...defaults,...JSON.parse(world.getDynamicProperty(KEY)??"{}")};}catch{return structuredClone(defaults);}}
function write(d){try{world.setDynamicProperty(KEY,JSON.stringify(d));}catch(e){console.warn("[BE] data save failed",e);}}
export function getMoney(p){return Number(read().money[p.name]??0);}
export function setMoney(p,n){const d=read();d.money[p.name]=Math.max(0,Number(n)||0);write(d);}
export function addLog(x){const d=read();d.logs.push({...x,time:Date.now()});d.logs=d.logs.slice(-200);write(d);}
export function getBans(){return read().bans;}
export function saveBans(x){const d=read();d.bans=x;write(d);}
export function getMutes(){return read().mutes;}
export function getSettings(){return read().settings;}
export function getShopItems(){return read().shopItems;}
export function saveShopItems(x){const d=read();d.shopItems=x;write(d);}
export function getSellPrices(){return read().sellPrices;}
export function saveSellPrices(x){const d=read();d.sellPrices=x;write(d);}
