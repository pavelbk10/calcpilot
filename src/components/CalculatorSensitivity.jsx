"use client";
import InteractiveChart from "./InteractiveChart";
import { usePrefs } from "./Shell";
import {locales} from '../lib/i18n.mjs';
import { payment, affordability, savings, carCost } from "../lib/finance.mjs";

export default function CalculatorSensitivity({ id, v }) {
  const { t,lang } = usePrefs();
  let title = "",
    xLabel = "",
    data = [],
    series = [],
    percent = false;
  if (["loan", "car-loan", "mortgage", "refinance"].includes(id)) {
    title = t(
      "Monthly payment by interest rate",
      "החזר חודשי לפי שיעור הריבית",
    );
    xLabel = t("Annual interest", "ריבית שנתית");
    const amount = id === "car-loan" ? v.price - v.down : v.amount;
    data = Array.from({ length: 41 }, (_, index) => ({
      label: (index * 0.25).toFixed(2) + "%",
      current: payment(amount, index * 0.25, v.years),
      ...(id === "refinance"
        ? { next: payment(amount, index * 0.25, v.newYears) }
        : {}),
    }));
    series = [
      { key: "current", label: t("Selected term", "התקופה שנבחרה") },
      ...(id === "refinance"
        ? [{ key: "next", label: t("New term", "התקופה החדשה") }]
        : []),
    ];
  } else if (["affordability", "supplement"].includes(id)) {
    title = t(
      "Property budget by repayment ratio",
      "תקציב נכס לפי שיעור ההחזר",
    );
    xLabel = t("Income repayment ratio", "שיעור ההחזר מההכנסה");
    data = Array.from({ length: 56 }, (_, index) => {
      const ratio = index + 5;
      const result = affordability({
        ...v,
        ratio,
        extra: id === "supplement" ? v.extra : 0,
      });
      return {
        label: ratio + "%",
        property: result.property,
        mortgage: result.mortgage,
      };
    });
    series = [
      { key: "property", label: t("Property budget", "תקציב נכס") },
      { key: "mortgage", label: t("Mortgage", "משכנתא") },
    ];
  } else if (id === "dti") {
    title = t(
      "Debt ratio by monthly income",
      "יחס התחייבויות לפי הכנסה חודשית",
    );
    xLabel = t("Monthly income", "הכנסה חודשית");
    percent = true;
    data = Array.from({ length: 21 }, (_, index) => {
      const income = Math.max(1, v.income * (0.5 + index * 0.05));
      return {
        label: Math.round(income).toLocaleString(locales[lang]),
        ratio: (v.debts / income) * 100,
      };
    });
    series = [
      {
        key: "ratio",
        label: t("Debt-to-income ratio", "יחס התחייבויות להכנסה"),
      },
    ];
  } else if (["savings", "goal"].includes(id)) {
    title = t(
      "Savings sensitivity to annual return",
      "רגישות החיסכון לתשואה שנתית",
    );
    xLabel = t("Annual return", "תשואה שנתית");
    data = Array.from({ length: 41 }, (_, index) => {
      const rate = index * 0.25;
      return {
        label: rate.toFixed(2) + "%",
        value:
          id === "goal"
            ? Math.max(
                0,
                (v.target - savings(v.initial, 0, rate, v.years)) /
                  savings(0, 1, rate, v.years),
              )
            : savings(v.initial, v.monthly, rate, v.years),
      };
    });
    series = [
      {
        key: "value",
        label:
          id === "goal"
            ? t("Monthly deposit needed", "הפקדה חודשית נדרשת")
            : t("Final balance", "יתרה בסוף התקופה"),
      },
    ];
  } else if (id === "emergency") {
    title = t(
      "Savings gap by essential expenses",
      "פער החיסכון לפי הוצאות חיוניות",
    );
    xLabel = t("Monthly essential expenses", "הוצאות חיוניות בחודש");
    data = Array.from({ length: 21 }, (_, index) => {
      const expenses = v.expenses * (0.5 + index * 0.05);
      return {
        label: Math.round(expenses).toLocaleString(locales[lang]),
        target: expenses * v.months,
        gap: Math.max(0, expenses * v.months - v.initial),
      };
    });
    series = [
      { key: "target", label: t("Required fund", "קרן נדרשת") },
      { key: "gap", label: t("Still to save", "יתרה לחיסכון") },
    ];
  } else if (["car", "fuel"].includes(id)) {
    title = t("Annual costs by driving distance", "עלות שנתית לפי נסועה");
    xLabel = t("Annual kilometers", "קילומטרים בשנה");
    data = Array.from({ length: 21 }, (_, index) => {
      const km = Math.max(1, v.km * (0.5 + index * 0.05));
      const result = carCost({ ...v, km, fees: v.carFees, years: v.ownership });
      return {
        label: Math.round(km).toLocaleString(locales[lang]),
        energy: result.energy,
        ...(id === "car" ? { total: result.annual } : {}),
      };
    });
    series = [
      { key: "energy", label: t("Fuel / charging", "דלק או טעינה") },
      ...(id === "car"
        ? [
            {
              key: "total",
              label: t("Total ownership cost", "עלות אחזקה כוללת"),
            },
          ]
        : []),
    ];
  }
  return (
    <InteractiveChart
      title={title}
      data={data}
      series={series}
      xLabel={xLabel}
      percent={percent}
    />
  );
}
