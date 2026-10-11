export const currencies=['ILS','USD','EUR','RUB','GBP','CAD','AUD','CHF','JPY','CNY','PLN','UAH'];
export const exchangeInterval=8*60*60*1000;
export function exchangeSlot(now=Date.now()){return Math.floor(now/exchangeInterval);}
export function nextExchangeUpdate(now=Date.now()){return (exchangeSlot(now)+1)*exchangeInterval;}
export function isOldQuote(date,now=Date.now()){
  const published=Date.parse(date+'T00:00:00Z');
  return !Number.isFinite(published)||now-published>4*24*60*60*1000;
}
export function parseRateTable(rows,fetchedAt=Date.now()){
  if(!Array.isArray(rows)||!Number.isFinite(fetchedAt))throw new Error('Invalid rate table');
  const rates={USD:{rate:1,date:null}};
  for(const currency of currencies.filter(item=>item!=='USD')){
    const row=rows.find(item=>item.base==='USD'&&item.quote===currency);
    const parsed=parseQuote(row,'USD',currency);
    rates[currency]={rate:parsed.rate,date:parsed.date};
  }
  return {version:1,fetchedAt,slot:exchangeSlot(fetchedAt),rates};
}
export function tableQuote(table,from,to){
  if(!currencies.includes(from)||!currencies.includes(to)||!table?.rates)throw new Error('Invalid rate table');
  if(from===to)return {from,to,rate:1,date:new Date(table.fetchedAt).toISOString().slice(0,10)};
  const base=table.rates[from],target=table.rates[to];
  if(!base||!target)throw new Error('Missing currency');
  const dates=[base.date,target.date].filter(Boolean).sort();
  return parseQuote({base:from,quote:to,rate:target.rate/base.rate,date:dates[0]},from,to);
}
export function validateRateTable(table,now=Date.now()){
  if(table?.version!==1||!Number.isFinite(table.fetchedAt)||table.fetchedAt<0||table.fetchedAt>now+300000||table.rates?.USD?.rate!==1)throw new Error('Invalid saved rates');
  return parseRateTable(currencies.filter(item=>item!=='USD').map(quote=>({base:'USD',quote,rate:table.rates?.[quote]?.rate,date:table.rates?.[quote]?.date})),table.fetchedAt);
}
export function parseQuote(data,from,to){
  if(data?.base!==from||data?.quote!==to||!Number.isFinite(data.rate)||data.rate<=0||typeof data.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(data.date))throw new Error('Invalid exchange response');
  return {from,to,rate:data.rate,date:data.date};
}
export function convertCurrency(amount,rate,feePercent=0,fixedFee=0){
  if(![amount,rate,feePercent,fixedFee].every(Number.isFinite)||amount<0||rate<=0||feePercent<0||feePercent>100||fixedFee<0)throw new RangeError('Invalid conversion input');
  const gross=amount*rate,fee=gross*feePercent/100+fixedFee;
  if(!Number.isFinite(gross)||!Number.isFinite(fee))throw new RangeError('Conversion overflow');
  return {gross,fee,net:gross-fee};
}