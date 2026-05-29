
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTransactions, TypeFilter, SortOrder } from "@/hooks/transaction/useTransactions";
import { useCategories } from "@/hooks/category/useCategories";
import { getIncomeSources, type IncomeSource } from "@/lib/api/incomes";
import Loader from "@/components/ui/Loader";
import { formatCLP } from "@/lib/utils/currency";

const MONTH_NAMES = [
	"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
	"Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Helper para mostrar fecha (día/mes/año) desde transactionDate (YYYY-MM-DD)
function formatLocalDate(dateStr: string): string {
	const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
	const date = new Date(year, month - 1, day);
	return date.toLocaleDateString("es-CL", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	});
}

// Helper para mostrar la hora desde createdAt — solo se llama en el cliente
function formatTime(isoStr: string): string {
	const normalized = /[Z+\-]\d*$/.test(isoStr) ? isoStr : isoStr + "Z";
	const date = new Date(normalized);
	date.setHours(date.getHours() - 4); // Ajuste UTC-4 (Chile)
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function TransactionsPage() {
	const {
		budget,
		transactions,
		totalFiltered,
		loading,
		typeFilter,
		setTypeFilter,
		categoryIds,
		setCategoryIds,
		sortOrder,
		setSortOrder,
		page,
		setPage,
		totalPages,
		startEntry,
		endEntry,
	} = useTransactions();

	const { categories, categoryMap } = useCategories();
	const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
	const [parentCategory, setParentCategory] = useState<string>("");
	const [subCategory, setSubCategory] = useState<string>("");
	const [mounted, setMounted] = useState(false);

	// Marcar como montado para que la hora se formatee en el cliente
	useEffect(() => { setMounted(true); }, []);

	// Cargar fuentes de ingreso
	useEffect(() => {
		getIncomeSources().then((sources) => {
			setIncomeSources(sources.filter(s => s.isActive));
		}).catch(console.error);
	}, []);

	// Limpiar filtros locales cuando cambia el tipo
	useEffect(() => {
		setParentCategory("");
		setSubCategory("");
		setCategoryIds([]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [typeFilter]);

	// Subcategorías del padre seleccionado
	const subcategoriesOfParent = React.useMemo(() => {
		if (!parentCategory) return [];
		return categories.find(cat => cat.id === parentCategory)?.subcategories || [];
	}, [parentCategory, categories]);

	// Cuando cambia la categoría padre (modo EXPENSE), filtrar por todas sus subcategorías
	function handleParentCategoryChange(parentId: string) {
		setParentCategory(parentId);
		setSubCategory("");
		if (!parentId) {
			setCategoryIds([]);
			return;
		}
		const parent = categories.find(cat => cat.id === parentId);
		if (parent) {
			// Filtrar por todas las subcategorías del padre
			setCategoryIds(parent.subcategories.map(sub => sub.id));
		}
	}

	// Cuando cambia la subcategoría (modo EXPENSE), filtrar solo por esa
	function handleSubCategoryChange(subId: string) {
		setSubCategory(subId);
		if (!subId) {
			// Volver a filtrar por todas las subcategorías del padre
			const parent = categories.find(cat => cat.id === parentCategory);
			setCategoryIds(parent ? parent.subcategories.map(sub => sub.id) : []);
		} else {
			setCategoryIds([subId]);
		}
	}

	// Cuando cambia en modo ALL (puede ser fuente de ingreso o categoría padre de gasto)
	function handleAllFilterChange(value: string) {
		setParentCategory(value);
		setSubCategory("");
		if (!value) {
			setCategoryIds([]);
			return;
		}
		const isExpenseCategory = categories.some(cat => cat.id === value);
		if (isExpenseCategory) {
			const parent = categories.find(cat => cat.id === value);
			setCategoryIds(parent ? parent.subcategories.map(sub => sub.id) : []);
		} else {
			// Es fuente de ingreso
			setCategoryIds([value]);
		}
	}


	if (loading) {
		return <Loader />;
	}
	if (!budget) {
		return <div className="p-8 text-center text-slate-500">No tienes un presupuesto activo.</div>;
	}

	const currentMonth = `${MONTH_NAMES[budget.month - 1]} ${budget.year}`;

	return (
		<div className="min-h-screen bg-slate-50">
			<div className="max-w-5xl mx-auto p-6">
				{/* Header y balance */}
				<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
					<div>
						<h1 className="text-3xl font-bold mb-1 text-slate-900">Transacciones</h1>
						<p className="text-slate-500">Revisa y gestiona tu actividad financiera.</p>
					</div>
					<Link
						href="/transactions/new"
						className="inline-flex items-center gap-2 bg-[#0E7C8B] hover:bg-[#0a6470] text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition-colors"
					>
						<svg width="20" height="20" fill="none" viewBox="0 0 24 24">
							<path fill="currentColor" d="M12 4a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5a1 1 0 0 1 1-1Z"/>
						</svg>
						Nueva transacción
					</Link>
				</div>

				{/* Resumen de totales */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="bg-emerald-50 text-emerald-600 rounded-full p-2">
								<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21a1 1 0 0 1-1-1V7.83l-4.59 4.58a1 1 0 0 1-1.41-1.41l6.3-6.3a1 1 0 0 1 1.41 0l6.3 6.3a1 1 0 0 1-1.41 1.41L13 7.83V20a1 1 0 0 1-1 1Z"/></svg>
							</div>
							<div>
								<div className="text-xs text-slate-500 font-medium">Ingresos totales</div>
								<div className="text-xl font-bold text-emerald-600">
									${formatCLP(budget.totalIncomeAmount)}
								</div>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="bg-red-50 text-red-600 rounded-full p-2">
								<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v12.17l4.59-4.58a1 1 0 0 1 1.41 1.41l-6.3 6.3a1 1 0 0 1-1.41 0l-6.3-6.3a1 1 0 0 1 1.41-1.41L11 16.17V4a1 1 0 0 1 1-1Z"/></svg>
							</div>
							<div>
								<div className="text-xs text-slate-500 font-medium">Presupuesto asignado</div>
								<div className="text-xl font-bold text-red-600">
									${formatCLP(budget.totalAllocatedAmount)}
								</div>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="bg-[#0E7C8B]/10 text-[#0E7C8B] rounded-full p-2">
								<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2H3V6Zm18 4v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8h18Zm-9 2a1 1 0 0 0-1 1v2H8a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2v-2a1 1 0 0 0-1-1Z"/></svg>
							</div>
							<div>
								<div className="text-xs text-slate-500 font-medium">Sin asignar</div>
								<div className="text-xl font-bold text-[#0E7C8B]">
									${formatCLP(budget.totalIncomeAmount - budget.totalAllocatedAmount)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Filtros y tabs */}
				<div className="flex flex-wrap items-center gap-3 mb-6">
					{/* Mes activo */}
					<div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-600 font-medium">
						<svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-slate-400">
							<path fill="currentColor" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9Z"/>
						</svg>
						{currentMonth}
					</div>

					{/* Filtro jerárquico por categoría/fuente */}
					{typeFilter === "EXPENSE" && (
						<>
							{/* Paso 1: Categoría padre */}
							<select
								className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
								value={parentCategory}
							onChange={(e) => handleParentCategoryChange(e.target.value)}
						>
							<option value="">Todas las categorías</option>
							{categories.filter(cat => cat.type === "EXPENSE").map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</select>

						{/* Paso 2: Subcategoría (se habilita al seleccionar padre) */}
						<select
							className={`border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 transition-opacity ${
								!parentCategory ? "opacity-50 cursor-not-allowed" : ""
							}`}
							value={subCategory}
							onChange={(e) => handleSubCategoryChange(e.target.value)}
							disabled={!parentCategory}
						>
							<option value="">Todas las subcategorías</option>
							{subcategoriesOfParent.map((sub) => (
								<option key={sub.id} value={sub.id}>
									{sub.name}
								</option>
							))}
						</select>
					</>
				)}

				{typeFilter === "INCOME" && (
					<select
						className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
						value={parentCategory}
						onChange={(e) => {
							setParentCategory(e.target.value);
							setCategoryIds(e.target.value ? [e.target.value] : []);
						}}
					>
						<option value="">Todas las fuentes</option>
						{incomeSources.map((source) => (
							<option key={source.id} value={source.id}>
								{source.name}
							</option>
						))}
					</select>
				)}

				{typeFilter === "ALL" && (
					<>
						{/* Paso 1: Tipo de filtro */}
						<select
							className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
							value={parentCategory}
							onChange={(e) => handleAllFilterChange(e.target.value)}
						>
							<option value="">Sin filtro específico</option>
							<optgroup label="💰 Fuentes de ingreso">
								{incomeSources.map((source) => (
									<option key={source.id} value={source.id}>
										{source.name}
									</option>
								))}
							</optgroup>
							<optgroup label="💸 Categorías de gasto">
								{categories.filter(cat => cat.type === "EXPENSE").map((cat) => (
									<option key={cat.id} value={cat.id}>
										{cat.name}
									</option>
								))}
							</optgroup>
						</select>

						{/* Paso 2: Subcategoría si es categoría de gasto */}
						{parentCategory && categories.some(cat => cat.id === parentCategory) && (
							<select
								className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
								value={subCategory}
								onChange={(e) => handleSubCategoryChange(e.target.value)}
						>
							<option value="">Todas las subcategorías</option>
							{subcategoriesOfParent.map((sub) => (
								<option key={sub.id} value={sub.id}>
									{sub.name}
								</option>
							))}
						</select>
					)}
						</>
					)}

					{/* Filtro por tipo */}
					<div className="flex gap-1 ml-auto">
						{(["ALL", "INCOME", "EXPENSE"] as TypeFilter[]).map((f) => (
							<button
								key={f}
								onClick={() => setTypeFilter(f)}
								className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
									typeFilter === f
										? "bg-[#0E7C8B] text-white shadow-sm"
										: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
								}`}
							>
								{f === "ALL" ? "Todos" : f === "INCOME" ? "Ingresos" : "Gastos"}
							</button>
						))}
					</div>
				</div>

				{/* Tabla de transacciones */}
				<section>
					<table className="w-full bg-white rounded-xl shadow overflow-hidden border border-slate-100">
						<thead>
							<tr className="bg-slate-50 text-slate-500 text-xs uppercase">
								<th className="p-4 text-left font-semibold">Descripción</th>
								<th className="p-4 text-left font-semibold">Categoría / Fuente</th>
							<th className="p-4 text-left font-semibold">
								<button
									onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
									className="inline-flex items-center gap-1 hover:text-[#0E7C8B] transition-colors"
									title={sortOrder === "desc" ? "Más recientes primero" : "Más antiguos primero"}
								>
									Fecha
									{sortOrder === "desc" ? (
										<svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v12.17l4.59-4.58a1 1 0 0 1 1.41 1.41l-6.3 6.3a1 1 0 0 1-1.41 0l-6.3-6.3a1 1 0 0 1 1.41-1.41L11 16.17V4a1 1 0 0 1 1-1Z"/></svg>
									) : (
										<svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21a1 1 0 0 1-1-1V7.83l-4.59 4.58a1 1 0 0 1-1.41-1.41l6.3-6.3a1 1 0 0 1 1.41 0l6.3 6.3a1 1 0 0 1-1.41 1.41L13 7.83V20a1 1 0 0 1-1 1Z"/></svg>
									)}
								</button>
							</th>
								<th className="p-4 text-right font-semibold">Monto</th>
								<th className="p-4 text-right font-semibold">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{transactions.length === 0 ? (
								<tr>
									<td colSpan={5} className="p-8 text-center">
										<div className="flex flex-col items-center gap-3">
											<div className="text-slate-300">
												<svg width="48" height="48" fill="none" viewBox="0 0 24 24">
													<path fill="currentColor" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm3-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6Z"/>
												</svg>
											</div>
											<p className="text-slate-400">No hay transacciones que coincidan con los filtros</p>
											<Link
												href="/transactions/new"
												className="text-sm text-[#0E7C8B] hover:underline font-medium"
											>
												Agregar tu primera transacción
											</Link>
										</div>
									</td>
								</tr>
							) : (
								transactions.map((tx) => (
									<tr key={tx.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
										<td className="p-4">
											<div className="flex items-center gap-3">
												<span className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ${tx.type === "INCOME" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
													{tx.type === "INCOME" ? (
														<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21a1 1 0 0 1-1-1V7.83l-4.59 4.58a1 1 0 0 1-1.41-1.41l6.3-6.3a1 1 0 0 1 1.41 0l6.3 6.3a1 1 0 0 1-1.41 1.41L13 7.83V20a1 1 0 0 1-1 1Z"/></svg>
													) : (
														<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v12.17l4.59-4.58a1 1 0 0 1 1.41 1.41l-6.3 6.3a1 1 0 0 1-1.41 0l-6.3-6.3a1 1 0 0 1 1.41-1.41L11 16.17V4a1 1 0 0 1 1-1Z"/></svg>
													)}
												</span>
												<span className="text-slate-900 font-medium">{tx.description || "Sin descripción"}</span>
											</div>
										</td>
										<td className="p-4">
											<span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${
												tx.type === "INCOME" 
													? "bg-emerald-50 text-emerald-700"
													: "bg-slate-100 text-slate-700"
											}`}>
												{tx.type === "INCOME"
													? tx.incomeSource?.name ?? "Fuente de ingreso"
													: categoryMap[tx.categoryId] ?? tx.categoryId}
											</span>
										</td>
										<td className="p-4 text-slate-600 text-sm">
											<div className="font-medium">{formatLocalDate(tx.transactionDate)}</div>
											<div className="text-xs text-slate-400" suppressHydrationWarning>
												{mounted ? formatTime(tx.createdAt) : ""}
											</div>
										</td>
										<td className={`p-4 text-right font-bold text-lg ${
											tx.type === "INCOME" ? "text-emerald-600" : "text-red-600"
										}`}>
													{tx.type === "INCOME" ? "+" : "-"}${formatCLP(Math.abs(tx.amount))}
										</td>
										<td className="p-4 text-right">
											<div className="flex items-center justify-end gap-2">
												<button
													className="p-2 text-slate-400 hover:text-[#0E7C8B] hover:bg-[#0E7C8B]/10 rounded-lg transition-colors"
													title="Editar"
												>
													<svg width="18" height="18" fill="none" viewBox="0 0 24 24">
														<path fill="currentColor" d="M16.862 3.487a2.5 2.5 0 0 1 3.536 0l.115.115a2.5 2.5 0 0 1 0 3.536L9.06 18.591a1 1 0 0 1-.465.263l-5.5 1.375a1 1 0 0 1-1.213-1.212l1.374-5.5a1 1 0 0 1 .263-.465L16.862 3.487Z"/>
													</svg>
												</button>
												<button
													className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
													title="Eliminar"
												>
													<svg width="18" height="18" fill="none" viewBox="0 0 24 24">
														<path fill="currentColor" d="M10 2a2 2 0 0 0-2 2H4a1 1 0 0 0 0 2h1v13a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V6h1a1 1 0 1 0 0-2h-4a2 2 0 0 0-2-2h-4ZM9 6h6v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V6h2Zm1 3a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"/>
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>

					{/* Paginación */}
					<div className="flex items-center justify-between text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100">
						<span className="font-medium">
							Mostrando <span className="text-slate-900">{startEntry}</span> a <span className="text-slate-900">{endEntry}</span> de <span className="text-slate-900 font-semibold">{totalFiltered}</span> transacciones
						</span>
						<div className="flex items-center gap-2">
							<button
								className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors font-medium"
								disabled={page <= 1}
								onClick={() => setPage(page - 1)}
							>
								Anterior
							</button>
							<span className="px-3 py-2 text-sm">
								Página <span className="font-semibold text-slate-900">{page}</span> de <span className="font-semibold text-slate-900">{totalPages}</span>
							</span>
							<button
								className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors font-medium"
								disabled={page >= totalPages}
								onClick={() => setPage(page + 1)}
							>
								Siguiente
							</button>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
