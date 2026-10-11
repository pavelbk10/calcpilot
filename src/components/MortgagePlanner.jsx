"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Download,
  Bookmark,
  Printer,
  RotateCcw,
} from "lucide-react";
import { usePrefs } from "./Shell";
import InteractiveChart from "./InteractiveChart";
import NumberInput from './NumberInput';
import ScenarioWorkspace from './ScenarioWorkspace';
import { download } from "./Calculator";
import {
  trackTypes,
  defaultTracks,
  defaultForecast,
  simulateMortgage,
  forecastAt,
} from "../lib/mortgage.mjs";
export default function MortgagePlanner() {
  const { t, money } = usePrefs();
  const [tracks, T] = useState(defaultTracks),
    [forecast, F] = useState(defaultForecast),
    [saved, S] = useState(null),
    [view, V] = useState("payment"),
    [all, A] = useState(false),
    [notice, N] = useState("");
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("cp-mortgage-mix-v2"));
      if (p && Array.isArray(p.tracks) && Array.isArray(p.forecast)) {
        simulateMortgage(p.tracks, p.forecast);
        S(p);
      }
    } catch {}
  }, []);
  let result,
    baseline,
    error = "";
  try {
    result = simulateMortgage(tracks, forecast);
    if (saved) baseline = simulateMortgage(saved.tracks, saved.forecast);
  } catch (e) {
    error = t(e.message, "יש לבדוק סכומים, תקופות ותחזיות.",'Проверьте суммы, сроки и прогнозы.');
  }
  const update = (id, k, n) =>
    T(tracks.map((x) => (x.id === id ? { ...x, [k]: n } : x)));
  const numeric = (e, min, max) =>
    Math.min(max, Math.max(min, Number(e.target.value) || 0));
  const save = () => {
    try {
      const s = {
        tracks: tracks.map((x) => ({ ...x })),
        forecast: forecast.map((x) => ({ ...x })),
      };
      localStorage.setItem("cp-mortgage-mix-v2", JSON.stringify(s));
      S(s);
      N(
        t(
          "Saved. Changes can now be compared with this scenario.",
          "נשמר. שינויים חדשים יוצגו מול התרחיש השמור.",
        ),
      );
    } catch {
      N(
        t(
          "Storage unavailable. Download the scenario instead.",
          "השמירה אינה זמינה. ניתן להוריד את התרחיש.",
        ),
      );
    }
  };
  const preset = (type) =>
    F(
      defaultForecast.map((p, i) => ({
        ...p,
        inflation: type === "rise" ? 3.5 : type === "fall" ? 1 : 2,
        rateShift: type === "rise" ? i * 1 : type === "fall" ? -i * 0.75 : 0,
        prime: 6 + (type === "rise" ? i : type === "fall" ? -i * 0.75 : 0),
      })),
    );
  const labels = {
    payment: t("Monthly payment", "החזר חודשי"),
    balance: t("Remaining balance", "יתרת קרן"),
    cumulative: t("Cumulative repayments", "החזר מצטבר"),
  };
  const chart = result?.rows.map((r, i) => ({
    label: String(r.month),
    value: r[view],
    ...(baseline ? { saved: baseline.rows[i]?.[view] || 0 } : {}),
    ...Object.fromEntries(
      result.results.map((x, j) => ["track" + j, x.rows[i]?.[view] || 0]),
    ),
  }));
  const series = [
    { key: "value", label: t("Current total", "תמהיל נוכחי") },
    ...(baseline
      ? [
          {
            key: "saved",
            label: t("Saved scenario", "תרחיש שמור"),
            color: "#c49039",
          },
        ]
      : []),
  ];
  if (view !== "cumulative")
    result?.results.forEach((x, i) =>
      series.push({
        key: "track" + i,
        label:
          t(
            trackTypes.find((y) => y.id === x.track.type).en,
            trackTypes.find((y) => y.id === x.track.type).he,
          ) +
          " " +
          (i + 1),
      }),
    );
  return (
    <>
      <ScenarioWorkspace id="mortgage" values={{tracks,forecast}} defaults={{tracks:defaultTracks,forecast:defaultForecast}} onLoad={values=>{T(values.tracks);F(values.forecast)}} fields={[["tracks",t('Mortgage tracks','מסלולי משכנתא','Ипотечные программы')],["forecast",t('Forecast assumptions','הנחות תחזית')]]} metrics={result?[{id:'total',label:t('Total repayments','סך החזרים'),value:money(result.total)},{id:'interest',label:t('Total interest','סך ריבית'),value:money(result.interest)}]:[]}/>
      <div className="planner-intro">
        <div className="tag">
          {t("MULTI-TRACK SIMULATION", "סימולציה לתמהיל מסלולים")}
        </div>
        <p>
          {t(
            "Edit example rates and forecast assumptions. No live bank-rate feed or official forecast is connected.",
            "הריביות וערכי התחזית הם דוגמאות לעריכה. אין חיבור לריביות בנקים בזמן אמת או לתחזית רשמית.",
          )}
        </p>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <h3>{t("Build your mortgage mix", "בניית תמהיל המשכנתא")}</h3>
          <button
            className="secondary"
            disabled={tracks.length >= 10}
            onClick={() =>
              T([
                ...tracks,
                {
                  ...defaultTracks[0],
                  id: crypto.randomUUID(),
                  amount: 100000,
                },
              ])
            }
          >
            <Plus size={15} />
            {t("Add track", "הוספת מסלול")}
          </button>
        </div>
        <div className="track-list">
          {tracks.map((x, i) => {
            const type = trackTypes.find((y) => y.id === x.type);
            return (
              <div className="track-editor" key={x.id}>
                <div className="track-number">{i + 1}</div>
                <label>
                  {t("Track", "מסלול")}
                  <select
                    value={x.type}
                    onChange={(e) => update(x.id, "type", e.target.value)}
                  >
                    {trackTypes.map((y) => (
                      <option value={y.id} key={y.id}>
                        {t(y.en, y.he)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t("Amount", "סכום")}
                  <NumberInput
                    type="number"
                    min="0"
                    max="100000000"
                    step="1000"
                    value={x.amount}
                    onChange={(e) =>
                      update(x.id, "amount", numeric(e, 0, 100000000))
                    }
                  />
                </label>
                <label>
                  {t("Years", "שנים")}
                  <NumberInput
                    type="number"
                    min="1"
                    max="40"
                    value={x.years}
                    onChange={(e) =>
                      update(x.id, "years", Math.round(numeric(e, 1, 40)))
                    }
                  />
                </label>
                {x.type !== "prime" ? (
                  <label>
                    {t("Initial rate (%)", "ריבית התחלתית (%)")}
                    <NumberInput
                      type="number"
                      min="0"
                      max="40"
                      step=".05"
                      value={x.rate}
                      onChange={(e) => update(x.id, "rate", numeric(e, 0, 40))}
                    />
                  </label>
                ) : (
                  <label>
                    {t("Prime margin (%)", "מרווח מפריים (%)")}
                    <NumberInput
                      type="number"
                      min="-10"
                      max="10"
                      step=".05"
                      value={x.margin}
                      onChange={(e) =>
                        update(x.id, "margin", numeric(e, -10, 10))
                      }
                    />
                  </label>
                )}
                {type.variable && x.type !== "prime" && (
                  <label>
                    {t("Reset every (years)", "שינוי ריבית כל (שנים)")}
                    <select
                      value={x.resetYears}
                      onChange={(e) =>
                        update(x.id, "resetYears", +e.target.value)
                      }
                    >
                      {[1, 2, 3, 5, 7, 10].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <button
                  className="text-button"
                  aria-label={t("Remove track", "מחיקת מסלול") + " " + (i + 1)}
                  disabled={tracks.length === 1}
                  onClick={() => T(tracks.filter((y) => y.id !== x.id))}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
        <div className="actions">
          <button
            className="text-button"
            onClick={() => {
              T(defaultTracks);
              F(defaultForecast);
            }}
          >
            <RotateCcw size={14} />
            {t("Reset example", "איפוס לדוגמה")}
          </button>
          <span className="muted">
            {t(
              "Prime rate = your forecast + track margin.",
              "ריבית מסלול פריים = תחזית הפריים + מרווח המסלול.",
            )}
          </span>
        </div>
      </section>
      <section className="panel forecast-panel">
        <div className="panel-heading">
          <div>
            <h3>
              {t("Interest & inflation forecast", "תחזית ריבית ואינפלציה")}
            </h3>
            <p className="muted">
              {t(
                "Each row applies from its selected loan year until the next row. The last row continues to maturity.",
                "כל שורה חלה משנת ההלוואה שנבחרה עד לשורה הבאה. השורה האחרונה ממשיכה עד סוף התקופה.",
              )}
            </p>
          </div>
          <button
            className="secondary"
            disabled={forecast.at(-1).year >= 40}
            onClick={() => {
              const p = forecast.at(-1);
              F([...forecast, { ...p, year: Math.min(40, p.year + 5) }]);
            }}
          >
            <Plus size={15} />
            {t("Add period", "הוספת תקופה")}
          </button>
        </div>
        <div className="forecast-presets">
          <button onClick={() => preset("flat")}>
            {t("Flat example", "דוגמה יציבה")}
          </button>
          <button onClick={() => preset("rise")}>
            {t("Rising example", "דוגמת עלייה")}
          </button>
          <button onClick={() => preset("fall")}>
            {t("Falling example", "דוגמת ירידה")}
          </button>
        </div>
        <div className="forecast-rows">
          {forecast.map((p, i) => (
            <div key={i} className="forecast-row">
              <label>
                {t("From year", "משנה")}
                <NumberInput
                  aria-label={t('Forecast year ','שנת תחזית ') + (i + 1)}
                  type="number"
                  disabled={i === 0}
                  min={i ? forecast[i - 1].year + 1 : 1}
                  max={i < forecast.length - 1 ? forecast[i + 1].year - 1 : 40}
                  value={p.year}
                  onChange={(e) =>
                    F(
                      forecast.map((x, j) =>
                        i === j
                          ? {
                              ...x,
                              year: Math.round(
                                numeric(
                                  e,
                                  forecast[i - 1].year + 1,
                                  i < forecast.length - 1
                                    ? forecast[i + 1].year - 1
                                    : 40,
                                ),
                              ),
                            }
                          : x,
                      ),
                    )
                  }
                />
              </label>
              <label>
                {t("Annual inflation (%)", "אינפלציה שנתית (%)")}
                <NumberInput
                  aria-label={t('Inflation period ','תקופת אינפלציה ') + (i + 1)}
                  type="number"
                  min="-5"
                  max="20"
                  step=".1"
                  value={p.inflation}
                  onChange={(e) =>
                    F(
                      forecast.map((x, j) =>
                        i === j ? { ...x, inflation: numeric(e, -5, 20) } : x,
                      ),
                    )
                  }
                />
              </label>
              <label>
                {t("Variable-rate shift (pp)", "שינוי בריבית משתנה (נק׳ אחוז)")}
                <NumberInput
                  aria-label={t('Variable rate shift ','שינוי ריבית משתנה ') + (i + 1)}
                  type="number"
                  min="-15"
                  max="15"
                  step=".1"
                  value={p.rateShift}
                  onChange={(e) =>
                    F(
                      forecast.map((x, j) =>
                        i === j ? { ...x, rateShift: numeric(e, -15, 15) } : x,
                      ),
                    )
                  }
                />
              </label>
              <label>
                {t("Prime forecast (%)", "תחזית פריים (%)")}
                <NumberInput
                  aria-label={t('Prime forecast ','תחזית פריים ') + (i + 1)}
                  type="number"
                  min="0"
                  max="25"
                  step=".1"
                  value={p.prime}
                  onChange={(e) =>
                    F(
                      forecast.map((x, j) =>
                        i === j ? { ...x, prime: numeric(e, 0, 25) } : x,
                      ),
                    )
                  }
                />
              </label>
              {i > 0 && (
                <button
                  className="text-button"
                  aria-label={t('Remove forecast period ','מחיקת תקופת תחזית ') + (i + 1)}
                  onClick={() => F(forecast.filter((_, j) => j !== i))}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
      {error ? (
        <div className="notice">{error}</div>
      ) : (
        <>
          <div className="mortgage-stats">
            {[
              [t("Loan amount", "סכום משכנתא"), result.amount],
              [t("First forecast payment", "החזר ראשון בתחזית"), result.first],
              [t("Maximum payment", "החזר חודשי מרבי"), result.peak],
              [t("Total repayments", "סך החזרים"), result.total],
              [t("Total interest", "סך ריביות"), result.interest],
              [
                t("Net CPI additions", "סך תוספות הצמדה נטו"),
                result.indexation,
              ],
            ].map(([label, n]) => (
              <div className="stat" key={label}>
                <span>{label}</span>
                <strong>{money(n)}</strong>
              </div>
            ))}
          </div>
          <div className="cost-banner">
            <div>
              <span>
                {t("Repayment for each 1 borrowed", "החזר כולל לכל שקל שנלווה")}
              </span>
              <strong>
                {result.amount ? result.costPerUnit.toFixed(3) : "—"}
              </strong>
            </div>
            <p>
              {t(
                "Total projected payments ÷ original loan amount. Includes principal, interest and indexation; excludes insurance and fees.",
                "סך ההחזרים החזויים חלקי סכום ההלוואה המקורי. כולל קרן, ריבית והצמדה; ללא ביטוחים ועמלות.",
              )}
            </p>
          </div>
          <div className="actions">
            <button className="primary" onClick={save}>
              <Bookmark size={16} />
              {t("Save comparison", "שמירת תרחיש להשוואה")}
            </button>
            {saved && (
              <button
                className="secondary"
                onClick={() => {
                  T(saved.tracks);
                  F(saved.forecast);
                }}
              >
                {t("Load saved mix", "טעינת התמהיל השמור")}
              </button>
            )}
            <button
              className="secondary"
              onClick={() =>
                download(
                  "mortgage-scenario.json",
                  JSON.stringify({ version: 2, tracks, forecast }, null, 2),
                )
              }
            >
              <Download size={15} />
              {t("Export scenario", "ייצוא תרחיש")}
            </button>
            <button className="secondary" onClick={() => window.print()}>
              <Printer size={15} />
              {t('Print / PDF','הדפסה או שמירה לקובץ')}
            </button>
            <span role="status">{notice}</span>
          </div>
          <section className="panel">
            <div className="tabs">
              {Object.keys(labels).map((k) => (
                <button
                  key={k}
                  className={view === k ? "active" : ""}
                  onClick={() => V(k)}
                >
                  {labels[k]}
                </button>
              ))}
            </div>
            <InteractiveChart
              title={labels[view]}
              xLabel={t("Month", "חודש")}
              data={chart}
              series={series}
            />
          </section>
          <div className="chart-grid">
            <section className="panel">
              <InteractiveChart
                title={t("Principal, interest & CPI", "קרן, ריבית והצמדה")}
                bar
                data={[
                  {
                    label: t("Original principal", "קרן מקורית"),
                    value: result.amount,
                  },
                  { label: t("Interest", "ריבית"), value: result.interest },
                  {
                    label: t("Net CPI", "הצמדה נטו"),
                    value: result.indexation,
                  },
                ]}
                series={[{ key: "value", label: t("Amount", "סכום") }]}
              />
            </section>
            <section className="panel">
              <InteractiveChart
                percent
                title={t("Forecast assumptions", "הנחות התחזית")}
                xLabel={t("Year", "שנה")}
                data={Array.from(
                  { length: Math.max(...tracks.map((x) => x.years)) },
                  (_, i) => ({
                    label: String(i + 1),
                    ...forecastAt(forecast, i + 1),
                  }),
                )}
                series={[
                  { key: "inflation", label: t("Inflation", "אינפלציה") },
                  { key: "prime", label: t("Prime", "פריים") },
                  {
                    key: "rateShift",
                    label: t("Variable shift (pp)", "שינוי ריבית (נק׳ אחוז)"),
                  },
                ]}
              />
            </section>
          </div>
          <section className="panel">
            <h3>{t("Compare tracks", "השוואת מסלולים")}</h3>
            <InteractiveChart title={t('Costs by mortgage track','עלויות לפי מסלול משכנתא')} bar data={result.results.map((row,index)=>({label:t('Track','מסלול')+' '+(index+1),principal:row.track.amount,interest:row.interest,indexation:row.indexation}))} series={[{key:'principal',label:t('Principal','קרן')},{key:'interest',label:t('Interest','ריבית')},{key:'indexation',label:t('Indexation','הצמדה')}]}/>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {[
                      t("Track", "מסלול"),
                      t("Amount", "סכום"),
                      t("Interest", "ריבית"),
                      t("CPI additions", "תוספות הצמדה"),
                      t("Total repaid", "סך החזר"),
                      t("Per 1 borrowed", "החזר לכל שקל"),
                    ].map((s) => (
                      <th key={s}>{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r, i) => (
                    <tr key={i}>
                      <td>
                        {t(
                          trackTypes.find((y) => y.id === r.track.type).en,
                          trackTypes.find((y) => y.id === r.track.type).he,
                        )}{" "}
                        {i + 1}
                      </td>
                      {[r.track.amount, r.interest, r.indexation, r.total].map(
                        (n, j) => (
                          <td key={j}>{money(n)}</td>
                        ),
                      )}
                      <td>{r.track.amount ? r.costPerUnit.toFixed(3) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h3>{t("Combined amortization", "לוח סילוקין משולב")}</h3>
              <button
                className="secondary"
                onClick={() =>
                  download(
                    "mortgage-mix-amortization.csv",
                    "Month,Payment,Interest,Indexation,Principal,Balance,Cumulative\n" +
                      result.rows
                        .map((r) =>
                          [
                            r.month,
                            r.payment,
                            r.interest,
                            r.indexation,
                            r.principal,
                            r.balance,
                            r.cumulative,
                          ]
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
                    {[
                      t("Month", "חודש"),
                      t("Payment", "החזר"),
                      t("Interest", "ריבית"),
                      t("CPI addition", "הצמדה"),
                      t("Principal repaid", "קרן שנפרעה"),
                      t("Balance", "יתרה"),
                    ].map((s) => (
                      <th key={s}>{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(all ? result.rows : result.rows.slice(0, 12)).map((r) => (
                    <tr key={r.month}>
                      <td>{r.month}</td>
                      {[
                        r.payment,
                        r.interest,
                        r.indexation,
                        r.principal,
                        r.balance,
                      ].map((n, i) => (
                        <td key={i}>{money(n)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="text-button" onClick={() => A(!all)}>
              {all
                ? t("Show first year", "שנה ראשונה")
                : t("Show all months", "כל החודשים")}
            </button>
          </section>
        </>
      )}
      <section className="panel explanation">
        <h3>{t("Model assumptions", "הנחות החישוב")}</h3>
        <p>
          {t(
            "Equal-payment amortization. CPI is applied to opening balances monthly, using the annual forecast converted to a monthly factor, including the first month. Linked payments grow by the same factor. Fixed rates do not change. Variable rates change only at the selected reset dates: initial rate plus the forecast shift at reset. Prime equals the prime forecast plus the track margin and resets monthly. Rates have a floor of zero. The last forecast is held to maturity. CPI can decline; no contractual CPI floor, lag or daily accrual is modeled.",
            "לוח שפיצר. המדד מוחל על יתרת הקרן בתחילת כל חודש לפי המרה של התחזית השנתית לגורם חודשי, לרבות החודש הראשון. התשלום הצמוד גדל בהתאם. ריבית קבועה אינה משתנה. במסלול משתנה הריבית מתעדכנת רק בתחנת השינוי לפי הריבית ההתחלתית בתוספת שינוי התחזית באותה תחנה. פריים מחושב כתחזית הפריים בתוספת המרווח ומתעדכן בכל חודש. ריבית מינימום אפס. התחזית האחרונה נשמרת עד סוף התקופה. המודל מאפשר מדד שלילי ואינו כולל רצפת מדד חוזית, פיגור בפרסום המדד או ריבית יומית.",
          )}
        </p>
        <p>
          {t(
            "This is an illustrative scenario model, not a bank offer, official forecast or an assessment of regulatory eligibility. Fees, insurance and prepayment costs are excluded.",
            "זהו מודל תרחישים להמחשה ולא הצעת בנק, תחזית רשמית או בדיקת עמידה במגבלות רגולטוריות. עמלות, ביטוחים ועלויות פירעון מוקדם אינם כלולים.",
          )}
        </p>
        <a
          className="text-button"
          href="https://www.boi.org.il/information/bank-paymnts/financial-education/competition-in-mortgages/"
          target="_blank"
          rel="noreferrer"
        >
          {t(
            "Bank of Israel: mortgage track explanations ↗",
            "בנק ישראל: הסבר על מסלולי המשכנתא ↗",
          )}
        </a>
      </section>
    </>
  );
}
