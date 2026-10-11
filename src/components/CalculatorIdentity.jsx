'use client';
import Link from 'next/link';
import {Calculator, Landmark, House, KeyRound, Layers, RefreshCw, HandCoins, Scale, Sprout, Target, ShieldCheck, Fuel, Wrench, Car, Coins, TrendingUp, Percent, Wallet} from 'lucide-react';
import {usePrefs} from './Shell';

export const categoryHebrew={General:'כללי',Home:'בית',Loans:'הלוואות',Savings:'חיסכון',Car:'רכב'};
export const descriptions={
  currency:'המרת מטבעות עם שער ייחוס מתוארך, שער ידני וחישוב עמלות.',
  'property-tax':'אומדן מס רכישה ומס שבח ריאלי לדירות מגורים בישראל.',
  basic:'חישובי חשבון, אחוזים, חזקות וזיכרון עם היסטוריית תוצאות.',
  financial:'חישוב ערך הכסף לאורך זמן, הפקדות, תשואה ותזרימים מהוונים.',
  mortgage:'בניית תמהיל מסלולים, תחזיות ריבית ומדד והשוואת עלויות.',
  affordability:'הערכת משכנתא לפי הכנסה, התחייבויות והון עצמי זמין.',
  supplement:'בדיקת השפעת הלוואה משלימה על תקציב המשכנתא וההחזר.',
  refinance:'השוואת החזרים, ריביות ועלויות במחזור הלוואה.',
  loan:'תכנון החזרי הלוואה חודשיים ובדיקת לוח הסילוקין.',
  dti:'בדיקת חלק ההכנסה החודשית שמופנה להחזר התחייבויות.',
  savings:'תחזית חיסכון עם הפקדות חודשיות וריבית דריבית.',
  goal:'חישוב ההפקדה החודשית הנדרשת להגעה ליעד החיסכון.',
  emergency:'תכנון כרית ביטחון לפי הוצאות חיוניות וחודשי הגנה.',
  fuel:'הערכת עלויות דלק או טעינה לפי נסועה וצריכת אנרגיה.',
  car:'חישוב עלויות אנרגיה, ביטוח, תחזוקה, ירידת ערך ומימון.',
  'car-loan':'תכנון תשלומי מימון הרכב לאחר המקדמה.'
};
const icons={basic:[Calculator,Percent,Coins],financial:[Landmark,TrendingUp,Coins],mortgage:[House,Layers,Percent],affordability:[KeyRound,House,Wallet],supplement:[Layers,HandCoins,House],refinance:[RefreshCw,Landmark,Percent],loan:[HandCoins,Coins,Percent],dti:[Scale,Wallet,Coins],savings:[Sprout,Coins,TrendingUp],goal:[Target,Sprout,Coins],emergency:[ShieldCheck,Wallet,House],fuel:[Fuel,Car,Coins],car:[Wrench,Car,Coins],'car-loan':[Car,KeyRound,HandCoins]};
export function CalculatorIllustration({id,compact=false}){
  const [Main,First,Second]=(id==='currency'?[RefreshCw,Coins,TrendingUp]:id==='property-tax'?[Landmark,House,Percent]:icons[id])||icons.basic;
  return <div className={'calculator-illustration '+(compact?'compact':'')} data-calculator={id} aria-hidden="true"><First className="illustration-side first"/><Main className="illustration-main"/><Second className="illustration-side second"/></div>;
}
export default function CalculatorIdentity({tool}){
  const {t}=usePrefs();
  return <><div className="breadcrumbs"><Link href="/calculators/">{t('Calculators','מחשבונים')}</Link> / {t(tool.category,categoryHebrew[tool.category])}</div><div className="page-title calculator-title"><div><div className="eyebrow">{t('INTERACTIVE CALCULATOR','מחשבון אינטראקטיבי')}</div><h1>{t(tool.name,tool.he)}</h1><p>{t(tool.description,descriptions[tool.id])}</p></div><CalculatorIllustration id={tool.id}/></div></>;
}