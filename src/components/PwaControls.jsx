'use client';
import {useEffect,useState,useRef} from 'react';
import {Download,RefreshCw,WifiOff} from 'lucide-react';
import {usePrefs} from './Shell';
export default function PwaControls(){
  const {t}=usePrefs();
  const [install,setInstall]=useState(null),[offline,setOffline]=useState(false),[waiting,setWaiting]=useState(null),[notice,setNotice]=useState('');
  const requested=useRef(false);
  useEffect(()=>{
    const network=()=>setOffline(!navigator.onLine),offer=event=>{event.preventDefault();setInstall(event)},installed=()=>setInstall(null);
    network();window.addEventListener('online',network);window.addEventListener('offline',network);window.addEventListener('beforeinstallprompt',offer);window.addEventListener('appinstalled',installed);
    return ()=>{window.removeEventListener('online',network);window.removeEventListener('offline',network);window.removeEventListener('beforeinstallprompt',offer);window.removeEventListener('appinstalled',installed)};
  },[]);
  useEffect(()=>{
    if(process.env.NODE_ENV!=='production'||!('serviceWorker' in navigator))return;
    let alive=true;
    const reload=()=>{if(requested.current)location.reload()};
    navigator.serviceWorker.addEventListener('controllerchange',reload);
    navigator.serviceWorker.register((process.env.NEXT_PUBLIC_BASE_PATH||'')+'/sw.js').then(registration=>{
      if(alive&&registration.waiting)setWaiting(registration.waiting);
      registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(alive&&worker.state==='installed'&&navigator.serviceWorker.controller)setWaiting(worker)})});
    }).catch(()=>{if(alive)setNotice(t('Offline installation unavailable.','התקנה לשימוש לא־מקוון אינה זמינה.','Офлайн-установка недоступна.'))});
    return ()=>{alive=false;navigator.serviceWorker.removeEventListener('controllerchange',reload)};
  },[]);
  return <div className="pwa-controls" role="status">{offline&&<span className="offline-indicator"><WifiOff size={16}/>{t('Offline · saved data only','לא מקוון · נתונים שמורים בלבד','Нет сети · только сохранённые данные')}</span>}{waiting&&<button className="secondary" onClick={()=>{requested.current=true;waiting.postMessage('SKIP_WAITING')}}><RefreshCw size={16}/>{t('Update app','עדכון האפליקציה','Обновить приложение')}</button>}{install&&<button className="secondary" onClick={async()=>{try{await install.prompt();await install.userChoice;setInstall(null)}catch{setNotice(t('Installation unavailable.','ההתקנה אינה זמינה.','Установка недоступна.'))}}}><Download size={16}/>{t('Install app','התקנת האפליקציה','Установить приложение')}</button>}{notice&&<span>{notice}</span>}</div>;
}