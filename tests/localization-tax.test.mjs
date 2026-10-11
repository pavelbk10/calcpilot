import test from 'node:test';
import assert from 'node:assert/strict';
import {purchaseTax,capitalGainsTax,dateValue} from '../src/lib/property-tax.mjs';
import {convertCurrency,parseQuote} from '../src/lib/exchange.mjs';
import {guideIds,getGuide,guideWordCount} from '../src/lib/guide-content.mjs';
import {translate,locales} from '../src/lib/i18n.mjs';
test('all fifteen guides exceed 500 words and have practical tips',()=>{
  assert.equal(guideIds.length,5);
  for(const id of guideIds)for(const lang of Object.keys(locales)){const guide=getGuide(id,lang);assert.ok(guideWordCount(guide)>=500,`${id} ${lang}`);assert.equal(guide.tips.length,5);assert.ok(guide.related.length);}
});
test('language fallback and Russian slider labels',()=>{
  assert.notEqual(translate('ru','Calculators'),'Calculators');assert.equal(translate('en','Calculators','ignored'),'Calculators');assert.equal(translate('ru','Custom','ignored','specific'),'specific');assert.notEqual(translate('ru','Loan balance slider'),'Loan balance slider');
});
test('purchase tax uses marginal bands and scales full-property tax by ownership',()=>{
  const scenario={price:2400000,kind:'single',date:'2026-10-11'};
  assert.equal(purchaseTax({...scenario,price:1978745}).tax,0);
  assert.ok(Math.abs(purchaseTax(scenario).tax-15538.325)<1e-6);
  assert.equal(purchaseTax({...scenario,share:25}).tax,purchaseTax(scenario).tax/4);
  assert.equal(purchaseTax({...scenario,kind:'additional'}).tax,192000);
  assert.ok(Math.abs(purchaseTax({...scenario,price:6055071,kind:'additional'}).tax-(6055070*.08+.1))<1e-6);
  assert.throws(()=>purchaseTax({...scenario,kind:'additional',date:'2027-01-01'}));
  assert.throws(()=>purchaseTax({...scenario,date:'2028-01-16'}));
  assert.throws(()=>purchaseTax({...scenario,price:-1}));
});
test('capital gains use indexed basis and declared deductions; optional linear allocation',()=>{
  const scenario={sale:2500000,purchase:2000000,cpiFactor:1.05,expenses:200000,bought:'2015-01-01',sold:'2020-01-01'};
  assert.equal(capitalGainsTax(scenario).tax,50000);
  assert.equal(capitalGainsTax({...scenario,sale:1000000}).tax,0);
  assert.equal(capitalGainsTax({...scenario,linear:true}).fraction,1);
  const linear=capitalGainsTax({...scenario,bought:'2010-01-01',sold:'2018-01-01',linear:true});
  assert.equal(linear.fraction,.5);assert.equal(linear.tax,25000);
  assert.throws(()=>capitalGainsTax({...scenario,sold:scenario.bought}));
  assert.throws(()=>dateValue('2026-02-30'));
});
test('conversion includes both fees and rejects invalid or mismatched quotes',()=>{
  assert.deepEqual(convertCurrency(100,3.5,1,2),{gross:350,fee:5.5,net:344.5});
  assert.equal(convertCurrency(10,1).net,10);
  assert.throws(()=>convertCurrency(10,0));assert.throws(()=>convertCurrency(10,1,101));
  assert.equal(parseQuote({base:'USD',quote:'ILS',rate:3.5,date:'2026-10-09'},'USD','ILS').rate,3.5);
  assert.throws(()=>parseQuote({base:'EUR',quote:'ILS',rate:3.5,date:'2026-10-09'},'USD','ILS'));
});