"use client";
import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  X,
  Download,
  Upload,
  Trash2,
  Pencil,
  Undo2,
  Save,
  Wallet,
  Car,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { usePrefs } from "./Shell";
import { download } from "./Calculator";
import NumberInput from './NumberInput';
import {undoDeletedRecord,validRecordDate,validTrackerData} from '../lib/records.mjs';
import {locales} from '../lib/i18n.mjs';
const cats = [
  "Housing",
  "Utilities",
  "Groceries",
  "Insurance",
  "Transport",
  "Health",
  "Kids",
  "Entertainment",
  "Subscriptions",
  "Other",
];
const carCats = [
  "Fuel / Charging",
  "Insurance",
  "Service",
  "Registration",
  "Repairs",
  "Parking",
  "Other",
];
const categoryHebrew={Housing:'דיור',Utilities:'חשבונות הבית',Groceries:'מזון וקניות',Insurance:'ביטוח',Transport:'תחבורה',Health:'בריאות',Kids:'ילדים',Entertainment:'בילויים',Subscriptions:'מנויים',Other:'אחר','Fuel / Charging':'דלק או טעינה',Service:'טיפולים',Registration:'רישוי',Repairs:'תיקונים',Parking:'חניה'};
export default function Tracker({ garage = false }) {
  const { t, money,lang } = usePrefs();
  const key = garage ? "cp-garage-v1" : "cp-budget-v1";
  const [data, D] = useState({ entries: [], budget: 4000, vehicles: [] }),
    [ready, R] = useState(false),
    [month, M] = useState(""),
    [vehicle, V] = useState("all"),
    [notice, N] = useState(""),
    [form, F] = useState({
      date: "",
      description: "",
      amount: "",
      type: "expense",
      category: garage ? carCats[0] : cats[0],
      vehicle: "",
    }),
    [vehicleName, VN] = useState(""),[recordQuery,setRecordQuery]=useState(''),[editId,setEditId]=useState(null),[deleted,setDeleted]=useState(null),[lastBackup,setLastBackup]=useState(null);
  const file = useRef();
  const recordForm=useRef();
  useEffect(() => {
    M(new Date().toISOString().slice(0, 7));
    F((f) => ({ ...f, date: new Date().toISOString().slice(0, 10) }));
    try {
      const d = JSON.parse(localStorage.getItem(key));
      if (validTrackerData(d,garage?carCats:cats,garage))
        D(d);
      const backedUp=Number(localStorage.getItem(key+'-backup-at'));
      if(Number.isFinite(backedUp)&&backedUp>0&&backedUp<=Date.now())setLastBackup(backedUp);
    } catch {
      N(t('Local data could not be read. Restore a backup if available.','לא ניתן לקרוא את הנתונים המקומיים. יש לשחזר גיבוי אם קיים.'));
    }
    R(true);
  }, [key]);
  const commit = (d) => {
    try {
      localStorage.setItem(key, JSON.stringify(d));
      D(d);
      N(t("Saved on this device.", "נשמר במכשיר שלך."));
    } catch {
      N(
        t(
          "Storage unavailable. Export your data before closing.",
          "השמירה אינה זמינה. יש לייצא גיבוי לפני סגירה.",
        ),
      );
      D(d);
    }
  };
  const entries = data.entries.filter(
    (e) =>
      e.date.startsWith(month) &&
      (!garage || vehicle === "all" || e.vehicle === vehicle),
  );
  const sum = (type) =>
    entries.filter((e) => e.type === type).reduce((s, e) => s + e.amount, 0);
  const visibleEntries=entries.filter(entry=>[entry.date,entry.description,entry.category,t(entry.category,categoryHebrew[entry.category]||entry.category),data.vehicles.find(item=>item.id===entry.vehicle)?.name||''].join(' ').toLowerCase().includes(recordQuery.trim().toLowerCase()));
  const income = sum("income"),
    spend = sum("expense"),
    previous = new Date((month || "2026-01") + "-01T12:00:00Z");
  previous.setUTCMonth(previous.getUTCMonth() - 1);
  const prior = data.entries
    .filter(
      (e) =>
        e.date.startsWith(previous.toISOString().slice(0, 7)) &&
        e.type === "expense" &&
        (!garage || vehicle === "all" || e.vehicle === vehicle),
    )
    .reduce((s, e) => s + e.amount, 0);
  const breakdown = (garage ? carCats : cats)
    .map((c) => [
      c,
      entries
        .filter((e) => e.category === c && e.type === "expense")
        .reduce((s, e) => s + e.amount, 0),
    ])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  const add = (e) => {
    e.preventDefault();
    if (
      !validRecordDate(form.date) ||
      !form.description.trim() ||
      !Number.isFinite(+form.amount) ||
      +form.amount <= 0 ||
      +form.amount > 1e12 ||
      (garage && !form.vehicle)
    )
      return N(
        t(
          "Complete the date, description, positive amount and vehicle.",
          "יש למלא תאריך, תיאור, סכום חיובי ורכב.",
        ),
      );
    commit({
      ...data,
      entries: [
        ...(!editId?[{...form,id:crypto.randomUUID(),amount:+form.amount}]:[]),
        ...data.entries.map(entry=>entry.id===editId?{...form,id:editId,amount:+form.amount}:entry),
      ],
    });
    setEditId(null);
    F({ ...form, description: "", amount: "" });
  };
  const backup = () => {
    const createdAt=new Date().toISOString();
    download(
      (garage ? "garage" : "household") + "-backup-"+createdAt.slice(0,10)+".json",
      JSON.stringify(
        { version: 1, kind: garage ? "garage" : "budget", createdAt,data },
        null,
        2,
      ),
    );
    try{localStorage.setItem(key+'-backup-at',String(Date.now()));setLastBackup(Date.now())}catch{}
    N(t('Backup download requested. Verify the file in your downloads.','הורדת הגיבוי התבקשה. ודאו שהקובץ נמצא בהורדות.','Загрузка резервной копии запрошена. Проверьте файл в загрузках.'));
  };
  const restore = async (e) => {
    try {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size > 5e6) throw Error("File too large");
      const b = JSON.parse(await f.text());
      if(!validTrackerData(b.data,garage?carCats:cats,garage))throw Error('Invalid backup');
      if (
        b.version !== 1 ||
        b.kind !== (garage ? "garage" : "budget") ||
        !Array.isArray(b.data?.entries) ||
        !Array.isArray(b.data.vehicles) ||
        !Number.isFinite(b.data.budget) ||
        b.data.budget < 0 ||
        b.data.entries.some(
          (x) =>
            typeof x.id !== "string" ||
            typeof x.description !== "string" ||
            typeof x.date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(x.date) ||
            !Number.isFinite(x.amount) ||
            x.amount <= 0 ||
            !["income", "expense"].includes(x.type) ||
            !(garage ? carCats : cats).includes(x.category),
        ) ||
        b.data.vehicles.some(
          (x) => typeof x.id !== "string" || typeof x.name !== "string",
        )
      )
        throw Error("Invalid backup");
      if (
        !window.confirm(
          t(
            "Replace current records with this backup?",
            "להחליף את הנתונים הנוכחיים בגיבוי?",
          ),
        )
      )
        return;
      commit(b.data);
    } catch {
      N(
        t(
          "This backup is not valid for this dashboard.",
          "קובץ הגיבוי אינו תקין עבור מסך זה.",
        ),
      );
    }
    e.target.value = "";
  };
  const csv = () => {
    const esc = (x) => {
      let value = String(x);
      if (/^[=+@-]/.test(value)) value = "'" + value;
      return '"' + value.replaceAll('"', '""') + '"';
    };
    download(
      "expenses-" + month + ".csv",
      "Date,Description,Type,Category,Amount,Vehicle\n" +
        entries
          .map((e) =>
            [
              e.date,
              e.description,
              e.type,
              e.category,
              e.amount,
              data.vehicles.find((v) => v.id === e.vehicle)?.name || "",
            ]
              .map(esc)
              .join(","),
          )
          .join("\n"),
      "text/csv",
    );
  };
  return (
    <main className="page">
      <div className="page-title">
        <div className="eyebrow">
          {t("YOUR PERSONAL WORKSPACE", "מרחב הניהול האישי שלך")}
        </div>
        <h1>
          {garage
            ? t("Every kilometer, accounted for.", "כל קילומטר בחשבון.")
            : t("A little more in control.", "קצת יותר שליטה בכסף.")}
        </h1>
        <p>
          {t(
            "Your records stay in this browser. Back them up to move between devices.",
            "הנתונים נשמרים בדפדפן זה. ניתן לייצא גיבוי ולהעביר למכשיר אחר.",
          )}
        </p>
      </div>
      <div className="tracker-toolbar">
        <label>
          {t("Month", "חודש")}
          <input
            type="month"
            value={month}
            onChange={(e) => M(e.target.value)}
          />
        </label>
        {garage && (
          <label>
            {t("Vehicle", "רכב")}
            <select value={vehicle} onChange={(e) => V(e.target.value)}>
              <option value="all">{t("All vehicles", "כל הרכבים")}</option>
              {data.vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <button className="secondary" onClick={backup}>
          <Download size={16} />
          {t("Backup", "גיבוי")}
        </button>
        <button className="secondary" onClick={() => file.current.click()}>
          <Upload size={16} />
          {t("Restore", "שחזור")}
        </button>
        <input
          hidden
          type="file"
          accept="application/json"
          ref={file}
          onChange={restore}
        />
      </div>
      <div className="stats-grid">
        {(garage
          ? [
              [t("Recorded monthly cost", "הוצאות החודש"), spend],
              [t("Prior month", "חודש קודם"), prior],
              [
                t("Recorded annual cost", "הוצאות מתועדות השנה"),
                data.entries
                  .filter(
                    (e) =>
                      e.date.startsWith(month.slice(0, 4)) &&
                      e.type === "expense" &&
                      (vehicle === "all" || vehicle === e.vehicle),
                  )
                  .reduce((s, e) => s + e.amount, 0),
              ],
            ]
          : [
              [t("Monthly income", "הכנסות חודשיות"), income],
              [t("Monthly spending", "הוצאות חודשיות"), spend],
              [t("Net balance", "יתרה"), income - spend],
            ]
        ).map(([label, n], i) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong className={i === 2 ? "green" : ""}>{money(n)}</strong>
          </div>
        ))}
      </div>
      {!garage && (
        <div className="panel budget-meter">
          <div>
            <b>{t("Monthly expense limit", "תקרת הוצאות חודשית")}</b>
            <NumberInput
              aria-label={t('Monthly budget','תקציב חודשי')}
              type="number"
              min="0"
              value={data.budget}
              onChange={(e) =>
                commit({ ...data, budget: Math.max(0, +e.target.value) })
              }
            />
            <span>
              {spend > data.budget
                ? t("Over budget", "חריגה מהתקציב")
                : t("Within budget", "בתוך התקציב")}{" "}
              · {money(Math.abs(data.budget - spend))}
            </span>
          </div>
          <progress
            aria-label={t('Budget used','תקציב שנוצל')}
            max={data.budget || 1}
            value={Math.min(spend, data.budget || 1)}
          />
          <small>
            {t("Prior month spending", "הוצאות חודש קודם")}: {money(prior)} ·{" "}
            {t("Savings rate", "שיעור חיסכון")}:{" "}
            {income > 0
              ? (((income - spend) / income) * 100).toFixed(1) + "%"
              : "—"}
          </small>
        </div>
      )}
      <div className="workspace">
        <section className="panel">
          <h3>{editId?t('Edit record','עריכת רישום','Изменить запись'):t("Add a record", "הוספת רישום")}</h3>
          {garage && (
            <form
              className="inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!vehicleName.trim()) return;
                const id = crypto.randomUUID();
                commit({
                  ...data,
                  vehicles: [
                    ...data.vehicles,
                    { id, name: vehicleName.trim() },
                  ],
                });
                F({ ...form, vehicle: id });
                VN("");
              }}
            >
              <input
                aria-label={t('New vehicle name','שם רכב חדש')}
                placeholder={t("Vehicle name (e.g. Family car)", "שם הרכב")}
                value={vehicleName}
                onChange={(e) => VN(e.target.value)}
                maxLength={60}
              />
              <button type="submit" className="secondary">
                <Plus size={15} />
                {t("Add car", "הוספת רכב")}
              </button>
            </form>
          )}
          <form onSubmit={add} ref={recordForm}>
            <label>
              {t("Date", "תאריך")}
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => F({ ...form, date: e.target.value })}
              />
            </label>
            <label>
              {t("Description", "תיאור")}
              <input
                required
                maxLength={120}
                value={form.description}
                onChange={(e) => F({ ...form, description: e.target.value })}
                placeholder={t("What was it for?", "עבור מה התשלום?")}
              />
            </label>
            <div className="form-row">
              <label>
                {t("Amount", "סכום")}
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => F({ ...form, amount: e.target.value })}
                />
              </label>
              <label>
                {t("Type", "סוג")}
                <select
                  value={form.type}
                  onChange={(e) => F({ ...form, type: e.target.value })}
                >
                  <option value="expense">{t("Expense", "הוצאה")}</option>
                  {!garage && (
                    <option value="income">{t("Income", "הכנסה")}</option>
                  )}
                </select>
              </label>
            </div>
            <label>
              {t("Category", "קטגוריה")}
              <select
                value={form.category}
                onChange={(e) => F({ ...form, category: e.target.value })}
              >
                {(garage ? carCats : cats).map((c) => (
                  <option key={c} value={c}>{t(c,categoryHebrew[c])}</option>
                ))}
              </select>
            </label>
            {garage && (
              <label>
                {t("Vehicle", "רכב")}
                <select
                  required
                  value={form.vehicle}
                  onChange={(e) => F({ ...form, vehicle: e.target.value })}
                >
                  <option value="">{t("Select a vehicle", "בחירת רכב")}</option>
                  {data.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button disabled={!ready} className="primary" type="submit">
              {editId?<Save size={17}/>:<Plus size={17} />}
              {editId?t('Save changes','שמירת שינויים','Сохранить изменения'):t("Add record", "הוספת רישום")}
            </button>
            {editId&&<button type="button" className="secondary" onClick={()=>{setEditId(null);F({...form,description:'',amount:''})}}><X size={16}/>{t('Cancel editing','ביטול עריכה','Отменить редактирование')}</button>}
          </form>
          <p role="status">{notice}</p>
        </section>
        <section className="panel">
          <div className="eyebrow">
            {t("SPENDING INSIGHTS", "תובנות על ההוצאות")}
          </div>
          <h2>{t("Where it goes.", "לאן הכסף הולך.")}</h2>
          {breakdown.length ? (
            breakdown.map(([c, n]) => (
              <div className="breakdown" key={c}>
                <div>
                  <span>{t(c,categoryHebrew[c])}</span>
                  <b>{money(n)}</b>
                </div>
                <progress max={spend} value={n} />
              </div>
            ))
          ) : (
            <div className="empty">
              <Wallet size={35} />
              <h3>{t("Your fresh start.", "מתחילים מחדש.")}</h3>
              <p>
                {t(
                  "Add your first expense to see your spending breakdown.",
                  "הוסיפו את ההוצאה הראשונה כדי לראות את חלוקת ההוצאות.",
                )}
              </p>
            </div>
          )}
          {garage && (
            <p className="notice">
              {t(
                "This dashboard tracks entered cash expenses. Use the ownership calculator to include depreciation and cost per kilometer.",
                "הדשבורד מציג הוצאות שהוזנו. לחישוב ירידת ערך ועלות לק״מ השתמשו במחשבון אחזקת הרכב.",
              )}
            </p>
          )}
        </section>
      </div>
      <section className="panel">
        {ready&&data.entries.length>0&&(!lastBackup||Date.now()-lastBackup>7*86400000)&&<div className="notice backup-reminder"><p>{t('Keep a weekly backup. Browser data can be lost when storage is cleared.','מומלץ לגבות מדי שבוע. נתוני הדפדפן עלולים להימחק בניקוי האחסון.','Делайте еженедельную копию. Данные могут исчезнуть при очистке браузера.')}</p><button className="secondary" onClick={backup}><Download size={16}/>{t('Download backup','הורדת גיבוי','Скачать резервную копию')}</button></div>}
        {lastBackup&&<p className="backup-date">{t('Last backup requested','בקשת גיבוי אחרונה','Последний запрос резервной копии')}: {new Intl.DateTimeFormat(locales[lang],{dateStyle:'short',timeStyle:'short'}).format(lastBackup)}</p>}
        {deleted&&<div className="undo-notice" role="status"><span>{t('Record deleted','הרישום נמחק','Запись удалена')}: {deleted.entry.description}</span><button className="secondary" onClick={()=>{commit(undoDeletedRecord(data,deleted));setDeleted(null)}}><Undo2 size={16}/>{t('Undo deletion','ביטול מחיקה','Отменить удаление')}</button></div>}
        <div className="panel-heading">
          <h3>
            {t("Your records", "הרישומים שלך")}{" "}
            <small>({visibleEntries.length}/{entries.length})</small>
          </h3>
          <button className="secondary" onClick={csv}>
            <Download size={15} />
            {t('CSV','ייצוא נתונים')}
          </button>
        </div>
        <label className="search record-search"><Search size={17}/><input aria-label={t('Search records','חיפוש רישומים')} placeholder={t('Search records','חיפוש רישומים')} value={recordQuery} onChange={event=>setRecordQuery(event.target.value)}/>{recordQuery&&<button className="text-button" title={t('Clear search','ניקוי חיפוש')} aria-label={t('Clear search','ניקוי חיפוש')} onClick={()=>setRecordQuery('')}><X size={16}/></button>}</label>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {[
                  t("Date", "תאריך"),
                  t("Description", "תיאור"),
                  t("Category", "קטגוריה"),
                  t("Amount", "סכום"),
                  "",
                ].map((s, i) => (
                  <th key={i}>{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleEntries.map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>
                    {e.description}
                    {garage && (
                      <small className="muted">
                        {" "}
                        · {data.vehicles.find((v) => v.id === e.vehicle)?.name}
                      </small>
                    )}
                  </td>
                  <td>{t(e.category,categoryHebrew[e.category]||e.category)}</td>
                  <td className={e.type === "income" ? "green" : ""}>
                    {e.type === "income" ? "+" : "−"}
                    {money(e.amount)}
                  </td>
                  <td>
                    <button className="text-button" title={t('Edit record','עריכת רישום','Изменить запись')} aria-label={t('Edit record','עריכת רישום','Изменить запись')+' '+e.description} onClick={()=>{setEditId(e.id);const {id,...input}=e;F(input);recordForm.current?.scrollIntoView({behavior:'auto',block:'center'});recordForm.current?.querySelector('input')?.focus()}}><Pencil size={15}/></button>
                    <button
                      aria-label={t('Delete ','מחיקה ') + e.description}
                      title={t('Delete ','מחיקה ') + e.description}
                      className="text-button"
                      onClick={() => {
                        if (
                          window.confirm(
                            t("Delete this record?", "למחוק רישום זה?"),
                          )
                        ) {
                          setDeleted({entry:e,index:data.entries.findIndex(entry=>entry.id===e.id)});
                          if(editId===e.id){setEditId(null);F({...form,description:'',amount:''})}
                          commit({
                            ...data,
                            entries: data.entries.filter((x) => x.id !== e.id),
                          });
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleEntries.length && (
            <p className="empty">
              {recordQuery?t('No matching records.','אין רישומים התואמים לחיפוש.','Нет подходящих записей.'):t("No records for this month.", "אין רישומים בחודש זה.")}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
