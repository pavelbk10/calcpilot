"use client";
import CalculatorPlots from "./CalculatorPlots";
import NumberInput from './NumberInput';
import CalculatorSensitivity from './CalculatorSensitivity';
import ScenarioWorkspace from './ScenarioWorkspace';
import { useState, useEffect } from "react";
import {
  Download,
  Bookmark,
  Printer,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { usePrefs } from "./Shell";
import {
  payment,
  principal,
  schedule,
  affordability,
  savings,
  refinance,
  carCost,
} from "../lib/finance.mjs";
const defaults = {
  targetPrice: 400000,
  amount: 250000,
  rate: 5,
  years: 25,
  income: 8000,
  debts: 500,
  ratio: 30,
  equity: 80000,
  ltv: 75,
  extra: 20000,
  extraRate: 8,
  extraYears: 7,
  newRate: 4,
  newYears: 20,
  fees: 2000,
  initial: 5000,
  monthly: 300,
  target: 50000,
  expenses: 3000,
  months: 6,
  km: 15000,
  consumption: 7,
  fuel: 1.7,
  insurance: 1200,
  maintenance: 800,
  carFees: 250,
  price: 30000,
  resale: 15000,
  ownership: 5,
  finance: 0,
  down: 5000,
};
const fields = {
  targetPrice: ["Target property price", "מחיר נכס מבוקש", 0, 10000000, 1000],
  amount: ["Loan balance", "סכום הלוואה", 0, 10000000, 1000],
  rate: ["Annual interest (%)", "ריבית שנתית (%)", 0, 40, 0.1],
  years: ["Term (years)", "תקופה בשנים", 1, 40, 1],
  income: ["Monthly net income", "הכנסה חודשית נטו", 0, 1000000, 100],
  debts: [
    "Existing monthly debt payments",
    "התחייבויות חודשיות קיימות",
    0,
    1000000,
    100,
  ],
  ratio: ["Repayment budget (% of income)", "שיעור החזר מהכנסה (%)", 5, 60, 1],
  equity: ["Cash equity available", "הון עצמי זמין", 0, 10000000, 1000],
  ltv: ["Assumed maximum financing (%)", "שיעור מימון משוער (%)", 5, 95, 1],
  extra: ["Supplementary loan amount", "הלוואה משלימה", 0, 1000000, 1000],
  extraRate: [
    "Supplementary interest (%)",
    "ריבית הלוואה משלימה (%)",
    0,
    40,
    0.1,
  ],
  extraYears: ["Supplementary term (years)", "שנות הלוואה משלימה", 1, 30, 1],
  newRate: ["New interest (%)", "ריבית חדשה (%)", 0, 40, 0.1],
  newYears: ["New term (years)", "תקופה חדשה בשנים", 1, 40, 1],
  fees: ["Refinancing fees / penalty", "עלויות מחזור וקנסות", 0, 1000000, 100],
  initial: ["Current savings", "חיסכון קיים", 0, 10000000, 100],
  monthly: ["Monthly contribution", "הפקדה חודשית", 0, 1000000, 50],
  target: ["Target balance", "יעד חיסכון", 0, 10000000, 1000],
  expenses: [
    "Essential monthly expenses",
    "הוצאות חיוניות בחודש",
    0,
    1000000,
    100,
  ],
  months: ["Months of protection", "חודשי הגנה", 1, 24, 1],
  km: ["Annual distance (km)", "נסועה שנתית בק״מ", 1, 200000, 500],
  consumption: [
    "Liters / kWh per 100 km",
    "ליטר / קוט״ש ל־100 ק״מ",
    0,
    100,
    0.1,
  ],
  fuel: ["Cost per liter / kWh", "מחיר לליטר / קוט״ש", 0, 100, 0.1],
  insurance: ["Annual insurance", "ביטוח שנתי", 0, 100000, 100],
  maintenance: ["Annual maintenance", "תחזוקה שנתית", 0, 100000, 100],
  carFees: ["Annual registration / fees", "רישוי ואגרות בשנה", 0, 100000, 100],
  price: ["Purchase price", "מחיר רכישה", 0, 10000000, 1000],
  resale: ["Expected resale value", "שווי מכירה עתידי", 0, 10000000, 1000],
  ownership: ["Ownership years", "שנות אחזקה", 1, 30, 1],
  finance: ["Monthly finance cash payment", "תשלום מימון חודשי", 0, 100000, 50],
  down: ["Down payment", "מקדמה", 0, 10000000, 1000],
};
const groups = {
  mortgage: ["amount", "rate", "years"],
  loan: ["amount", "rate", "years"],
  "car-loan": ["price", "down", "rate", "years"],
  affordability: ["income", "debts", "ratio", "equity", "ltv", "rate", "years"],
  supplement: [
    "targetPrice",
    "income",
    "debts",
    "ratio",
    "equity",
    "ltv",
    "rate",
    "years",
    "extra",
    "extraRate",
    "extraYears",
  ],
  refinance: ["amount", "rate", "years", "newRate", "newYears", "fees"],
  dti: ["income", "debts"],
  savings: ["initial", "monthly", "rate", "years"],
  goal: ["initial", "target", "rate", "years"],
  emergency: ["expenses", "months", "initial"],
  fuel: ["km", "consumption", "fuel"],
  car: [
    "km",
    "consumption",
    "fuel",
    "insurance",
    "maintenance",
    "carFees",
    "price",
    "resale",
    "ownership",
    "finance",
  ],
};
export function download(name, data, type = "application/json") {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Calculator({ tool }) {
  const { t, money } = usePrefs();
  const [v, V] = useState({
      ...defaults,
      ...(tool.id === "car-loan" ? { years: 5, rate: 7 } : {}),
    }),
    [saved, S] = useState(null),
    [notice, N] = useState(""),
    [all, A] = useState(false);
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("cp-scenario-" + tool.id));
      if (s) S(s);
    } catch {}
  }, [tool.id]);
  let metrics = [],
    rows = [],
    chart = [],
    warning = "",
    details = "";
  try {
    const id = tool.id;
    const isLoan = ["mortgage", "loan", "car-loan"].includes(id);
    if (isLoan) {
      if (id === "car-loan" && v.down > v.price)
        throw Error("Down payment exceeds purchase price.");
      const p = id === "car-loan" ? v.price - v.down : v.amount;
      const pay = payment(p, v.rate, v.years);
      rows = schedule(p, v.rate, v.years);
      metrics = [
        ["Monthly payment", "החזר חודשי", pay],
        ["Total interest", "סך ריבית", pay * v.years * 12 - p],
        ["Total repayment", "סך החזר", pay * v.years * 12],
        [
          "Repayment for each 1 borrowed",
          "החזר כולל לכל שקל שנלווה",
          p ? (pay * v.years * 12) / p : 0,
          "decimal",
        ],
      ];
      chart = rows
        .filter((r, i) => i % 12 === 0 || i === rows.length - 1)
        .map((r) => r.balance);
      details =
        t("Fixed interest, equal monthly payments, monthly compounding. Taxes, insurance, indexation and fees are excluded.","ריבית קבועה, תשלומים חודשיים שווים וריבית דריבית חודשית. ללא מסים, ביטוח, הצמדה ועמלות.");
    }
    if (id === "affordability" || id === "supplement") {
      const r = affordability({
        ...v,
        extra: id === "supplement" ? v.extra : 0,
      });
      metrics = [
        ["Estimated mortgage", "משכנתא משוערת", r.mortgage],
        ["Estimated property budget", "תקציב נכס משוער", r.property],
        [
          "Combined monthly payments",
          "החזר משולב בחודש",
          r.mortgagePayment + r.extraPayment,
        ],
        [
          "Payments at +2% mortgage rate",
          "החזרים בריבית משכנתא גבוהה ב־2%",
          r.stress,
        ],
      ];
      const mortgageTotal = r.mortgagePayment * v.years * 12,
        extraTotal = r.extraPayment * v.extraYears * 12;
      metrics.push(
        [
          "Total new-loan interest",
          "סך ריביות בהלוואות החדשות",
          mortgageTotal -
            r.mortgage +
            (id === "supplement" ? extraTotal - v.extra : 0),
        ],
        [
          "Total mortgage interest",
          "סך ריבית המשכנתא",
          mortgageTotal - r.mortgage,
        ],
        [
          "Total new-loan repayments",
          "סך החזרי ההלוואות החדשות",
          mortgageTotal + extraTotal,
        ],
        [
          "Repayment for each 1 borrowed",
          "החזר כולל לכל שקל שנלווה",
          r.mortgage + (id === "supplement" ? v.extra : 0)
            ? (mortgageTotal + extraTotal) /
              (r.mortgage + (id === "supplement" ? v.extra : 0))
            : 0,
          "decimal",
        ],
      );
      if (id === "supplement")
        metrics.push(
          [
            "Cash funding gap before extra loan",
            "פער מימון לפני הלוואה משלימה",
            Math.max(0, v.targetPrice - v.equity - r.mortgage),
          ],
          [
            "Residual funding gap with extra loan",
            "פער שנותר עם הלוואה משלימה",
            Math.max(0, v.targetPrice - v.equity - r.mortgage - v.extra),
          ],
        );
      chart = [r.byIncome, r.byEquity, r.mortgage];
      details =
        t("Monthly mortgage budget = net income × selected ratio − existing commitments − supplementary payment. Mortgage is the lower of income capacity and the selected equity / financing constraint. Property budget excludes purchase fees. Supplementary borrowing is not counted as accepted equity. Funding-gap figures are arithmetic only and do not imply that borrowed equity will be accepted by a lender.","תקציב ההחזר הוא ההכנסה נטו כפול שיעור ההחזר שנבחר, פחות התחייבויות קיימות ותשלום ההלוואה המשלימה. המשכנתא מוגבלת לפי הנמוך מבין יכולת ההחזר ומגבלת ההון העצמי והמימון. תקציב הנכס אינו כולל עלויות רכישה. הלוואה משלימה אינה נחשבת הון עצמי מאושר. פערי המימון הם חישוב בלבד ואינם אישור של המלווה.");
      if (r.room === 0)
        warning = t(
          "Existing commitments use the entire selected repayment budget.",
          "ההתחייבויות מנצלות את מלוא תקציב ההחזר שנבחר.",
        );
      else
        warning = t(
          "Ratios are adjustable assumptions, not country-specific lending rules or bank approval. Stress payment includes existing debts.",
          "האחוזים הם הנחות לבחירתך ולא כללי אשראי במדינה מסוימת. תרחיש הריבית כולל התחייבויות קיימות.",
        );
    }
    if (id === "refinance") {
      const r = refinance(
        v.amount,
        v.rate,
        v.years,
        v.newRate,
        v.newYears,
        v.fees,
      );
      metrics = [
        ["Current monthly payment", "החזר נוכחי", r.old],
        ["New monthly payment", "החזר חדש", r.next],
        [
          "Total nominal saving after fees",
          "חיסכון כולל נומינלי לאחר עלויות",
          r.net,
        ],
        [
          "Interest on current loan",
          "ריבית בהלוואה הנוכחית",
          r.old * v.years * 12 - v.amount,
        ],
        [
          "Interest on new loan",
          "ריבית בהלוואה החדשה",
          r.next * v.newYears * 12 - v.amount,
        ],
        [
          "New repayment cost per 1 including fees",
          "עלות לכל שקל בהלוואה החדשה כולל עמלות",
          v.amount ? (r.next * v.newYears * 12 + v.fees) / v.amount : 0,
          "decimal",
        ],
      ];
      details = t(`Cash-flow break-even: ${r.breakEven === null ? "no monthly saving" : r.breakEven.toFixed(1) + " months"}. Compares remaining repayment totals, without discounting. Different terms affect total interest.`,`איזון תזרימי: ${r.breakEven === null ? 'אין חיסכון חודשי' : r.breakEven.toFixed(1)+' חודשים'}. ההשוואה מבוססת על יתרת התשלומים הכוללת ללא היוון. שינוי בתקופה משפיע על סך הריבית.`,`Окупаемость по платежам: ${r.breakEven === null ? 'нет месячной экономии' : r.breakEven.toFixed(1)+' месяцев'}. Сравниваются оставшиеся выплаты без дисконтирования. Разные сроки влияют на общие проценты.`);
      if (r.net < 0)
        warning = t(
          "The new loan costs more in total despite any monthly reduction.",
          "עלות ההלוואה החדשה גבוהה יותר בסך הכול.",
        );
      chart = [r.old, r.next];
    }
    if (id === "dti") {
      if (v.income <= 0) throw Error("Enter income greater than zero.");
      const d = (v.debts / v.income) * 100;
      metrics = [
        ["Debt / income", "יחס החזר להכנסה", d, "percent"],
        ["Income after debt", "הכנסה לאחר התחייבויות", v.income - v.debts],
      ];
      details =
        t("Debt-to-income = monthly debt payments ÷ monthly net income × 100. This tool uses net income; lenders may use a different income definition.","יחס ההחזר להכנסה הוא ההתחייבויות החודשיות חלקי ההכנסה החודשית נטו, כפול 100. מלווים עשויים להשתמש בהגדרת הכנסה אחרת.");
    }
    if (id === "savings" || id === "goal") {
      const total = savings(v.initial, v.monthly, v.rate, v.years);
      const required = Math.max(
        0,
        (v.target - savings(v.initial, 0, v.rate, v.years)) /
          savings(0, 1, v.rate, v.years),
      );
      metrics =
        id === "savings"
          ? [
              ["Projected balance", "יתרה צפויה", total],
              [
                "Your contributions",
                "סך הפקדות",
                v.initial + v.monthly * v.years * 12,
              ],
              [
                "Estimated growth",
                "צמיחה משוערת",
                total - v.initial - v.monthly * v.years * 12,
              ],
            ]
          : [
              ["Monthly contribution needed", "הפקדה חודשית נדרשת", required],
              ["Target balance", "יתרת יעד", v.target],
            ];
      chart = Array.from({ length: v.years }, (_, i) =>
        savings(v.initial, id === "goal" ? required : v.monthly, v.rate, i + 1),
      );
      details =
        t("Constant annual nominal return, monthly compounding, end-of-month contributions. No tax, fees or inflation. Returns are assumptions, not guarantees.","תשואה שנתית נומינלית קבועה, ריבית דריבית חודשית והפקדות בסוף כל חודש. ללא מס, עמלות או אינפלציה. התשואה היא הנחה ואינה מובטחת.");
    }
    if (id === "emergency") {
      const target = v.expenses * v.months;
      metrics = [
        ["Emergency fund target", "יעד קרן חירום", target],
        ["Still to save", "יתרה לחיסכון", Math.max(0, target - v.initial)],
      ];
      details =
        t("Essential monthly expenses × months of protection, less existing savings.","הוצאות חיוניות חודשיות כפול מספר חודשי ההגנה, בניכוי החיסכון הקיים.");
    }
    if (id === "fuel" || id === "car") {
      if (v.resale > v.price && id === "car")
        throw Error("Resale value exceeds purchase price.");
      const r = carCost({ ...v, fees: v.carFees, years: v.ownership });
      metrics =
        id === "fuel"
          ? [
              ["Annual energy cost", "עלות אנרגיה שנתית", r.energy],
              ["Monthly energy cost", "עלות אנרגיה חודשית", r.energy / 12],
              [
                "Energy cost per km",
                "עלות אנרגיה לק״מ",
                r.energy / v.km,
                "currency-decimal",
              ],
            ]
          : [
              ["Monthly cost", "עלות חודשית", r.monthly],
              ["Annual cost", "עלות שנתית", r.annual],
              ["Cost per km", "עלות לק״מ", r.perKm, "currency-decimal"],
              ["Annual depreciation", "ירידת ערך שנתית", r.depreciation],
            ];
      chart = [r.energy, v.insurance, v.maintenance, r.depreciation];
      details =
        t("Energy = km × consumption per 100 km × unit price ÷ 100. Depreciation = (purchase − resale) ÷ ownership years. Financing cash payments plus depreciation can double-count principal: enter financing interest only for economic cost, or use the result as an extended cash-flow view.","עלות האנרגיה היא הנסועה כפול הצריכה ל־100 ק״מ כפול מחיר היחידה, חלקי 100. ירידת הערך היא מחיר הרכישה פחות שווי המכירה, חלקי שנות האחזקה. תשלומי מימון יחד עם ירידת ערך עלולים לספור את הקרן פעמיים: לחישוב עלות כלכלית הזינו ריבית מימון בלבד, או התייחסו לתוצאה כתזרים מורחב.");
    }
  } catch (e) {
    warning = t(e.message, "יש לבדוק את הנתונים שהוזנו.",'Проверьте введённые данные.');
    metrics = [];
  }
  const save = () => {
    try {
      localStorage.setItem(
        "cp-scenario-" + tool.id,
        JSON.stringify({ values: v, metrics }),
      );
      S({ values: v, metrics });
      N(t("Scenario saved on this device.", "התרחיש נשמר במכשיר."));
    } catch {
      N(t("Storage unavailable. Export a backup.","השמירה אינה זמינה. יש לייצא גיבוי."));
    }
  };
  return (
    <>
      <ScenarioWorkspace id={tool.id} values={v} onLoad={V} defaults={{...defaults,...(tool.id==='car-loan'?{years:5,rate:7}:{})}} fields={groups[tool.id].map(key=>[key,t(fields[key][0],fields[key][1])])} metrics={metrics.map(([en,he,value,format])=>({id:en,label:t(en,he),value:format==='percent'?value.toFixed(1)+'%':format==='decimal'?value.toFixed(2):money(value,format==='currency-decimal'?2:0)}))}/>
      <div className="workspace">
        <section className="panel inputs">
          <div className="panel-heading">
            <h3>{t("Your numbers", "הנתונים שלך")}</h3>
            <button
              className="text-button"
              onClick={() => V({...defaults,...(tool.id==='car-loan'?{years:5,rate:7}:{})})}
              aria-label={t('Reset inputs','איפוס הנתונים')}
              title={t('Reset inputs','איפוס הנתונים')}
            >
              <RotateCcw size={17} />
            </button>
          </div>
          {groups[tool.id].map((key) => {
            const [en, he, min, max, step] = fields[key];
            return (
              <label key={key}>
                {t(en, he)}
                <div className="number-field">
                  <NumberInput
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={v[key]}
                    onChange={(e) =>
                      V({
                        ...v,
                        [key]: Math.min(
                          max,
                          Math.max(
                            min,
                            Number(e.target.value) || 0,
                          ),
                        ),
                      })
                    }
                  />
                  <span>
                    {["rate", "ratio", "ltv", "newRate", "extraRate"].includes(
                      key,
                    )
                      ? "%"
                      : ""}
                  </span>
                </div>
                {["rate", "years", "ratio", "ltv"].includes(key) && (
                  <input
                    aria-label={t(en + " slider",he+' - בחירת ערך')}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={v[key]}
                    onChange={(e) => V({ ...v, [key]: +e.target.value })}
                  />
                )}
              </label>
            );
          })}
        </section>
        <section className="panel results">
          <div className="eyebrow">
            {t("YOUR PLAN, AT A GLANCE", "התוכנית שלך במבט אחד")}
          </div>
          <h2>{t("See the possibilities.", "לראות את האפשרויות.")}</h2>
          {metrics.map(([en, he, val, format], i) => (
            <div
              key={en}
              className={"result " + (i === 0 ? "main-result" : "")}
            >
              <span>{t(en, he)}</span>
              <strong>
                {format === "percent"
                  ? val.toFixed(1) + "%"
                  : format === "decimal"
                    ? val.toFixed(2)
                    : money(val,format==='currency-decimal'?2:0)}
              </strong>
            </div>
          ))}
          {metrics.length > 0 && (
            <><CalculatorPlots id={tool.id} v={v} rows={rows} /><CalculatorSensitivity id={tool.id} v={v}/></>
          )}
          {warning && <div className="notice" role="alert">{warning}</div>}
          <div className="actions">
            <button
              className="primary"
              onClick={save}
              disabled={!metrics.length}
            >
              <Bookmark size={16} />
              {t("Save scenario", "שמירת תרחיש")}
            </button>
            <button className="secondary" onClick={() => window.print()}>
              <Printer size={16} />
              {t("Print / PDF", "הדפסה או שמירה לקובץ")}
            </button>
          </div>
          <p role="status">{notice}</p>
          {saved && (
            <div className="comparison">
              <h3>{t("Saved comparison", "השוואה לתרחיש שמור")}</h3>
              {saved.metrics.map(([en, he, n, f]) => (
                <p key={en}>
                  <span>{t(en, he)}</span>
                  <b>
                    {f === "percent"
                      ? n.toFixed(1) + "%"
                      : f === "decimal"
                        ? n.toFixed(2)
                        : money(n,f==='currency-decimal'?2:0)}
                  </b>
                </p>
              ))}
              <button className="text-button" onClick={() => V(saved.values)}>
                {t("Load saved inputs", "טעינת נתונים שמורים")}
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </section>
      </div>
      <section className="panel explanation">
        <h3>{t("How this is calculated", "כיצד התוצאה מחושבת")}</h3>
        <p>{details}</p>
        <p>
          {t(
            "All figures are estimates. Verify lender terms, local rules and fees before making a decision.",
            "המספרים הם אומדן. יש לבדוק תנאי מלווה, כללים מקומיים ועלויות לפני קבלת החלטה.",
          )}
        </p>
      </section>
      {rows.length > 0 && (
        <section className="panel">
          <div className="panel-heading">
            <h3>{t("Amortization schedule", "לוח סילוקין")}</h3>
            <button
              className="secondary"
              onClick={() =>
                download(
                  "amortization.csv",
                  "Month,Payment,Interest,Principal,Balance\n" +
                    rows
                      .map((r) =>
                        Object.values(r)
                          .map((n) => n.toFixed(2))
                          .join(","),
                      )
                      .join("\n"),
                  "text/csv",
                )
              }
            >
              <Download size={16} />
              {t('CSV','ייצוא נתונים')}
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {["Month", "Payment", "Interest", "Principal", "Balance"].map(
                    (x) => (
                      <th key={x}>{t(x,{Month:'חודש',Payment:'תשלום',Interest:'ריבית',Principal:'קרן',Balance:'יתרה'}[x])}</th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {(all ? rows : rows.slice(0, 12)).map((r) => (
                  <tr key={r.month}>
                    <td>{r.month}</td>
                    {[r.payment, r.interest, r.principal, r.balance].map(
                      (n, i) => (
                        <td key={i}>{money(n)}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="text-button" onClick={() => A(!all)}>
            {all
              ? t("Show first year", "הצגת שנה ראשונה")
              : t("Show all months", "הצגת כל החודשים")}
          </button>
        </section>
      )}
    </>
  );
}
