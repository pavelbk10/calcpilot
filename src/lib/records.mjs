export function undoDeletedRecord(data,deleted){
  if(!deleted||data.entries.some(entry=>entry.id===deleted.entry.id))return data;
  const entries=[...data.entries];
  entries.splice(Math.min(deleted.index,entries.length),0,deleted.entry);
  return {...data,entries};
}
export function validRecordDate(date){
  if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
  const value=Date.parse(date+'T00:00:00Z');
  return Number.isFinite(value)&&new Date(value).toISOString().slice(0,10)===date;
}
export function validTrackerData(data,categories,garage){
  if(!data||!Array.isArray(data.entries)||!Array.isArray(data.vehicles)||data.entries.length>100000||data.vehicles.length>1000||!Number.isFinite(data.budget)||data.budget<0||data.budget>1e12)return false;
  const vehicleIds=new Set();
  for(const vehicle of data.vehicles){if(typeof vehicle.id!=='string'||vehicleIds.has(vehicle.id)||typeof vehicle.name!=='string'||!vehicle.name.trim()||vehicle.name.length>60)return false;vehicleIds.add(vehicle.id)}
  const entryIds=new Set();
  for(const entry of data.entries){
    if(typeof entry.id!=='string'||entryIds.has(entry.id)||!validRecordDate(entry.date)||typeof entry.description!=='string'||!entry.description.trim()||entry.description.length>120||!Number.isFinite(entry.amount)||entry.amount<=0||entry.amount>1e12||!['expense','income'].includes(entry.type)||!categories.includes(entry.category)||(garage&&(!vehicleIds.has(entry.vehicle)||entry.type!=='expense')))return false;
    entryIds.add(entry.id);
  }
  return true;
}