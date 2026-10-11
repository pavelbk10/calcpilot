import {mkdir,writeFile} from 'node:fs/promises';
import {currencies,parseRateTable} from '../src/lib/exchange.mjs';
const response=await fetch('https://api.frankfurter.dev/v2/rates?base=USD&quotes='+currencies.filter(currency=>currency!=='USD').join(','),{signal:AbortSignal.timeout(20000)});
if(!response.ok)throw new Error('Exchange provider returned HTTP '+response.status);
const table=parseRateTable(await response.json());
await mkdir(new URL('../public/',import.meta.url),{recursive:true});
await writeFile(new URL('../public/exchange-rates.json',import.meta.url),JSON.stringify(table,null,2)+'\n');
console.log('Validated '+Object.keys(table.rates).length+' currencies at '+new Date(table.fetchedAt).toISOString());