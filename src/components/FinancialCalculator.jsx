"use client";
import { useState } from "react";
import { Printer } from "lucide-react";
import { usePrefs } from "./Shell";
import InteractiveChart from "./InteractiveChart";
import NumberInput from './NumberInput';
import ScenarioWorkspace from './ScenarioWorkspace';
import { tvm, solveTvm, npv, irr } from "../lib/advanced-finance.mjs";
export default function FinancialCalculator() {
  const { t, money } = usePrefs();
  const [mode, M] = useState("tvm"),
    [unknown, U] = useState("fv"),
    [v, V] = useState({
      pv: 10000,
      pmt: 500,
      fv: 100000,
      annualRate: 5,
      years: 10,
      frequency: 12,
      due: false,
    }),
    [flows, F] = useState("-10000, 3000, 4000, 5000, 3000"),
    [discount, D] = useState(8);
  const label = {
    pv: t("Present value (PV)", "ערך נוכחי"),
    pmt: t("Deposit per period (PMT)", "הפקדה לכל תקופה"),
    fv: t("Future value (FV)", "ערך עתידי"),
    annualRate: t("Annual nominal rate (%)", "ריבית שנתית נומינלית (%)"),
  };
  let value = null,
    data = [],
    cash = [],
    error = "",
    irrValue = null;
  try {
    if (mode === "tvm") {
      const input = { ...v, periods: Math.round(v.years * v.frequency) };
      value = solveTvm(input, unknown === "annualRate" ? "rate" : unknown);
      const solved = { ...input, [unknown]: value };
      if (unknown === "annualRate") solved.annualRate = value;
      const n = Math.round(solved.periods);
      data = Array.from({ length: n + 1 }, (_, i) => ({
        label: (i / v.frequency).toFixed(i % v.frequency ? 1 : 0),
        value: tvm({ ...solved, periods: i }).fv,
        contributions: solved.pv + solved.pmt * i,
      }));
    } else {
      if (!flows.trim() || flows.split(/[,;\n]/).some((x) => !x.trim()))
        throw Error("Enter all cash flow values");
      cash = flows.split(/[,;\n]/).map((x) => Number(x.trim()));
      if (
        cash.length > 100 ||
        !cash.every((x) => Number.isFinite(x) && Math.abs(x) <= 1e12)
      )
        throw Error("Use up to 100 numeric cash flows");
      value = npv(discount, cash);
      irrValue = irr(cash);
      data = cash.map((c, i) => ({
        label: String(i),
        cash: c,
        discounted: c / (1 + discount / 100) ** i,
      }));
    }
  } catch (e) {
    error = t(e.message, "יש לבדוק את הנתונים שהוזנו.",'Проверьте введённые данные.');
  }
  return (
    <>
      <ScenarioWorkspace id="financial" values={{mode,unknown,v,flows,discount}} defaults={{mode:'tvm',unknown:'fv',v:{pv:10000,pmt:500,fv:100000,annualRate:5,years:10,frequency:12,due:false},flows:'-10000, 3000, 4000, 5000, 3000',discount:8}} onLoad={input=>{M(input.mode);U(input.unknown);V(input.v);F(input.flows);D(input.discount)}} fields={[["mode",t('Mode','מצב','Режим')],["unknown",t('Solve for a variable','בחירת משתנה')],["v",t('Time value of money','ערך הזמן של הכסף')],["flows",t('Cash flows','תזרימי מזומנים','Денежные потоки')],["discount",t('Annual discount rate (%)','שיעור היוון שנתי (%)')]]} metrics={value!==null&&!error?[{id:mode+unknown,label:mode==='tvm'?label[unknown]||t('Result','תוצאה'):t('Net present value (NPV)','ערך נוכחי נקי'),value:mode==='tvm'&&unknown==='annualRate'?value.toFixed(2)+'%':money(value)}]:[]}/>
      <div className="tabs">
        <button
          className={mode === "tvm" ? "active" : ""}
          onClick={() => M("tvm")}
        >
          {t("Time value of money", "ערך הזמן של הכסף")}
        </button>
        <button
          className={mode === "npv" ? "active" : ""}
          onClick={() => M("npv")}
        >
          {t('NPV / IRR','ערך נוכחי נקי ותשואה פנימית')}
        </button>
      </div>
      <div className="workspace" style={{ marginTop: 25 }}>
        <section className="panel inputs">
          {mode === "tvm" ? (
            <>
              <h3>{t("Solve for a variable", "בחירת משתנה לחישוב")}</h3>
              <label>
                {t("Calculate", "חשב")}
                <select value={unknown} onChange={(e) => U(e.target.value)}>
                  {Object.keys(label).map((k) => (
                    <option value={k} key={k}>
                      {label[k]}
                    </option>
                  ))}
                </select>
              </label>
              {Object.keys(label)
                .filter((k) => k !== unknown)
                .map((k) => (
                  <label key={k}>
                    {label[k]}
                    <NumberInput
                      type="number"
                      min={k === "annualRate" ? -99 : 0}
                      max={k === "annualRate" ? 1000 : 100000000}
                      step={k === "annualRate" ? ".1" : "1"}
                      value={v[k]}
                      onChange={(e) =>
                        V({
                          ...v,
                          [k]: Math.max(
                            k === "annualRate" ? -99 : 0,
                            Math.min(
                              k === "annualRate" ? 1000 : 100000000,
                              Number(e.target.value) || 0,
                            ),
                          ),
                        })
                      }
                    />
                  </label>
                ))}
              <label>
                {t("Years", "שנים")}
                <NumberInput
                  type="number"
                  min="1"
                  max="40"
                  value={v.years}
                  onChange={(e) =>
                    V({
                      ...v,
                      years: Math.max(
                        1,
                        Math.min(40, Math.round(+e.target.value) || 1),
                      ),
                    })
                  }
                />
              </label>
              <label>
                {t("Periods per year", "מספר תקופות בשנה")}
                <select
                  value={v.frequency}
                  onChange={(e) => V({ ...v, frequency: +e.target.value })}
                >
                  {[
                    [12, "Monthly", "חודשי"],
                    [4, "Quarterly", "רבעוני"],
                    [1, "Annual", "שנתי"],
                  ].map(([n, en, he]) => (
                    <option key={n} value={n}>
                      {t(en, he)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t("Contribution timing", "מועד הפקדה")}
                <select
                  value={v.due ? "start" : "end"}
                  onChange={(e) => V({ ...v, due: e.target.value === "start" })}
                >
                  <option value="end">{t("End of period", "סוף תקופה")}</option>
                  <option value="start">
                    {t("Beginning of period", "תחילת תקופה")}
                  </option>
                </select>
              </label>
            </>
          ) : (
            <>
              <h3>{t("Discounted cash flows", "תזרימי מזומנים מהוונים")}</h3>
              <label>
                {t("Annual discount rate (%)", "שיעור היוון שנתי (%)")}
                <NumberInput
                  type="number"
                  min="-90"
                  max="100"
                  step=".1"
                  value={discount}
                  onChange={(e) =>
                    D(Math.max(-90, Math.min(100, +e.target.value)))
                  }
                />
              </label>
              <label>
                {t(
                  "Annual cash flows, starting at t=0",
                  "תזרימים שנתיים החל ממועד ההשקעה",
                )}
                <textarea
                  dir="ltr"
                  rows="6"
                  maxLength={2500}
                  value={flows}
                  onChange={(e) => F(e.target.value)}
                />
              </label>
              <p className="muted">
                {t(
                  "Separate values with commas. Initial investment is negative; future receipts are positive.",
                  "הפרידו בפסיקים. השקעה התחלתית שלילית, תקבולים חיוביים.",
                )}
              </p>
            </>
          )}
        </section>
        <section className="panel results">
          <div className="eyebrow">
            {t("FINANCIAL WORKBENCH", "סביבת חישוב פיננסית")}
          </div>
          <h2>{t("Put time in the equation.", "הזמן כחלק מהמשוואה.")}</h2>
          {error ? (
            <div className="notice" role="alert">
              {error}
            </div>
          ) : (
            <>
              <div className="result main-result">
                <span>
                  {mode === "tvm"
                    ? label[unknown]
                    : t("Net present value (NPV)", "ערך נוכחי נקי")}
                </span>
                <strong>
                  {unknown === "annualRate" && mode === "tvm"
                    ? value.toFixed(3) + "%"
                    : money(value)}
                </strong>
              </div>
              {mode === "tvm" && value < 0 && unknown !== "annualRate" && (
                <p className="notice">
                  {t(
                    "A negative solved amount means a withdrawal rather than a deposit is required for this target.",
                    "סכום מחושב שלילי פירושו שנדרשת משיכה ולא הפקדה כדי להגיע ליעד זה.",
                  )}
                </p>
              )}
              {mode === "npv" && (
                <div className="result">
                  <span>{t('Internal rate of return (annual)','שיעור תשואה פנימי שנתי')}</span>
                  <strong>
                    {irrValue === null
                      ? t("No root found", "לא נמצא פתרון")
                      : irrValue.toFixed(3) + "%"}
                  </strong>
                </div>
              )}
              <InteractiveChart
                title={
                  mode === "tvm"
                    ? t("Balance & contributions", "יתרה והפקדות")
                    : t("Cash flows & present values", "תזרימים וערך נוכחי")
                }
                xLabel={
                  mode === "tvm"
                    ? t("Year", "שנה")
                    : t("Year from investment", "שנה מההשקעה")
                }
                data={data}
                bar={mode === "npv"}
                series={
                  mode === "tvm"
                    ? [
                        {
                          key: "value",
                          label: t("Projected balance", "יתרה צפויה"),
                        },
                        {
                          key: "contributions",
                          label: t("Contributions", "הפקדות"),
                        },
                      ]
                    : [
                        { key: "cash", label: t("Cash flow", "תזרים") },
                        {
                          key: "discounted",
                          label: t("Discounted cash flow", "תזרים מהוון"),
                        },
                      ]
                }
              />
              <InteractiveChart title={mode==='tvm'?t('Growth beyond contributions','צמיחה מעבר להפקדות'):t('Cumulative cash flow','תזרים מצטבר')} xLabel={t('Year','שנה')} data={data.map((point,index)=>({label:point.label,value:mode==='tvm'?point.value-point.contributions:data.slice(0,index+1).reduce((total,row)=>total+row.cash,0),...(mode==='npv'?{discounted:data.slice(0,index+1).reduce((total,row)=>total+row.discounted,0)}:{})}))} series={[{key:'value',label:mode==='tvm'?t('Accumulated growth','צמיחה מצטברת'):t('Cumulative cash flow','תזרים מצטבר')},...(mode==='npv'?[{key:'discounted',label:t('Discounted cumulative flow','תזרים מהוון מצטבר')}]:[])]}/>
            </>
          )}
          <button className="secondary" onClick={() => window.print()}>
            <Printer size={15} />
            {t('Print / PDF','הדפסה או שמירה לקובץ')}
          </button>
        </section>
      </div>
      <section className="panel explanation">
        <h3>{t("Formula & assumptions", "נוסחה והנחות")}</h3>
        <p dir="ltr">FV = PV × (1 + r)ⁿ + PMT × ((1 + r)ⁿ − 1) / r</p>
        <p>
          {t(
            "r is the nominal annual rate divided by periods per year. Beginning-of-period deposits multiply the annuity factor by (1+r). At zero rate, the annuity factor is n. Deposits and balances are modeled as positive accumulation amounts; this is not a signed bank-loan cash-flow calculator. Rate solutions search the range −99.9% to 1,000% nominal annual.",
            "r הוא שיעור הריבית השנתית הנומינלית חלקי מספר התקופות בשנה. בהפקדה בתחילת תקופה מכפילים את מקדם ההפקדות ב־(1+r). בריבית אפס המקדם הוא n. ההפקדות והיתרות הן סכומי צבירה חיוביים; זה אינו מחשבון תזרימי הלוואה עם סימנים חשבונאיים. חיפוש ריבית מתבצע בטווח שנתי נומינלי של ‎−99.9% עד 1,000%.",
          )}
        </p>
        <p>
          {t(
            "NPV includes the initial cash flow at t=0. IRR is the first root found in the supported rate range and may have multiple roots when cash-flow signs change repeatedly. A root may exist outside the search range. Cash flows occur annually. Taxes, fees and inflation are excluded; returns are not guaranteed.",
            "NPV כולל את התזרים ההתחלתי בזמן אפס. IRR הוא הפתרון הראשון שנמצא בטווח הנתמך; שינויי סימן חוזרים יכולים ליצור כמה פתרונות. ייתכן פתרון מחוץ לטווח החיפוש. התזרימים שנתיים. החישוב אינו כולל מסים, עמלות ואינפלציה והתשואה אינה מובטחת.",
          )}
        </p>
      </section>
    </>
  );
}
