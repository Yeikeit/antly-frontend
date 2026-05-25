
"use client";

import React from "react";
import { useTransactions, TypeFilter } from "@/hooks/transaction/useTransactions";
import { useCategories } from "@/hooks/category/useCategories";

const MONTH_NAMES = [
	"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
	"Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Helper para parsear fechas en zona horaria local
function formatLocalDate(dateStr: string): string {
	const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
	const date = new Date(year, month - 1, day);
	return date.toLocaleDateString("es-CL", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	});
}

export default function TransactionsPage() {
	const {
		budget,
		transactions,
		totalFiltered,
		loading,
		typeFilter,
		setTypeFilter,
		categoryFilter,
		setCategoryFilter,
		page,
		setPage,
		totalPages,
		startEntry,
		endEntry,
	} = useTransactions();

	const { categories, categoryMap } = useCategories();

	if (loading) {
		return <div className="p-8 text-center text-slate-500">Cargando...</div>;
	}
	if (!budget) {
		return <div className="p-8 text-center text-slate-500">No tienes un presupuesto activo.</div>;
	}

	const currentMonth = `${MONTH_NAMES[budget.month - 1]} ${budget.year}`;

	return (
		<div className="min-h-screen bg-slate-50">
			<div className="max-w-5xl mx-auto p-6">
				{/* Header y balance */}
				<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
					<div>
						<h1 className="text-3xl font-bold mb-1 text-slate-900">Transacciones</h1>
						<p className="text-slate-500">Revisa y gestiona tu actividad financiera.</p>
					</div>
					<div className="flex items-center bg-white rounded-lg shadow px-6 py-4 gap-3 min-w-[220px] border border-slate-100">
						<div className="bg-[#0E7C8B]/10 text-[#0E7C8B] rounded-full p-2">
							<svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2H3V6Zm18 4v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8h18Zm-9 2a1 1 0 0 0-1 1v2H8a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2v-2a1 1 0 0 0-1-1Z"/></svg>
						</div>
						<div>
							<div className="text-xs text-slate-400 font-semibold uppercase">Saldo actual</div>
							<div className="text-2xl font-bold text-[#0E7C8B]">
								${(budget.totalIncomeAmount - budget.totalAllocatedAmount).toLocaleString()}
							</div>
						</div>
					</div>
				</div>

				{/* Filtros y tabs */}
				<div className="flex flex-wrap items-center gap-2 mb-6">
					{/* Mes activo (solo informativo) */}
					<span className="border border-slate-200 rounded px-3 py-2 text-sm bg-white text-slate-600 font-medium">
						{currentMonth}
					</span>

					{/* Filtro por categoría */}
					<select
						className="border border-slate-200 rounded px-3 py-2 text-sm bg-white text-slate-700"
						value={categoryFilter}
						onChange={(e) => setCategoryFilter(e.target.value)}
					>
						<option value="">Todas las categorías</option>
						{categories.map((cat) => (
							<optgroup key={cat.id} label={cat.name}>
								{cat.subcategories.map((sub) => (
									<option key={sub.id} value={sub.id}>{sub.name}</option>
								))}
							</optgroup>
						))}
					</select>

					{/* Filtro por tipo */}
					<div className="flex gap-1 ml-2">
						{(["ALL", "INCOME", "EXPENSE"] as TypeFilter[]).map((f) => (
							<button
								key={f}
								onClick={() => setTypeFilter(f)}
								className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
									typeFilter === f
										? "bg-[#0E7C8B] text-white shadow-sm"
										: "bg-slate-100 text-slate-700 hover:bg-slate-200"
								}`}
							>
								{f === "ALL" ? "Todos" : f === "INCOME" ? "Ingresos" : "Gastos"}
							</button>
						))}
					</div>
				</div>

				{/* Tabla de transacciones */}
				<section>
					<table className="w-full bg-white rounded-lg shadow overflow-hidden border border-slate-100">
						<thead>
							<tr className="bg-slate-50 text-slate-500 text-xs uppercase">
								<th className="p-3 text-left font-semibold">Transacción</th>
								<th className="p-3 text-left font-semibold">Categoría</th>
								<th className="p-3 text-left font-semibold">Fecha</th>
								<th className="p-3 text-right font-semibold">Monto</th>
							</tr>
						</thead>
						<tbody>
							{transactions.length === 0 ? (
								<tr>
									<td colSpan={4} className="p-4 text-center text-slate-400">
										No se han encontrado transacciones
									</td>
								</tr>
							) : (
								transactions.map((tx) => (
									<tr key={tx.id} className="border-b border-slate-100 last:border-b-0">
										<td className="p-3 flex items-center gap-3">
											<span className={`w-8 h-8 flex items-center justify-center rounded-full ${tx.type === "INCOME" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
												{tx.type === "INCOME" ? (
													<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21a1 1 0 0 1-1-1V7.83l-4.59 4.58a1 1 0 0 1-1.41-1.41l6.3-6.3a1 1 0 0 1 1.41 0l6.3 6.3a1 1 0 0 1-1.41 1.41L13 7.83V20a1 1 0 0 1-1 1Z"/></svg>
												) : (
													<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v12.17l4.59-4.58a1 1 0 0 1 1.41 1.41l-6.3 6.3a1 1 0 0 1-1.41 0l-6.3-6.3a1 1 0 0 1 1.41-1.41L11 16.17V4a1 1 0 0 1 1-1Z"/></svg>
												)}
											</span>
											<span className="text-slate-900">{tx.description || "Sin descripción"}</span>
										</td>
										<td className="p-3">
											<span className="inline-block px-2 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600">
												{categoryMap[tx.categoryId] ?? tx.categoryId}
											</span>
										</td>
										<td className="p-3 text-slate-600">
											{formatLocalDate(tx.transactionDate)}
										</td>
										<td className={`p-3 text-right font-bold ${tx.type === "INCOME" ? "text-emerald-600" : "text-red-600"}`}>
											{tx.type === "INCOME" ? "+" : "-"}${Math.abs(tx.amount).toLocaleString()}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>

					{/* Paginación */}
					<div className="flex items-center justify-between text-xs text-slate-500 mt-3">
						<span>
							{startEntry} a {endEntry} de {totalFiltered} 
						</span>
						<div className="flex gap-1">
							<button
								className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
								disabled={page <= 1}
								onClick={() => setPage(page - 1)}
							>
								{"<"}
							</button>
							<button
								className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
								disabled={page >= totalPages}
								onClick={() => setPage(page + 1)}
							>
								{">"}
							</button>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
