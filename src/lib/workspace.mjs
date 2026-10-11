export function compatibleValues(candidate,template,partial=false){
  if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))return false;
  const keys=Object.keys(candidate);
  if(!partial&&keys.length!==Object.keys(template).length)return false;
  return keys.every(key=>Object.hasOwn(template,key)&&compatibleValue(candidate[key],template[key]));
}
function compatibleValue(value,template){
  if(typeof template==='number')return typeof value==='number'&&Number.isFinite(value)&&Math.abs(value)<=1e12;
  if(typeof template==='string')return typeof value==='string'&&value.length<=1000;
  if(typeof template==='boolean')return typeof value==='boolean';
  if(Array.isArray(template))return Array.isArray(value)&&value.length<=100&&value.every(item=>template.length?typeof template[0]==='object'?compatibleValues(item,template[0]):compatibleValue(item,template[0]):false);
  if(template&&typeof template==='object')return compatibleValues(value,template);
  return value===null&&template===null;
}
export function encodeSharedScenario(id,values){
  const bytes=new TextEncoder().encode(JSON.stringify({version:1,id,values}));
  if(bytes.length>9000)throw new Error('Scenario too large');
  return btoa(Array.from(bytes,byte=>String.fromCharCode(byte)).join('')).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
export function decodeSharedScenario(encoded,id,template){
  if(encoded.length>12000||!/^[A-Za-z0-9_-]+$/.test(encoded))throw new Error('Invalid share link');
  const binary=atob(encoded.replaceAll('-','+').replaceAll('_','/'));
  const data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,character=>character.charCodeAt(0))));
  if(data.version!==1||data.id!==id||!compatibleValues(data.values,template,true)||!Object.keys(data.values).length)throw new Error('Invalid share link');
  return data.values;
}
export function validWorkspace(id,values){
  if(id==='financial')return ['tvm','npv'].includes(values.mode)&&['pv','pmt','fv','annualRate'].includes(values.unknown)&&values.v.years>0&&values.v.years<=100&&[1,4,12].includes(values.v.frequency)&&values.v.annualRate>-100&&values.v.annualRate<=100&&values.discount>-100&&values.discount<=1000;
  if(id==='mortgage')return values.tracks.length>0&&values.tracks.length<=10&&values.forecast.length>0&&values.forecast.length<=20&&values.tracks.every(track=>['fixed','fixed-indexed','variable-indexed','variable','prime'].includes(track.type)&&track.amount>=0&&track.years>0&&track.years<=40&&track.rate>=0&&track.rate<=100&&track.resetYears>=1&&track.resetYears<=40)&&values.forecast.every(point=>point.year>=1&&point.year<=40&&point.inflation>-100&&point.inflation<=100&&Math.abs(point.prime)<=100&&Math.abs(point.rateShift)<=100);
  if(id==='currency')return ['ILS','USD','EUR','RUB','GBP','CAD','AUD','CHF','JPY','CNY','PLN','UAH'].includes(values.from)&&['ILS','USD','EUR','RUB','GBP','CAD','AUD','CHF','JPY','CNY','PLN','UAH'].includes(values.to)&&['online','manual'].includes(values.mode)&&values.amount>=0&&values.fee>=0&&values.fee<=100&&values.fixed>=0&&values.manual>=0;
  if(id==='property-tax')return ['purchase','gain'].includes(values.mode)&&['single','additional'].includes(values.kind)&&values.share>=0&&values.share<=100&&values.cpiFactor>0&&values.cpiFactor<=100;
  if(id==='basic')return values.expression.length<=1000;
  return Object.entries(values).every(([key,value])=>typeof value==='number'&&value>=0&&(/years/i.test(key)?value<=100:/rate|ratio|ltv/i.test(key)?value<=100:true));
}