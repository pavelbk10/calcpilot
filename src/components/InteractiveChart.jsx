"use client";
import { useState } from "react";
import { usePrefs } from "./Shell";
import {locales} from '../lib/i18n.mjs';
const palette = [
  "#16866e",
  "#4c72b0",
  "#c49039",
  "#9b6ac0",
  "#dc6a65",
  "#42a7ad",
];
export default function InteractiveChart({
  title,
  data,
  series,
  xLabel = "",
  bar = false,
  percent = false,
  number = false,
}) {
  const { t, money, lang } = usePrefs();
  const [hidden, H] = useState([]),
    [index, I] = useState(0);
  if (!data?.length) return null;
  const selected = Math.min(index, data.length - 1),
    active = series.filter((s) => !hidden.includes(s.key));
  const vals = data.flatMap((d) => active.map((s) => Number(d[s.key]) || 0));
  const low = Math.min(0, ...vals),
    high = Math.max(1, ...vals),
    span = high - low;
  const W = 720,
    HT = 245,
    left = 65,
    right = 16,
    top = 15,
    bottom = 38,
    width = W - left - right,
    height = HT - top - bottom;
  const y = (v) => Number((top + ((high - v) / span) * height).toFixed(3));
  const x = (i) =>
    Number((left + (data.length === 1 ? width / 2 : (i / (data.length - 1)) * width)).toFixed(3));
  const fmt = (n) =>
    percent
      ? n.toFixed(1) + "%"
      : number
        ? new Intl.NumberFormat(locales[lang], { maximumFractionDigits: 6 }).format(n)
        : money(n);
  const short = (n) =>
    new Intl.NumberFormat(locales[lang], {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  const point = data[selected];
  return (
    <div className="interactive-chart">
      <div className="chart-title">
        <h3>{title}</h3>
      </div>
      <div className="chart-legend">
        {series.map((s, i) => (
          <button
            key={s.key}
            aria-pressed={!hidden.includes(s.key)}
            title={s.label}
            onClick={() =>
              H(
                hidden.includes(s.key)
                  ? hidden.filter((k) => k !== s.key)
                  : [...hidden, s.key],
              )
            }
          >
            <i style={{ background: s.color || palette[i % palette.length] }} />
            {s.label}
          </button>
        ))}
      </div>
      <svg
        className="plot"
        viewBox={`0 0 ${W} ${HT}`}
        role="img"
        aria-label={title}
        onPointerMove={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - box.left) / box.width) * W;
          I(
            Math.max(
              0,
              Math.min(
                data.length - 1,
                bar
                  ? Math.floor(((px - left) / width) * data.length)
                  : Math.round(((px - left) / width) * (data.length - 1)),
              ),
            ),
          );
        }}
        onPointerDown={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          I(
            Math.max(
              0,
              Math.min(
                data.length - 1,
                bar
                  ? Math.floor(
                      ((((e.clientX - box.left) / box.width) * W - left) /
                        width) *
                        data.length,
                    )
                  : Math.round(
                      ((((e.clientX - box.left) / box.width) * W - left) /
                        width) *
                        (data.length - 1),
                    ),
              ),
            ),
          );
        }}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const value = low + (span * i) / 4;
          return (
            <g key={i}>
              <line
                x1={left}
                x2={W - right}
                y1={y(value)}
                y2={y(value)}
                stroke="#dce6de"
                strokeDasharray="3 4"
              />
              <text
                x={left - 8}
                y={y(value) + 4}
                textAnchor="end"
                fill="#64757b"
                fontSize="10"
              >
                {short(value)}
                {percent ? "%" : ""}
              </text>
            </g>
          );
        })}
        {bar
          ? data.map((d, i) => {
              const slot = width / data.length,
                bw = Math.min(40, (slot * 0.7) / Math.max(1, active.length));
              return active.map((s, j) => {
                const val = d[s.key] || 0,
                  xx =
                    left +
                    slot * (i + 0.5) +
                    (j - (active.length - 1) / 2) * bw -
                    bw / 2;
                return (
                  <rect
                    key={i + s.key}
                    x={xx}
                    y={Math.min(y(val), y(0))}
                    width={bw - 2}
                    height={Math.max(0.8, Math.abs(y(val) - y(0)))}
                    fill={
                      s.color || palette[series.indexOf(s) % palette.length]
                    }
                    opacity={selected === i ? 1 : 0.65}
                    rx="3"
                  />
                );
              });
            })
          : active.map((s) => (
              <polyline
                key={s.key}
                points={data
                  .map((d, i) => `${x(i)},${y(d[s.key] || 0)}`)
                  .join(" ")}
                fill="none"
                stroke={s.color || palette[series.indexOf(s) % palette.length]}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            ))}
        {!bar && (
          <>
            <line
              x1={x(selected)}
              x2={x(selected)}
              y1={top}
              y2={HT - bottom}
              stroke="#64757b"
              strokeDasharray="4 4"
            />
            {active.map((s) => (
              <circle
                key={s.key}
                cx={x(selected)}
                cy={y(point[s.key] || 0)}
                r="4"
                fill={s.color || palette[series.indexOf(s) % palette.length]}
                stroke="white"
                strokeWidth="2"
              />
            ))}
          </>
        )}
        {[0, Math.floor((data.length - 1) / 2), data.length - 1]
          .filter((n, i, a) => a.indexOf(n) === i)
          .map((i) => (
            <text
              key={i}
              x={bar ? left + (width / data.length) * (i + 0.5) : x(i)}
              y={HT - 12}
              textAnchor="middle"
              fill="#64757b"
              fontSize="10"
            >
              {data[i].label}
            </text>
          ))}
      </svg>
      <input
        aria-label={title + t(' - selected point',' - נקודה נבחרת',' — выбранная точка')}
        aria-valuetext={point.label+'; '+active.map(series=>series.label+': '+fmt(point[series.key]||0)).join('; ')}
        type="range"
        min="0"
        max={data.length - 1}
        value={selected}
        onChange={(e) => I(+e.target.value)}
      />
      <div className="chart-readout" aria-live="polite">
        <b>
          {xLabel} {point.label}
        </b>
        {active.map((s) => (
          <span key={s.key}>
            <i
              style={{
                background:
                  s.color || palette[series.indexOf(s) % palette.length],
              }}
            />
            {s.label}: <strong>{fmt(point[s.key] || 0)}</strong>
          </span>
        ))}
      </div>
      <details className="chart-table">
        <summary>{t("View chart data", "הצגת נתוני הגרף")}</summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{xLabel || t("Point", "נקודה")}</th>
                {active.map((s) => (
                  <th scope="col" key={s.key}>{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i}>
                  <td>{d.label}</td>
                  {active.map((s) => (
                    <td key={s.key}>{fmt(d[s.key] || 0)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
