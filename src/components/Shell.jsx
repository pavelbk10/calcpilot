"use client";
import Link from "next/link";
import {usePathname} from 'next/navigation';
import { useState, useEffect, useRef, createContext, useContext } from "react";
import PwaControls from './PwaControls';
import AccessibilityMenu from './AccessibilityMenu';
import {Menu, X, Globe, LayoutDashboard, Calculator, Wallet, Car, BookOpen, ShieldCheck, ArrowUpLeft} from 'lucide-react';
const Context = createContext();
import {translate,locales} from '../lib/i18n.mjs';
export const usePrefs = () => useContext(Context);
export default function Shell({ children }) {
  const pathname=usePathname();
  const [lang, L] = useState("he"),
    [currency, C] = useState("ILS"),
    [menu, M] = useState(false),[small,setSmall]=useState(false);
  const sidebar=useRef(),toggle=useRef();
  useEffect(()=>{
    const media=window.matchMedia('(max-width:900px)');
    const resize=()=>{setSmall(media.matches);if(!media.matches)M(false)};
    resize();media.addEventListener('change',resize);return ()=>media.removeEventListener('change',resize);
  },[]);
  useEffect(()=>{
    if(!menu||!small)return;
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    const elements=()=>Array.from(sidebar.current?.querySelectorAll('a[href],button:not([disabled])')||[]);
    elements()[0]?.focus();
    const keys=event=>{
      if(event.key==='Escape'){event.preventDefault();M(false)}
      if(event.key==='Tab'){
        const list=elements(),first=list[0],last=list.at(-1);
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
      }
    };
    document.addEventListener('keydown',keys);
    return ()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',keys);toggle.current?.focus()};
  },[menu,small]);
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("cp-prefs"));
      if (p) {
        const language = ['en','he','ru'].includes(p.lang)?p.lang:'he';
        L(language);
        C(language === "he" ? "ILS" : ['USD','ILS','EUR','GBP','CAD','AUD'].includes(p.currency)?p.currency:'USD');
      }
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  }, [lang]);
  const prefs = (l, c) => {
    const nextCurrency = l === "he" ? "ILS" : c;
    L(l);
    C(nextCurrency);
    try {
      localStorage.setItem(
        "cp-prefs",
        JSON.stringify({ lang: l, currency: nextCurrency }),
      );
    } catch {}
  };
  const t = (en, he, ru) => translate(lang,en,he,ru);
  const money = (v, digits=0) =>
    new Intl.NumberFormat(locales[lang], {
      style: "currency",
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(v);
  const currencies = {
    USD: ["US dollar", "דולר אמריקאי"],
    ILS: ["Israeli shekel", "שקל ישראלי"],
    EUR: ["Euro", "אירו"],
    GBP: ["Pound sterling", "לירה שטרלינג"],
    CAD: ["Canadian dollar", "דולר קנדי"],
    AUD: ["Australian dollar", "דולר אוסטרלי"],
  };
  const navigation=[['/',LayoutDashboard,'Overview','סקירה כללית'],['/calculators/',Calculator,'Calculators','מחשבונים'],['/budget/',Wallet,'Home budget','תקציב הבית'],['/garage/',Car,'My garage','הרכב שלי'],['/guides/',BookOpen,'Money guides','מדריכים']];
  const active=href=>href==='/'?pathname==='/':pathname?.startsWith(href.replace(/\/$/,''));
  const current=navigation.find(([href])=>active(href))||['',null,'Your workspace','סביבת העבודה שלך'];
  return (
    <Context.Provider value={{ lang, currency, t, money }}>
      <div className="app-shell">
      <a className="skip-link" href="#app-content">{t('Skip to content','דילוג לתוכן')}</a>
      {menu&&<button className="sidebar-scrim" aria-label={t('Close navigation','סגירת הניווט')} onClick={()=>M(false)}/>}
      <aside id="main-sidebar" ref={sidebar} inert={small&&!menu?true:undefined} className={'app-sidebar '+(menu?'is-open':'')}>
        <button className="sidebar-close text-button" aria-label={t('Close navigation','סגירת הניווט')} title={t('Close navigation','סגירת הניווט')} onClick={()=>M(false)}><X size={20}/></button>
        <Link className="brand" href="/">
          <Calculator size={29} aria-hidden="true" />
          <span dir="ltr">PB CALC</span>
        </Link>
        <div className="sidebar-label">{t('WORKSPACE','סביבת העבודה')}</div>
        <nav className="sidebar-nav" aria-label={t('Main navigation','ניווט ראשי')}>
          {navigation.map(([href,Icon,en,he])=><Link key={href} href={href} onClick={()=>M(false)} className={active(href)?'active':''} aria-current={active(href)?'page':undefined}><Icon size={20}/><span>{t(en,he)}</span>{active(href)&&<i/>}</Link>)}
        </nav>
        <div className="sidebar-note"><ShieldCheck size={24}/><strong>{t('Your space. Your data.','המקום שלך. הנתונים שלך.')}</strong><span>{t('Saved only on this device','נשמרים רק במכשיר הזה')}</span></div>
        <Link className="sidebar-contact" href="/contact/" onClick={()=>M(false)}>{t('Contact us','יצירת קשר')}<ArrowUpLeft size={16}/></Link>
      </aside>
      <div className="app-body" inert={small&&menu?true:undefined}>
      <header className="app-topbar">
        <div className="topbar-location"><button ref={toggle} className="menu" aria-controls="main-sidebar" aria-expanded={menu} aria-label={t('Toggle navigation','פתיחה וסגירה של הניווט')} onClick={()=>M(!menu)}>{menu?<X size={21}/>:<Menu size={21}/>}</button><span>{t(current[2],current[3])}</span></div>
        <div className="preferences">
          <Globe size={16} />
          <select
            aria-label={t("Language", "שפה")}
            value={lang}
            onChange={(e) =>
              prefs(e.target.value, e.target.value === "he" ? "ILS" : "USD")
            }
          >
            <option value="en">{t("English", "אנגלית")}</option>
            <option value="he">עברית</option>
            <option value="ru">{t('Russian','רוסית','Русский')}</option>
          </select>
          <select
            aria-label={t(
              "Currency display (no conversion)",
              "מטבע לתצוגה בלבד",
            )}
            value={currency}
            disabled={lang === "he"}
            onChange={(e) => prefs(lang, e.target.value)}
          >
            {Object.entries(currencies).map(([code, names]) => (
              <option key={code} value={code}>
                {t(...names)}
              </option>
            ))}
          </select>
          <span className="profile-mark" aria-hidden="true"><Calculator size={17}/></span>
        </div>
      </header>
      <div id="app-content" className="app-content" tabIndex={-1}><PwaControls/>{children}</div>
      <footer className="app-footer">
        <div>
          <Link href="/" className="brand">
            <Calculator aria-hidden="true" />
            <span dir="ltr">PB CALC</span>
          </Link>
          <p>
            {t(
              "Clarity for every money decision.",
              "בהירות בכל החלטה פיננסית.",
            )}
          </p>
          <p>
            {t("Built by", "האתר נבנה על ידי", "Сайт создан")}{" "}
            <span dir="ltr">PAVEL BARAK</span>
          </p>
        </div>
        <div>
          <Link href="/about/">{t("About", "אודות")}</Link>
          <Link href="/privacy/">{t("Privacy", "פרטיות")}</Link>
          <Link href="/terms/">{t("Terms", "תנאי שימוש")}</Link>
          <Link href="/contact/">{t("Contact", "יצירת קשר")}</Link>
          <Link href="/accessibility/">{t('Accessibility','נגישות','Доступность')}</Link>
        </div>
        <small>
          {t(
            "Illustrative estimates. Not financial advice or a lending approval. Currency selection changes display only.",
            "החישובים להמחשה ואינם ייעוץ או אישור אשראי. בחירת מטבע משנה תצוגה בלבד.",
          )}
        </small>
      </footer>
      </div>
      <nav className="mobile-nav" inert={small&&menu?true:undefined} aria-label={t('Quick navigation','ניווט מהיר')}>{navigation.map(([href,Icon,en,he])=><Link key={href} href={href} className={active(href)?'active':''} aria-current={active(href)?'page':undefined} onClick={()=>M(false)}><Icon size={21}/><span>{t(en,he)}</span></Link>)}</nav>
      </div>
      <AccessibilityMenu disabled={small&&menu} onOpen={()=>M(false)}/>
    </Context.Provider>
  );
}
