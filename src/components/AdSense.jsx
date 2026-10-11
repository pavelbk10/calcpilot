'use client';
import {useEffect,useRef,useState} from 'react';
import Script from 'next/script';
import {isAdsenseConfigured,hasAdsenseConsent} from '../lib/adsense.mjs';

export default function AdSense(){
  const [allowed,setAllowed]=useState(false);
  const returning=useRef(null);
  const publisherId=process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  useEffect(()=>{
    if(!isAdsenseConfigured({enabled:process.env.NEXT_PUBLIC_ADSENSE_ENABLED,publisherId,siteUrl:process.env.NEXT_PUBLIC_SITE_URL},window.location.origin))return;
    if(returning.current===null){
      try{
        returning.current=localStorage.getItem('cp-ad-previous-visit')==='1';
        localStorage.setItem('cp-ad-previous-visit','1');
      }catch{return;}
    }
    if(!returning.current)return;
    let active=true,subscribed=false,listenerId;
    const subscribe=()=>{
      if(subscribed||typeof window.__tcfapi!=='function')return;
      subscribed=true;
      window.__tcfapi('addEventListener',2,(data,success)=>{
        listenerId=data?.listenerId;
        if(active)setAllowed(success===true&&hasAdsenseConsent(data));
      });
    };
    window.addEventListener('calcpilot:cmp-ready',subscribe);
    subscribe();
    return ()=>{
      active=false;
      window.removeEventListener('calcpilot:cmp-ready',subscribe);
      if(listenerId!==undefined&&typeof window.__tcfapi==='function')window.__tcfapi('removeEventListener',2,()=>{},listenerId);
    };
  },[publisherId]);
  if(!allowed)return null;
  return <Script id="calcpilot-adsense" async strategy="afterInteractive" src={'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+publisherId} crossOrigin="anonymous"/>;
}