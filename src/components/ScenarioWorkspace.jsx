'use client';
import {useState,useEffect,useRef} from 'react';
import {Save,RotateCcw,Trash2,Share2,Copy,Check,FolderOpen} from 'lucide-react';
import {usePrefs} from './Shell';
import {compatibleValues,encodeSharedScenario,decodeSharedScenario,validWorkspace} from '../lib/workspace.mjs';
import ResultInsight from './ResultInsight';
export default function ScenarioWorkspace({id,values,onLoad,defaults,metrics=[],fields}){
  const {t}=usePrefs();
  const [ready,setReady]=useState(false),[saved,setSaved]=useState([]),[name,setName]=useState(''),[notice,setNotice]=useState(''),[selected,setSelected]=useState([]),[link,setLink]=useState(''),[incoming,setIncoming]=useState(null);
  const load=useRef(onLoad),current=useRef(values),template=useRef(defaults||values);
  load.current=onLoad;current.current=values;
  const key='cp-autosave-'+id,listKey='cp-named-'+id;
  useEffect(()=>{
    try{
      const last=JSON.parse(localStorage.getItem(key));
      if(last?.version===1&&compatibleValues(last.values,template.current)&&validWorkspace(id,last.values))load.current(last.values);
      const list=JSON.parse(localStorage.getItem(listKey));
      if(Array.isArray(list))setSaved(list.filter(item=>item&&typeof item.id==='string'&&typeof item.name==='string'&&item.name.length<=60&&compatibleValues(item.values,template.current)&&validWorkspace(id,item.values)&&Array.isArray(item.metrics)&&item.metrics.length<=12&&item.metrics.every(metric=>metric&&typeof metric.label==='string'&&metric.label.length<=200&&typeof metric.value==='string'&&metric.value.length<=200)).slice(0,8));
      const encoded=new URLSearchParams(location.hash.slice(1)).get('scenario');
      if(encoded){const shared=decodeSharedScenario(encoded,id,template.current);if(!validWorkspace(id,{...template.current,...shared}))throw Error('Invalid inputs');setIncoming(shared)}
    }catch{setNotice(t('Some saved data could not be loaded.','חלק מהנתונים השמורים לא נטענו.','Часть сохранённых данных не удалось загрузить.'))}
    setReady(true);
  },[id]);
  useEffect(()=>{
    const changed=()=>{
      try{const encoded=new URLSearchParams(location.hash.slice(1)).get('scenario');if(!encoded){setIncoming(null);return}const shared=decodeSharedScenario(encoded,id,template.current);if(!validWorkspace(id,{...current.current,...shared}))throw Error();setIncoming(shared)}
      catch{setIncoming(null);setNotice(t('Cannot load this share link.','לא ניתן לטעון קישור שיתוף זה.','Невозможно загрузить эту ссылку.'))}
    };
    window.addEventListener('hashchange',changed);return ()=>window.removeEventListener('hashchange',changed);
  },[id]);
  useEffect(()=>{
    if(!ready||!compatibleValues(values,template.current)||!validWorkspace(id,values))return;
    const timer=setTimeout(()=>{
      try{localStorage.setItem(key,JSON.stringify({version:1,values,updatedAt:new Date().toISOString()}));}
      catch{setNotice(t('Storage unavailable. Export a backup.','השמירה אינה זמינה. יש לייצא גיבוי.'))}
    },300);
    return ()=>clearTimeout(timer);
  },[values,ready,id]);
  useEffect(()=>{
    const persist=()=>{if(ready&&compatibleValues(current.current,template.current)&&validWorkspace(id,current.current))try{localStorage.setItem(key,JSON.stringify({version:1,values:current.current,updatedAt:new Date().toISOString()}))}catch{}};
    window.addEventListener('pagehide',persist);return ()=>{persist();window.removeEventListener('pagehide',persist)};
  },[ready,id]);
  const updateList=next=>{
    try{localStorage.setItem(listKey,JSON.stringify(next));setSaved(next);setNotice(t('Saved on this device.','נשמר במכשיר שלך.'));}
    catch{setNotice(t('Storage unavailable. Export a backup.','השמירה אינה זמינה. יש לייצא גיבוי.'))}
  };
  const choices=fields||Object.keys(values).map(key=>[key,key]);
  return <><details className="scenario-workspace" aria-label={t('Scenarios and sharing','תרחישים ושיתוף','Сценарии и обмен')} open={incoming?true:undefined}>
    <summary><Save size={17}/><strong>{t('Scenarios and sharing','תרחישים ושיתוף','Сценарии и обмен')}</strong><span>{t('Auto-save on this device','שמירה אוטומטית במכשיר','Автосохранение на устройстве')}</span><span className="scenario-count">{saved.length}/8</span></summary>
    <div className="scenario-heading"><h2>{t('Scenarios and sharing','תרחישים ושיתוף','Сценарии и обмен')}</h2><span><Check size={14}/>{t('Inputs saved automatically on this device','הנתונים נשמרים אוטומטית במכשיר','Данные автоматически сохраняются на устройстве')}</span></div>
    {incoming&&<div className="notice"><p>{t('A shared scenario is available. Only load it if you trust the sender.','קיים תרחיש משותף. טענו אותו רק אם אתם סומכים על השולח.','Доступен общий сценарий. Загружайте его только от доверенного отправителя.')}</p><button className="secondary" onClick={()=>{load.current({...current.current,...incoming});setIncoming(null);history.replaceState(null,'',location.pathname+location.search)}}><FolderOpen size={15}/>{t('Load shared inputs','טעינת נתונים משותפים','Загрузить общие данные')}</button><button className="text-button" onClick={()=>{setIncoming(null);history.replaceState(null,'',location.pathname+location.search)}}>{t('Dismiss','סגירה','Закрыть')}</button></div>}
    <form className="scenario-controls" onSubmit={event=>{event.preventDefault();if(name.trim()&&saved.length<8&&metrics.length&&compatibleValues(values,template.current)){updateList([...saved,{id:crypto.randomUUID(),name:name.trim(),values:structuredClone(values),metrics,at:new Date().toISOString()}]);setName('')}}}>
      <label>{t('Scenario name','שם התרחיש','Название сценария')}<input value={name} maxLength={60} onChange={event=>setName(event.target.value)} required/></label>
      <button className="secondary" type="submit" disabled={!ready||saved.length>=8||!metrics.length||!compatibleValues(values,template.current)}><Save size={16}/>{t('Save named scenario','שמירת תרחיש בשם','Сохранить сценарий')}</button>
      <button className="text-button" type="button" onClick={()=>load.current(structuredClone(template.current))}><RotateCcw size={16}/>{t('Reset inputs','איפוס הנתונים')}</button>
    </form>
    {saved.length>0&&<><div className="scenario-items">{saved.map(item=><div key={item.id} className="scenario-item"><strong>{item.name}</strong><input aria-label={t('Rename scenario','שינוי שם תרחיש','Переименовать сценарий')+' '+item.name} value={item.name} maxLength={60} onChange={event=>updateList(saved.map(entry=>entry.id===item.id?{...entry,name:event.target.value}:entry))}/><button className="text-button" aria-label={t('Load scenario','טעינת תרחיש','Загрузить сценарий')+' '+item.name} title={t('Load scenario','טעינת תרחיש','Загрузить сценарий')} onClick={()=>load.current(structuredClone(item.values))}><FolderOpen size={17}/></button><button className="text-button" aria-label={t('Delete scenario','מחיקת תרחיש','Удалить сценарий')+' '+item.name} title={t('Delete scenario','מחיקת תרחיש','Удалить сценарий')} onClick={()=>updateList(saved.filter(entry=>entry.id!==item.id))}><Trash2 size={17}/></button></div>)}</div><div className="table-wrap"><table><caption>{t('Scenario comparison · saved results reflect the assumptions at save time','השוואת תרחישים · התוצאות השמורות משקפות את ההנחות במועד השמירה','Сравнение · сохранённые результаты отражают допущения на момент сохранения')}</caption><thead><tr><th scope="col">{t('Result','תוצאה')}</th><th scope="col">{t('Current','נוכחי','Текущий')}</th>{saved.map(item=><th scope="col" key={item.id}>{item.name}</th>)}</tr></thead><tbody>{metrics.map((metric,index)=><tr key={index}><th scope="row">{metric.label}</th><td>{metric.value}</td>{saved.map(item=><td key={item.id}>{item.metrics.find(entry=>(entry.id||entry.label)===(metric.id||metric.label))?.value||'—'}</td>)}</tr>)}</tbody></table></div></>}
    <details className="scenario-share"><summary><Share2 size={16}/>{t('Share selected inputs','שיתוף נתונים נבחרים','Поделиться выбранными данными')}</summary><p>{t('Selected values will be visible to anyone with the link. They are placed in the link fragment, not sent as a server query. Do not include personal data.','הנתונים הנבחרים יהיו גלויים לכל מי שמחזיק בקישור. הם נכללים בחלק הקישור שאחרי הסולמית, ולא בבקשת השרת. אל תכללו מידע אישי.','Выбранные данные видны каждому с ссылкой. Они находятся во фрагменте ссылки, а не запросе серверу. Не включайте личные сведения.')}</p><div className="share-fields">{choices.map(([key,label])=><label key={key}><input type="checkbox" checked={selected.includes(key)} onChange={event=>{setLink('');setSelected(event.target.checked?[...selected,key]:selected.filter(item=>item!==key))}}/>{label}</label>)}</div><button className="secondary" disabled={!selected.length} onClick={()=>{try{const subset=Object.fromEntries(selected.map(key=>[key,values[key]]));if(!compatibleValues(subset,template.current,true))throw Error();setLink(location.origin+location.pathname+'#scenario='+encodeSharedScenario(id,subset))}catch{setNotice(t('Cannot share these inputs.','לא ניתן לשתף נתונים אלה.','Невозможно поделиться этими данными.'))}}}><Share2 size={16}/>{t('Create share link','יצירת קישור שיתוף','Создать ссылку')}</button>{link&&<div className="share-link"><input aria-label={t('Share link','קישור שיתוף','Ссылка для обмена')} value={link} readOnly onFocus={event=>event.target.select()}/><button className="secondary" onClick={async()=>{try{await navigator.clipboard.writeText(link);setNotice(t('Link copied.','הקישור הועתק.','Ссылка скопирована.'))}catch{setNotice(t('Select the link to copy it manually.','סמנו את הקישור להעתקה ידנית.','Выделите ссылку для ручного копирования.'))}}}><Copy size={16}/>{t('Copy link','העתקת קישור','Копировать')}</button></div>}</details>
    <p role="status">{notice}</p>
  </details>{metrics.length>0&&<ResultInsight id={id}/>}</>;
}