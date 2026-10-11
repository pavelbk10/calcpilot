'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Search,ArrowUpRight,X,RotateCcw} from 'lucide-react';
import {tools} from '../lib/catalog.mjs';
import {locales} from '../lib/i18n.mjs';
import {usePrefs} from './Shell';
import {CalculatorIllustration,categoryHebrew,descriptions} from './CalculatorIdentity';

export default function Catalog(){
  const {t,lang}=usePrefs();
  const [query,setQuery]=useState(''),[category,setCategory]=useState('All'),[sort,setSort]=useState('category');
  const filtered=tools.filter(tool=>(category==='All'||tool.category===category)&&[tool.name,tool.he,tool.description,descriptions[tool.id],t(tool.name,tool.he),t(tool.description,descriptions[tool.id])].join(' ').toLocaleLowerCase(locales[lang]).includes(query.trim().toLocaleLowerCase(locales[lang])));
  if(sort==='name')filtered.sort((first,second)=>t(first.name,first.he).localeCompare(t(second.name,second.he),locales[lang]));
  return <main className="page"><div className="page-title"><div className="eyebrow">{t('THE CALCPILOT TOOLKIT','ארגז הכלים שלך')}</div><h1>{t('A smarter starting point.','נקודת פתיחה חכמה יותר.')}</h1><p>{t('Interactive tools for the decisions that matter.','כלים אינטראקטיביים להחלטות החשובות שלך.','Интерактивные инструменты для важных решений.')}</p></div>
    <div className="catalog-toolbar"><label className="search"><Search size={19}/><input aria-label={t('Search calculators','חיפוש מחשבונים')} placeholder={t('Find a calculator…','חיפוש מחשבון…')} value={query} onChange={event=>setQuery(event.target.value)}/>{query&&<button className="text-button" aria-label={t('Clear search','ניקוי החיפוש')} title={t('Clear search','ניקוי החיפוש')} onClick={()=>setQuery('')}><X size={16}/></button>}</label>
      <div className="tabs">{['All','General','Home','Loans','Car','Savings'].map(item=><button key={item} className={category===item?'active':''} aria-pressed={category===item} onClick={()=>setCategory(item)}>{t(item,item==='All'?'הכול':categoryHebrew[item])}</button>)}</div>
      <label className="catalog-sort">{t('Sort by','מיון לפי')}<select value={sort} onChange={event=>setSort(event.target.value)}><option value="category">{t('Category order','סדר קטגוריות')}</option><option value="name">{t('Name','שם')}</option></select></label>
      {(query||category!=='All'||sort!=='category')&&<button className="text-button" onClick={()=>{setQuery('');setCategory('All');setSort('category')}}><RotateCcw size={15}/>{t('Reset filters','איפוס מסננים')}</button>}
    </div><p className="catalog-count" role="status">{t('Matching calculators','מחשבונים מתאימים','Найдено калькуляторов')}: {filtered.length}</p>
    <div className="cards">{filtered.map(tool=><Link className="tool-card" key={tool.id} href={'/calculators/'+tool.id+'/'}><CalculatorIllustration id={tool.id} compact/><span className="card-category">{t(tool.category,categoryHebrew[tool.category])}</span><h3>{t(tool.name,tool.he)}</h3><p>{t(tool.description,descriptions[tool.id])}</p><div className="card-bottom">{t('Open calculator','פתיחת מחשבון')}<ArrowUpRight size={19}/></div></Link>)}</div>
    {!filtered.length&&<p>{t('No tools match your search.','לא נמצאו מחשבונים מתאימים לחיפוש.')}</p>}
  </main>;
}