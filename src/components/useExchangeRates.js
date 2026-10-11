'use client';
import {useState,useEffect,useRef} from 'react';
import {currencies,exchangeSlot,nextExchangeUpdate,parseRateTable,validateRateTable} from '../lib/exchange.mjs';
const cacheKey='cp-exchange-table-v1';
let pending=null;
async function fetchTable(){
  if(!pending)pending=(async()=>{
    const response=await fetch('https://api.frankfurter.dev/v2/rates?base=USD&quotes='+currencies.filter(currency=>currency!=='USD').join(','),{signal:AbortSignal.timeout(12000),cache:'no-store'});
    if(!response.ok)throw Error('Rates unavailable');
    return parseRateTable(await response.json());
  })().finally(()=>{pending=null});
  return pending;
}
export default function useExchangeRates(enabled){
  const [table,setTable]=useState(null),[state,setState]=useState('loading'),[next,setNext]=useState(null),[refresh,setRefresh]=useState(0);
  const current=useRef(null),attempt=useRef(null);
  useEffect(()=>{
    if(!enabled)return;
    let alive=true,timer;
    const publish=nextTable=>{current.current=nextTable;if(alive)setTable(nextTable)};
    const update=async(force=false)=>{
      clearTimeout(timer);
      const nextTime=nextExchangeUpdate();setNext(nextTime);
      timer=setTimeout(()=>update(),Math.max(1000,nextTime-Date.now()+1000));
      try{const cached=validateRateTable(JSON.parse(localStorage.getItem(cacheKey)));if(!current.current||cached.fetchedAt>current.current.fetchedAt)publish(cached)}catch{}
      if(!current.current){
        try{
          const response=await fetch((process.env.NEXT_PUBLIC_BASE_PATH||'')+'/exchange-rates.json',{cache:'no-store',signal:AbortSignal.timeout(8000)});
          if(response.ok)publish(validateRateTable(await response.json()));
        }catch{}
      }
      if(!alive)return;
      const slot=exchangeSlot();
      if(!force&&current.current?.slot===slot){setState('ready');return}
      if(!force&&attempt.current===slot){setState(current.current?'cached':'error');return}
      attempt.current=slot;setState('loading');
      try{
        const fetched=await fetchTable();
        if(!alive)return;
        publish(fetched);setState('ready');
        try{localStorage.setItem(cacheKey,JSON.stringify(fetched))}catch{}
      }catch{if(alive)setState(current.current?'cached':'error')}
    };
    const check=()=>{if(document.visibilityState==='visible')update()};
    update(refresh>0);
    document.addEventListener('visibilitychange',check);window.addEventListener('online',check);
    return ()=>{alive=false;clearTimeout(timer);document.removeEventListener('visibilitychange',check);window.removeEventListener('online',check)};
  },[enabled,refresh]);
  return {table,state,next,refresh:()=>setRefresh(value=>value+1)};
}