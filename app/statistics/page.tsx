"use client";

import { useState } from "react";
import Loader from "@/components/ui/Loader";
import { formatCLP } from "@/lib/utils/currency";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { useStatistics } from "@/hooks/statistics/useStatistics";
import type { AllocationSummary } from "@/lib/api/budgets";

// ── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const PALETTE = [
  "#0E7C8B", "#14B8A6", "#0284C7", "#6366F1",
  "#8B5CF6", "#EC4899", "#F59E0B", "#10B981",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return formatCLP(n);
}

// ── Custom tooltip shared ────────────────────────────────────────────────────

function CurrencyTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 text-xs">
      {label !== undefined && <p className="font-semibold text-slate-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: ${fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

// ── 1. Donut: distribución del gasto ─────────────────────────────────────────

function SpendingDonut({ allocations }: { allocations: AllocationSummary[] }) {
  const grouped = allocations
    .filter((a) => a.type !== "SAVING" && a.parentId !== null)
    .reduce<Record<string, { name: string; spent: number; allocated: number }>>((acc, a) => {
      const key = a.parentId!;
      if (!acc[key]) acc[key] = { name: a.parentName!, spent: 0, allocated: 0 };
      acc[key].spent += a.spent;
      acc[key].allocated += a.allocated;
      return acc;
    }, {});

  const data = Object.values(grouped)
    .filter((d) => d.spent > 0)
    .map((d, i) => ({ name: d.name, value: d.spent, fill: PALETTE[i % PALETTE.length] }));

  const totalSpent = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-slate-400">Sin gastos registrados</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={72}
            outerRadius={108}
            dataKey="value"
            strokeWidth={2}
            stroke="#f8fafc"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => (
              <CurrencyTooltip active={active} payload={payload as never} />
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Centro del donut */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-xs text-slate-400">Total gastado</p>
        <p className="text-lg font-extrabold text-slate-800">${fmt(totalSpent)}</p>
      </div>
      {/* Leyenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.fill }} />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 2. Bar chart horizontal: ejecución por categoría ─────────────────────────

function ExecutionBars({ allocations }: { allocations: AllocationSummary[] }) {
  const parents = allocations
    .filter((a) => a.type !== "SAVING" && a.parentId !== null)
    .reduce<Record<string, { name: string; spent: number; allocated: number }>>((acc, a) => {
      const key = a.parentId!;
      if (!acc[key]) acc[key] = { name: a.parentName!, spent: 0, allocated: 0 };
      acc[key].spent += a.spent;
      acc[key].allocated += a.allocated;
      return acc;
    }, {});

  const data = Object.values(parents).map((d) => ({
    name: d.name.length > 14 ? d.name.slice(0, 13) + "…" : d.name,
    Gastado: d.spent,
    Presupuesto: d.allocated,
    over: d.spent > d.allocated,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-slate-400">Sin datos</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 52, 160)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        barSize={14}
        barGap={4}
      >
        <CartesianGrid horizontal={false} stroke="#f1f5f9" />
        <XAxis
          type="number"
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: "#475569", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          content={({ active, payload, label }) => (
            <CurrencyTooltip active={active} payload={payload as never} label={label} />
          )}
        />
        <Bar dataKey="Presupuesto" fill="#e2e8f0" radius={[0, 6, 6, 0]} />
        <Bar dataKey="Gastado" radius={[0, 6, 6, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.over ? "#ef4444" : "#0E7C8B"} />
          ))}
          <LabelList
            dataKey="Gastado"
            position="right"
            content={({ value, index }) => {
              const item = data[index as number];
              if (!item) return null;
              const p = item.Presupuesto > 0 ? Math.round((Number(value) / item.Presupuesto) * 100) : 0;
              return (
                <text fontSize={10} fill="#94a3b8">
                  {`${p}%`}
                </text>
              );
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── 3. Card de ahorro real ────────────────────────────────────────────────────

function SavingsCard({
  totalSavingSpent,
  totalSavingAllocated,
  income,
}: {
  totalSavingSpent: number;
  totalSavingAllocated: number;
  income: number;
}) {
  // % ejecutado de la meta de ahorro (ahorrado real vs meta declarada)
  const execPct = totalSavingAllocated > 0
    ? Math.round((totalSavingSpent / totalSavingAllocated) * 100)
    : 0;

  // % del ingreso total que representa el ahorro real
  const ofIncomePct = income > 0
    ? (totalSavingSpent / income) * 100
    : 0;

  // % del ingreso que el usuario se había propuesto ahorrar (meta)
  const goalOfIncomePct = income > 0
    ? (totalSavingAllocated / income) * 100
    : 0;

  const execColor = execPct >= 100 ? "#10B981" : execPct >= 50 ? "#F59E0B" : "#ef4444";
  const execLabel = execPct >= 100 ? "Meta cumplida" : execPct >= 50 ? "En progreso" : "Por debajo";

  // Gauge: muestra ejecución vs meta (el arco lleno = meta cumplida al 100%)
  const clampedExec = Math.min(execPct, 100);
  const gaugeData = [
    { name: "Ahorrado", value: clampedExec, fill: execColor },
    { name: "Faltante", value: 100 - clampedExec, fill: "#f1f5f9" },
  ];

  const hasSavingGoal = totalSavingAllocated > 0;

  return (
    <div className="flex flex-col gap-5">
      {hasSavingGoal ? (
        <>
          {/* Gauge: ejecución vs meta */}
          <div className="flex flex-col items-center">
            <div className="relative w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="65%"
                  outerRadius="100%"
                  startAngle={210}
                  endAngle={-30}
                  data={gaugeData}
                  barSize={16}
                >
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "#f1f5f9" }}>
                    {gaugeData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </RadialBar>
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-extrabold" style={{ color: execColor }}>
                  {execPct}%
                </p>
                <p className="text-xs font-semibold" style={{ color: execColor }}>{execLabel}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1 text-center">de tu meta de ahorro mensual</p>
          </div>

          {/* Desglose en 3 datos clave */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Ahorrado</p>
              <p className="text-sm font-extrabold text-emerald-600">${fmt(totalSavingSpent)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Meta</p>
              <p className="text-sm font-extrabold text-slate-700">${fmt(totalSavingAllocated)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Del ingreso</p>
              <p className="text-sm font-extrabold text-[#0E7C8B]">{ofIncomePct.toFixed(1)}%</p>
            </div>
          </div>

          {/* Barra comparativa: meta propuesta vs ahorrado real */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Meta propuesta</span>
              <span className="font-semibold">{goalOfIncomePct.toFixed(1)}% del ingreso</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-300 transition-all"
                style={{ width: `${Math.min(goalOfIncomePct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Ahorro real</span>
              <span className="font-semibold text-emerald-600">{ofIncomePct.toFixed(1)}% del ingreso</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min(ofIncomePct, 100)}%` }}
              />
            </div>
          </div>
        </>
      ) : (
        /* Sin categorías de ahorro configuradas */
        <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
          <p className="text-3xl">🏦</p>
          <p className="text-sm font-semibold text-slate-600">Sin metas de ahorro</p>
          <p className="text-xs text-slate-400">
            Agrega categorías de tipo Ahorro en tu presupuesto para hacer seguimiento.
          </p>
        </div>
      )}
    </div>
  );
}

// ── 4. Card días restantes ────────────────────────────────────────────────────

function DaysRemainingCard({
  budgetRemaining,
  daysRemaining,
  dailySuggested,
  daysInMonth,
  daysElapsed,
}: {
  budgetRemaining: number;
  daysRemaining: number;
  dailySuggested: number;
  daysInMonth: number;
  daysElapsed: number;
}) {
  const progressPct = Math.round((daysElapsed / daysInMonth) * 100);
  const isOver = budgetRemaining < 0;

  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${isOver ? "bg-red-50 border-red-100" : "bg-gradient-to-br from-[#0E7C8B] to-[#0a6470] border-transparent"}`}>
      <div className={`flex items-start justify-between mb-4 ${isOver ? "" : ""}`}>
        <div>
          <p className={`text-xs font-semibold mb-1 ${isOver ? "text-red-400" : "text-teal-200"}`}>
            Presupuesto disponible
          </p>
          <p className={`text-3xl font-extrabold ${isOver ? "text-red-600" : "text-white"}`}>
            ${fmt(Math.abs(budgetRemaining))}
          </p>
          <p className={`text-xs mt-1 ${isOver ? "text-red-400" : "text-teal-200"}`}>
            {isOver ? "excedido" : `para ${daysRemaining} ${daysRemaining === 1 ? "día" : "días"}`}
          </p>
        </div>
        {!isOver && (
          <div className="text-right">
            <p className="text-teal-200 text-xs font-semibold mb-1">Sugerido/día</p>
            <p className="text-2xl font-extrabold text-white">${fmt(Math.round(dailySuggested))}</p>
          </div>
        )}
      </div>

      {/* Barra de días del mes */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className={isOver ? "text-red-400" : "text-teal-200"}>Día {daysElapsed}</span>
          <span className={isOver ? "text-red-400" : "text-teal-200"}>{progressPct}% del mes</span>
        </div>
        <div className={`h-2 rounded-full ${isOver ? "bg-red-200" : "bg-teal-700"}`}>
          <div
            className={`h-full rounded-full transition-all ${isOver ? "bg-red-500" : "bg-white/70"}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── 5. Subcategorías: barras individuales con colores ────────────────────────

function SubcategoryBars({ allocations }: { allocations: AllocationSummary[] }) {
  const subs = allocations
    .filter((a) => a.parentId !== null && a.type !== "SAVING")
    .map((a, i) => ({
      name: a.categoryName.length > 16 ? a.categoryName.slice(0, 15) + "…" : a.categoryName,
      Gastado: a.spent,
      Disponible: Math.max(a.allocated - a.spent, 0),
      allocated: a.allocated,
      over: a.spent > a.allocated,
      color: PALETTE[i % PALETTE.length],
    }));

  if (subs.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={Math.max(subs.length * 44, 160)}>
      <BarChart
        layout="vertical"
        data={subs}
        margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
        barSize={10}
        stackOffset="expand"
      >
        <CartesianGrid horizontal={false} stroke="#f1f5f9" />
        <XAxis
          type="number"
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          content={({ active, payload, label }) => (
            <CurrencyTooltip active={active} payload={payload as never} label={label} />
          )}
        />
        <Bar dataKey="Gastado" stackId="a" radius={[0, 0, 0, 0]}>
          {subs.map((d, i) => (
            <Cell key={i} fill={d.over ? "#ef4444" : d.color} />
          ))}
          <LabelList
            dataKey="Gastado"
            position="right"
            content={({ value, index }) => {
              const item = subs[index as number];
              if (!item) return null;
              const p = item.allocated > 0 ? Math.round((Number(value) / item.allocated) * 100) : 0;
              return (
                <text fontSize={10} fill="#64748b" fontWeight={600}>
                  {`${p}%`}
                </text>
              );
            }}
          />
        </Bar>
        <Bar dataKey="Disponible" stackId="a" fill="#f1f5f9" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function StatisticsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { selectedBudget, summary, loadingBudgets, loadingSummary, error } =
    useStatistics(month, year);

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
  const isLoading = loadingBudgets || loadingSummary;

  // ── Derived ───────────────────────────────────────────────────────────────
  const income = summary ? Number(summary.totalIncomeAmount) : 0;
  const allocated = summary ? Number(summary.totalAllocatedAmount) : 0;
  const totalSpent = summary ? Number(summary.totalSpent) : 0;
  const budgetRemaining = allocated - totalSpent;

  const expenseSubs = summary?.allocations.filter((a) => a.type !== "SAVING" && a.parentId !== null) ?? [];
  const savingSubs = summary?.allocations.filter((a) => a.type === "SAVING" && a.parentId !== null) ?? [];

  const totalSavingSpent = savingSubs.reduce((s, a) => s + a.spent, 0);
  const totalSavingAllocated = savingSubs.reduce((s, a) => s + a.allocated, 0);

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysElapsed = isCurrentMonth ? now.getDate() : daysInMonth;
  const daysRemaining = isCurrentMonth ? daysInMonth - now.getDate() + 1 : 0;
  const dailySuggested = daysRemaining > 0 ? budgetRemaining / daysRemaining : 0;

  const spentPct = allocated > 0 ? Math.round((totalSpent / allocated) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-2 py-6 md:py-8 space-y-5 md:space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Estadísticas</p>
          <h1 className="text-2xl font-bold text-slate-900">
            {MONTHS[month - 1]} {year}
          </h1>
        </div>
        <MonthYearPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-500">{error}</div>
      )}

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader />
        </div>
      )}

      {/* ── Sin presupuesto ─────────────────────────────────────────────── */}
      {!isLoading && !selectedBudget && !error && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 shadow-sm text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-slate-700 font-semibold">Sin presupuesto para este mes</p>
          <p className="text-sm text-slate-400 mt-1">
            No hay presupuesto registrado para {MONTHS[month - 1]} {year}.
          </p>
        </div>
      )}

      {/* ── Contenido ───────────────────────────────────────────────────── */}
      {!isLoading && summary && (
        <>
          {/* Métricas hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Ingresos", value: income, colorVal: "text-slate-800", colorBg: "bg-white", colorBorder: "border-slate-100", icon: "💰" },
              { label: "Presupuestado", value: allocated, colorVal: "text-[#0E7C8B]", colorBg: "bg-[#f0fafb]", colorBorder: "border-[#c7edf1]", icon: "📋" },
              { label: "Gastado", value: totalSpent, colorVal: spentPct > 100 ? "text-red-600" : "text-orange-500", colorBg: spentPct > 100 ? "bg-red-50" : "bg-orange-50", colorBorder: spentPct > 100 ? "border-red-100" : "border-orange-100", icon: spentPct > 100 ? "🚨" : "💸" },
              { label: "Disponible", value: budgetRemaining, colorVal: budgetRemaining >= 0 ? "text-emerald-600" : "text-red-600", colorBg: budgetRemaining >= 0 ? "bg-emerald-50" : "bg-red-50", colorBorder: budgetRemaining >= 0 ? "border-emerald-100" : "border-red-100", icon: budgetRemaining >= 0 ? "✅" : "❌" },
            ].map((m) => (
              <div key={m.label} className={`rounded-2xl border ${m.colorBg} ${m.colorBorder} p-4 shadow-sm`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{m.icon}</span>
                  <p className="text-xs text-slate-500">{m.label}</p>
                </div>
                <p className={`text-xl font-extrabold ${m.colorVal}`}>${fmt(m.value)}</p>
              </div>
            ))}
          </div>

          {/* Barra global de ejecución */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-bold text-slate-700">Ejecución global del presupuesto</p>
              <span className={`text-sm font-extrabold px-3 py-0.5 rounded-full ${spentPct > 100 ? "bg-red-100 text-red-600" : spentPct > 80 ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"}`}>
                {spentPct}%
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${spentPct > 100 ? "bg-red-500" : spentPct > 80 ? "bg-orange-400" : "bg-[#0E7C8B]"}`}
                style={{ width: `${Math.min(spentPct, 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              ${fmt(totalSpent)} gastados de ${fmt(allocated)} presupuestados
            </p>
          </div>

          {/* Fila: donut + tasa de ahorro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Distribución del gasto */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base font-bold text-slate-800">Distribución del gasto</span>
              </div>
              <SpendingDonut allocations={summary.allocations} />
            </div>

            {/* Ahorro real */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-base font-bold text-slate-800 mb-1">Ahorro del mes</p>
              <p className="text-xs text-slate-400 mb-4">
                Progreso real vs meta declarada en tu presupuesto
              </p>
              <SavingsCard
                totalSavingSpent={totalSavingSpent}
                totalSavingAllocated={totalSavingAllocated}
                income={income}
              />
            </div>
          </div>

          {/* Card días restantes — solo mes actual */}
          {isCurrentMonth && (
            <DaysRemainingCard
              budgetRemaining={budgetRemaining}
              daysRemaining={daysRemaining}
              dailySuggested={dailySuggested}
              daysInMonth={daysInMonth}
              daysElapsed={daysElapsed}
            />
          )}

          {/* Ejecución por categoría padre */}
          {expenseSubs.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-base font-bold text-slate-800 mb-1">Gasto vs presupuesto por categoría</p>
              <p className="text-xs text-slate-400 mb-5">Gris = presupuestado · Color = gastado · Rojo = excedido</p>
              <ExecutionBars allocations={summary.allocations} />
            </div>
          )}

          {/* Barras de subcategorías */}
          {expenseSubs.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-base font-bold text-slate-800 mb-1">Ejecución por subcategoría</p>
              <SubcategoryBars allocations={summary.allocations} />
            </div>
          )}

          {/* Ahorros */}
          {savingSubs.length > 0 && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-base font-bold text-slate-800">Ahorros del mes</p>
                  <p className="text-xs text-slate-500 mt-0.5">Progreso hacia tus metas de ahorro</p>
                </div>
                <span className="text-xl font-extrabold text-emerald-600">${fmt(totalSavingSpent)}</span>
              </div>
              <div className="space-y-4">
                {savingSubs.map((sub) => {
                  const p = sub.allocated > 0 ? Math.min(Math.round((sub.spent / sub.allocated) * 100), 100) : 0;
                  return (
                    <div key={sub.categoryId}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-slate-700">{sub.categoryName}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-emerald-600">${fmt(sub.spent)}</span>
                          <span className="text-xs text-slate-400"> / ${fmt(sub.allocated)}</span>
                        </div>
                      </div>
                      <div className="h-3 bg-white/70 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${p}%` }}
                        />
                      </div>
                      <p className="text-xs text-emerald-600 mt-0.5 font-medium">{p}% de la meta</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty: sin transacciones */}
          {expenseSubs.length === 0 && savingSubs.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-slate-500 text-sm">No hay transacciones registradas para este mes.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
