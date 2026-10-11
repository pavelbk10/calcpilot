export const taxSources={purchase:'https://www.gov.il/he/service/real_eatate_taxsimulator',additional:'https://www.kolzchut.org.il/he/חישוב_מס_רכישה',gain:'https://www.kolzchut.org.il/he/חישוב_מס_שבח',assessment:'https://www.misim.gov.il/svtsvazmitnew/FrmHadrachaRashit.aspx'};
export const purchaseBands={single:[[1978745,0],[2347040,.035],[6055070,.05],[20183565,.08],[Infinity,.1]],additional:[[6055070,.08],[Infinity,.1]]};
function nonnegative(value){if(!Number.isFinite(value)||value<0)throw new RangeError('Invalid amount');return value;}
export function dateValue(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new RangeError('Invalid date');
  const time=Date.parse(value+'T00:00:00Z');
  if(!Number.isFinite(time)||new Date(time).toISOString().slice(0,10)!==value)throw new RangeError('Invalid date');
  return time;
}
export function purchaseTax({price,kind='single',share=100,date}){
  nonnegative(price);nonnegative(share);dateValue(date);
  if(share>100||!purchaseBands[kind])throw new RangeError('Invalid ownership');
  const start='2025-01-16',end=kind==='single'?'2028-01-15':'2026-12-31';
  if(date<start||date>end)throw new RangeError('Unsupported tax date');
  let lower=0;
  const bands=purchaseBands[kind].map(([upper,rate])=>{
    const portion=Math.max(0,Math.min(price,upper)-lower);
    const band={lower,upper,rate,portion,tax:portion*rate*share/100};lower=upper;return band;
  });
  const tax=bands.reduce((total,band)=>total+band.tax,0),consideration=price*share/100;
  return {tax,bands,consideration,total:consideration+tax,effective:consideration?tax/consideration*100:0,start,end};
}
export function capitalGainsTax({sale,purchase,cpiFactor=1,expenses=0,depreciation=0,bought,sold,linear=false}){
  [sale,purchase,expenses,depreciation].forEach(nonnegative);
  if(!Number.isFinite(cpiFactor)||cpiFactor<=0)throw new RangeError('Invalid index');
  const start=dateValue(bought),end=dateValue(sold);
  if(end<=start)throw new RangeError('Invalid holding period');
  const basis=purchase*cpiFactor+expenses-depreciation;
  if(basis<0)throw new RangeError('Invalid basis');
  const gain=Math.max(0,sale-basis);
  const cutoff=dateValue('2014-01-01');
  const fraction=linear?Math.max(0,Math.min(1,(end-Math.max(start,cutoff))/(end-start))):1;
  const taxable=gain*fraction,tax=taxable*.25;
  return {basis,gain,fraction,taxable,tax,afterTax:sale-tax};
}