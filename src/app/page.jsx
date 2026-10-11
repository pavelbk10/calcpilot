"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Wallet,
  Car,
  House,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpLeft,
  BookOpen,
} from "lucide-react";
import { usePrefs } from "../components/Shell";
import { tools } from "../lib/catalog.mjs";
import {
  CalculatorIllustration,
  descriptions,
  categoryHebrew,
} from "../components/CalculatorIdentity";
import InteractiveChart from "../components/InteractiveChart";
import {locales} from '../lib/i18n.mjs';

export default function HomePage() {
  const { t, money, lang } = usePrefs();
  const [records, setRecords] = useState([]),
    [date, setDate] = useState(null);
  useEffect(() => {
    setDate(new Date());
    try {
      const saved = JSON.parse(localStorage.getItem("cp-budget-v1"));
      if (Array.isArray(saved?.entries))
        setRecords(
          saved.entries.filter(
            (entry) =>
              Number.isFinite(entry.amount) && typeof entry.date === "string",
          ),
        );
    } catch {}
  }, []);
  const month = date
    ? String(date.getFullYear()) +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0")
    : null;
  const current = records.filter((entry) =>
    entry.date.startsWith(month || "__"),
  );
  const income = current
    .filter((entry) => entry.type === "income")
    .reduce((total, entry) => total + entry.amount, 0);
  const expenses = current
    .filter((entry) => entry.type === "expense")
    .reduce((total, entry) => total + entry.amount, 0);
  const trend = Array.from({ length: 6 }, (_, index) => {
    const point = date
      ? new Date(date.getFullYear(), date.getMonth() - 5 + index, 1)
      : null;
    const key = point
      ? String(point.getFullYear()) +
        "-" +
        String(point.getMonth() + 1).padStart(2, "0")
      : "__";
    const entries = records.filter((entry) => entry.date.startsWith(key));
    return {
      label: point
        ? new Intl.DateTimeFormat(locales[lang], {
            month: "short",
          }).format(point)
        : String(index + 1),
      income: entries
        .filter((entry) => entry.type === "income")
        .reduce((total, entry) => total + entry.amount, 0),
      expenses: entries
        .filter((entry) => entry.type === "expense")
        .reduce((total, entry) => total + entry.amount, 0),
    };
  });
  return (
    <main className="dashboard">
      <div className="dashboard-heading">
        <div>
          <div className="eyebrow">
            {t("YOUR FINANCIAL SPACE", "המרחב הפיננסי שלך")}
          </div>
          <h1>{t("A clear view. A better plan.", "לראות ברור. לתכנן חכם.")}</h1>
          <p>
            {t(
              "Your numbers, plans and next decisions.",
              "המספרים, התוכניות וההחלטות הבאות שלך.",
            )}
          </p>
        </div>
        <span className="dashboard-date">
          {date &&
            new Intl.DateTimeFormat(locales[lang], {
              month: "long",
              year: "numeric",
            }).format(date)}
        </span>
      </div>
      <div className="dashboard-stats">
        {[
          [ArrowDownLeft, "Monthly income", "הכנסות החודש", income],
          [ArrowUpLeft, "Monthly expenses", "הוצאות החודש", expenses],
          [TrendingUp, "Available balance", "יתרה זמינה", income - expenses],
        ].map(([Icon, en, he, value]) => (
          <div className="dashboard-stat" key={en}>
            <div className="dashboard-stat-label">
              <Icon size={18} />
              {t(en, he)}
            </div>
            <strong>{money(value)}</strong>
            <small>
              {t("From your household records", "לפי רישומי תקציב הבית")}
            </small>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <h2>{t("Your money over time", "הכסף שלך לאורך זמן")}</h2>
            <Link href="/budget/">
              {t("Home budget", "לתקציב הבית")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="dashboard-chart">
            <InteractiveChart
              title={t("Income and expenses", "הכנסות והוצאות")}
              bar
              data={trend}
              series={[
                {
                  key: "income",
                  label: t("Income", "הכנסות"),
                  color: "#18745d",
                },
                {
                  key: "expenses",
                  label: t("Expenses", "הוצאות"),
                  color: "#c26064",
                },
              ]}
            />
            {records.length === 0 && (
              <p className="dashboard-empty-note">
                {t(
                  "No household records yet.",
                  "עדיין אין רישומים בתקציב הבית.",
                )}
              </p>
            )}
          </div>
        </section>
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <h2>{t("Your next step", "הצעד הבא שלך")}</h2>
          </div>
          <div className="quick-workflows">
            {[
              [
                "/calculators/mortgage/",
                House,
                "Plan a mortgage",
                "תכנון משכנתא",
                "Tracks, forecasts and repayments",
                "תמהיל, תחזיות והחזרים",
              ],
              [
                "/budget/",
                Wallet,
                "Manage my budget",
                "ניהול התקציב שלי",
                "Income, expenses and balance",
                "הכנסות, הוצאות ויתרה",
              ],
              [
                "/garage/",
                Car,
                "My car costs",
                "עלויות הרכב שלי",
                "A clear picture of ownership costs",
                "תמונה ברורה של עלויות האחזקה",
              ],
            ].map(([href, Icon, en, he, subEn, subHe]) => (
              <Link className="workflow-link" key={href} href={href}>
                <span className="workflow-icon">
                  <Icon size={24} />
                </span>
                <div>
                  <strong>{t(en, he)}</strong>
                  <small>{t(subEn, subHe)}</small>
                </div>
                <ArrowUpRight size={18} />
              </Link>
            ))}
          </div>
        </section>
      </div>
      <section>
        <div className="dashboard-section-heading">
          <h2>{t("Calculators for your plans", "מחשבונים לתוכניות שלך")}</h2>
          <Link href="/calculators/">
            {t("All calculators", "כל המחשבונים")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="dashboard-tool-grid">
          {["mortgage", "loan", "savings", "car"].map((id) => {
            const tool = tools.find((item) => item.id === id);
            return (
              <Link
                className="tool-card"
                key={id}
                href={"/calculators/" + id + "/"}
              >
                <CalculatorIllustration id={id} compact />
                <span className="card-category">
                  {t(tool.category, categoryHebrew[tool.category])}
                </span>
                <h3>{t(tool.name, tool.he)}</h3>
                <p>{t(tool.description, descriptions[id])}</p>
                <div className="card-bottom">
                  {t("Open calculator", "פתיחת מחשבון")}
                  <ArrowUpRight size={17} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="dashboard-lower">
        <div>
          <h2>
            {t("Make room for informed decisions", "מקום להחלטות מושכלות")}
          </h2>
          <p>
            {t(
              "Mortgage, savings and household finance guides.",
              "מדריכים למשכנתא, לחיסכון ולכלכלת הבית.",
            )}
          </p>
        </div>
        <Link className="secondary" href="/guides/">
          <BookOpen size={17} />
          {t("Money guides", "למדריכים הפיננסיים")}
        </Link>
      </section>
    </main>
  );
}
