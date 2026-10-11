'use client';
import Link from 'next/link';
import {ArrowUpRight,Clock,Printer,CheckCircle2} from 'lucide-react';
import {usePrefs} from './Shell';
import {getGuide,guideWordCount} from '../lib/guide-content.mjs';
import {tools} from '../lib/catalog.mjs';
export default function GuideContent({guides,guide}){
  const {t,lang}=usePrefs();
  const duration=content=>Math.ceil(guideWordCount(content)/180);
  if(!guide)return <><div className="page-title"><div className="eyebrow">{t('MAKE SENSE OF YOUR MONEY','להבין את הכסף שלך')}</div><h1>{t('A little knowledge goes a long way.','ידע קטן. החלטות טובות יותר.')}</h1><p>{t('Practical explanations to accompany the calculators. General educational information.','הסברים מעשיים לצד המחשבונים. מידע כללי ללמידה.')}</p></div><div className="guide-list">{guides.map(item=>{const content=getGuide(item.id,lang);return <Link className="tool-card" key={item.id} href={'/guides/'+item.id+'/'}><span className="card-category"><Clock size={14}/> {duration(content)} {t('min','דקות')}</span><h3>{content.title}</h3><p>{content.sections[0].paragraphs[0].slice(0,180)}...</p><div className="card-bottom">{t('Read guide','קריאת המדריך')}<ArrowUpRight size={18}/></div></Link>})}</div></>;
  const content=getGuide(guide.id,lang);
  return <div className="guide-layout"><article className="prose guide-article"><Link href="/guides/" className="breadcrumbs">{t('All guides','כל המדריכים')}</Link><div className="eyebrow">{t('MONEY GUIDE','מדריך פיננסי')}</div><h1>{content.title}</h1><div className="guide-meta"><span><Clock size={15}/>{t('Reading time','זמן קריאה')}: {duration(content)} {t('min','דקות')}</span><button className="text-button" onClick={()=>window.print()}><Printer size={16}/>{t('Print / PDF','הדפסה / PDF')}</button></div>
    {content.sections.map((section,index)=><section key={index} id={'section-'+index}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph,paragraphIndex)=><p key={paragraphIndex}>{paragraph}</p>)}</section>)}
    <section id="practical-tips" className="guide-tips"><h2>{t('Practical tips','טיפים מעשיים')}</h2><ul>{content.tips.map(tip=><li key={tip}><CheckCircle2 size={17}/><span>{tip}</span></li>)}</ul></section>
    <section id="related-calculators"><h2>{t('Related calculators','מחשבונים קשורים')}</h2><div className="guide-related">{content.related.map(id=>{const tool=tools.find(item=>item.id===id);return <Link key={id} href={'/calculators/'+id+'/'}>{t(tool.name,tool.he)}<ArrowUpRight size={16}/></Link>})}</div></section><div className="notice">{t('Educational information only. Calculator results depend on your inputs and assumptions.','מידע ללמידה בלבד. תוצאות המחשבונים תלויות בנתונים ובהנחות שהוזנו.')}</div>
  </article><nav className="guide-toc" aria-label={t('On this page','במדריך הזה')}><strong>{t('On this page','במדריך הזה')}</strong>{content.sections.map((section,index)=><a href={'#section-'+index} key={index}>{section.heading}</a>)}<a href="#practical-tips">{t('Practical tips','טיפים מעשיים')}</a><a href="#related-calculators">{t('Related calculators','מחשבונים קשורים')}</a></nav></div>;
}