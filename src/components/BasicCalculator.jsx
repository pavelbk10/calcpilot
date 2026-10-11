"use client";
import { useState, useEffect } from "react";
import { Delete, Trash2 } from "lucide-react";
import { usePrefs } from "./Shell";
import { evaluateExpression } from "../lib/advanced-finance.mjs";
import InteractiveChart from "./InteractiveChart";
import {locales} from '../lib/i18n.mjs';
import ScenarioWorkspace from './ScenarioWorkspace';
export default function BasicCalculator() {
  const { t,lang } = usePrefs();
  const [expression, E] = useState(""),
    [answer, A] = useState(null),
    [history, H] = useState([]),
    [error, R] = useState(""),
    [memory, M] = useState(0),
    [justSolved, J] = useState(false);
  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem("cp-basic-history"));
      if (Array.isArray(h))
        H(
          h
            .filter(
              (x) =>
                typeof x.expression === "string" && Number.isFinite(x.value),
            )
            .slice(-30),
        );
    } catch {}
  }, []);
  const calc = () => {
    try {
      const value = evaluateExpression(expression);
      A(value);
      J(true);
      R("");
      const h = [...history, { expression, value }].slice(-30);
      H(h);
      try {
        localStorage.setItem("cp-basic-history", JSON.stringify(h));
      } catch {}
    } catch (e) {
      R(t(e.message, "יש לבדוק את הביטוי שהוזן.",'Проверьте введённое выражение.'));
    }
  };
  const press = (key) => {
    R("");
    if (key === "=") return calc();
    const base =
      justSolved && answer !== null
        ? String(Number(answer.toPrecision(12)))
        : expression;
    J(false);
    if (key === "C") {
      E("");
      A(null);
      return;
    }
    if (key === "⌫") {
      E(expression.slice(0, -1));
      return;
    }
    if (key === "±") {
      E(base ? "(-1)*(" + base + ")" : "-");
      return;
    }
    if (key === "√") {
      E(base ? "sqrt(" + base + ")" : "sqrt(");
      return;
    }
    if (key === "x²") {
      E(base ? "(" + base + ")^2" : "");
      return;
    }
    E(
      justSolved ? (/^[0-9.]$/.test(key) ? key : base + key) : expression + key,
    );
  };
  const buttons = [
    "C",
    "(",
    ")",
    "⌫",
    "7",
    "8",
    "9",
    "÷",
    "4",
    "5",
    "6",
    "×",
    "1",
    "2",
    "3",
    "−",
    "0",
    ".",
    "%",
    "+",
    "±",
    "√",
    "x²",
    "=",
  ];
  return (
    <>
      <ScenarioWorkspace id="basic" values={{expression,memory}} defaults={{expression:'',memory:0}} onLoad={input=>{E(input.expression);M(input.memory);A(null);R('');J(false)}} fields={[["expression",t('Expression','ביטוי')],["memory",t('M','זיכרון')]]} metrics={answer!==null?[{id:'answer',label:t('Result','תוצאה'),value:new Intl.NumberFormat(locales[lang],{maximumFractionDigits:10}).format(answer)}]:[]}/>
      <div className="workspace">
        <section className="panel basic-calc">
          <div className="eyebrow">
            {t("EVERYDAY CALCULATIONS", "חישובים יומיומיים")}
          </div>
          <label className="expression-label">
            {t("Expression", "ביטוי")}
            <input
              dir="ltr"
              aria-label={t('Calculation expression','ביטוי לחישוב')}
              value={expression}
              placeholder="(2500 + 350) × 1.17"
              maxLength={250}
              onChange={(e) => {
                E(e.target.value);
                J(false);
                R("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  calc();
                }
                if (e.key === "Escape") press("C");
              }}
            />
          </label>
          <output className="basic-output" dir="ltr">
            {answer !== null
              ? Number(answer.toPrecision(12)).toLocaleString(locales[lang], {
                  maximumFractionDigits: 10,
                })
              : "0"}
          </output>
          {error && (
            <div className="notice" role="alert">
              {error}
            </div>
          )}
          <div className="memory-buttons">
            <button onClick={() => M(0)}>{t('MC','ניקוי זיכרון')}</button>
            <button onClick={() => E(expression + String(memory))}>{t('MR','שליפת זיכרון')}</button>
            <button onClick={() => M(memory + (answer || 0))}>{t('M+','הוספה לזיכרון')}</button>
            <button onClick={() => M(memory - (answer || 0))}>{t('M−','הפחתה מהזיכרון')}</button>
            <small>{t('M','זיכרון')}: {Number(memory.toPrecision(10))}</small>
          </div>
          <div className="keypad" dir="ltr">
            {buttons.map((key) => (
              <button
                className={
                  key === "=" ? "equals" : /[×÷+−]/.test(key) ? "operator" : ""
                }
                key={key}
                onClick={() => press(key)}
                aria-label={key==='C'?t('Clear','ניקוי'):key==='⌫'?t('Delete last digit','מחיקת הספרה האחרונה'):key}
                title={key==='C'?t('Clear','ניקוי'):key==='⌫'?t('Delete last digit','מחיקת הספרה האחרונה'):key}
              >
                {key==='C'?<Trash2 size={18}/>:key==='⌫'?<Delete size={18}/>:key}
                
              </button>
            ))}
          </div>
          <p className="muted">
            {t(
              "Standard precedence. % divides the preceding number by 100: 100 + 10% = 100.1; 100 × (1 + 10%) = 110.",
              "סדר פעולות חשבון רגיל. % מחלק את המספר שקדם לו ב־100: 100 + 10% = 100.1; 100 × (1 + 10%) = 110.",
            )}
          </p>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h3>{t("Calculation history", "היסטוריית חישובים")}</h3>
            <button
              className="text-button"
              aria-label={t('Clear history','ניקוי ההיסטוריה')}
              title={t('Clear history','ניקוי ההיסטוריה')}
              onClick={() => {
                H([]);
                try {
                  localStorage.removeItem("cp-basic-history");
                } catch {}
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
          {history.length ? (
            <div className="calculation-history">
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => {
                    E(h.expression);
                    A(h.value);
                  }}
                >
                  <span dir="ltr">{h.expression}</span>
                  <b>{Number(h.value.toPrecision(12))}</b>
                </button>
              ))}
            </div>
          ) : (
            <p>
              {t(
                "Calculate a result to start your history.",
                "בצעו חישוב כדי להתחיל היסטוריה.",
              )}
            </p>
          )}
          <InteractiveChart
            title={t("Results history", "גרף תוצאות החישובים")}
            number
            data={
              history.length
                ? history.map((h, i) => ({
                    label: String(i + 1),
                    value: h.value,
                  }))
                : [{ label: "0", value: 0 }]
            }
            xLabel={t("Calculation", "חישוב")}
            series={[{ key: "value", label: t("Result", "תוצאה") }]}
          />
          <InteractiveChart title={t('Percentage scenarios','תרחישי שינוי באחוזים')} number xLabel={t('Change','שינוי')} data={Array.from({length:41},(_,index)=>({label:(index-20)+'%',value:(answer??0)*(1+(index-20)/100)}))} series={[{key:'value',label:t('Adjusted result','תוצאה לאחר שינוי')}]} />
        </section>
      </div>
    </>
  );
}
