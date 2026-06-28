
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTransactions, TypeFilter, SortOrder, type TransactionRow, type UpdatePayload } from "@/hooks/transaction/useTransactions";
import { useCategories } from "@/hooks/category/useCategories";
import { getBudgetSummary } from "@/lib/api/budgets";
import { getIncomeSources, type IncomeSource } from "@/lib/api/incomes";
import Loader from "@/components/ui/Loader";
import { EditTransactionModal } from "@/components/transaction/EditTransactionModal";
import { formatCLP } from "@/lib/utils/currency";
import { DeleteConfirmModal } from "@/components/transaction/DeleteConfirmModal";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { exportToCSV, exportToExcel } from "@/lib/utils/exportTransactions";

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

function formatTime(isoStr: string): string {
	return new Date(isoStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function TransactionsPage() {
	const {
		budget,
		transactions,
		allTransactions,
		totalFiltered,
		loading,
		typeFilter,
		setTypeFilter,
		categoryIds,
		setCategoryIds,
		searchQuery,
		setSearchQuery,
		sortOrder,
		setSortOrder,
		page,
		setPage,
		totalPages,
		startEntry,
		endEntry,
		deleteRow,
		updateRow,
	} = useTransactions();

	const { categories: allCategories, categoryMap } = useCategories();
	const [allocatedCatIds, setAllocatedCatIds] = useState<Set<string>>(new Set());
	const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
	const [parentCategory, setParentCategory] = useState<string>("");
	const [subCategory, setSubCategory] = useState<string>("");
	const [mounted, setMounted] = useState(false);
	const [editTx, setEditTx] = useState<TransactionRow | null>(null);
	const [deleteTx, setDeleteTx] = useState<TransactionRow | null>(null);
	const [showExportMenu, setShowExportMenu] = useState(false);

	const exportFilename = `transacciones-${budget?.year ?? ""}-${String(budget?.month ?? "").padStart(2, "0")}`;

	function handleExportCSV() {
		exportToCSV(allTransactions, categoryMap, exportFilename);
		setShowExportMenu(false);
	}

	function handleExportExcel() {
		exportToExcel(allTransactions, categoryMap, exportFilename);
		setShowExportMenu(false);
	}

	useEffect(() => { setMounted(true); }, []);

	useEffect(() => {
		getIncomeSources().then((sources) => {
			setIncomeSources(sources.filter(s => s.isActive));
		}).catch(console.error);
	}, []);

	useEffect(() => {
		if (!budget) return;
		getBudgetSummary(budget.id)
			.then((summary) => setAllocatedCatIds(new Set(summary.allocations.map(a => a.categoryId))))
			.catch(console.error);
	}, [budget]);

	// Solo categorías con allocations en el presupuesto activo
	const categories = React.useMemo(() =>
		allCategories
			.map(cat => ({ ...cat, subcategories: cat.subcategories.filter(sub => allocatedCatIds.has(sub.id)) }))
			.filter(cat => cat.subcategories.length > 0),
		[allCategories, allocatedCatIds]
	);

	// Total gastado: suma de todos los gastos del presupuesto activo
	const totalSpent = React.useMemo(
		() => allTransactions
			.filter((tx) => tx.type === "EXPENSE")
			.reduce((acc, tx) => acc + Number(tx.amount), 0),
		[allTransactions]
	);

	const totalSaved = React.useMemo(
		() => allTransactions
			.filter((tx) => tx.type === "SAVING")
			.reduce((acc, tx) => acc + Number(tx.amount), 0),
		[allTransactions]
	);

	useEffect(() => {
		setParentCategory("");
		setSubCategory("");
		setCategoryIds([]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [typeFilter]);

	const subcategoriesOfParent = React.useMemo(() => {
		if (!parentCategory) return [];
		return categories.find(cat => cat.id === parentCategory)?.subcategories || [];
	}, [parentCategory, categories]);

	function handleParentCategoryChange(parentId: string) {
		setParentCategory(parentId);
		setSubCategory("");
		if (!parentId) {
			setCategoryIds([]);
			return;
		}
		const parent = categories.find(cat => cat.id === parentId);
		if (parent) {
			setCategoryIds(parent.subcategories.map(sub => sub.id));
		}
	}

	function handleSubCategoryChange(subId: string) {
		setSubCategory(subId);
		if (!subId) {
			const parent = categories.find(cat => cat.id === parentCategory);
			setCategoryIds(parent ? parent.subcategories.map(sub => sub.id) : []);
		} else {
			setCategoryIds([subId]);
		}
	}

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
		<>
			<div className="min-h-screen bg-slate-50">
				<div className="max-w-5xl mx-auto p-4 md:p-6">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 gap-3">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold mb-0.5 text-slate-900">Transacciones</h1>
							<p className="text-sm text-slate-500">Revisa y gestiona tu actividad financiera.</p>
						</div>
						<div className="flex gap-2 w-full md:w-auto">
							<div className="relative">
								<button
									onClick={() => setShowExportMenu((v) => !v)}
									className="inline-flex items-center gap-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
								>
									<svg width="16" height="16" fill="none" viewBox="0 0 24 24">
										<path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v9.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L11 13.586V4a1 1 0 0 1 1-1ZM4 19a1 1 0 1 0 0 2h16a1 1 0 1 0 0-2H4Z" />
									</svg>
									Exportar
								</button>
								{showExportMenu && (
									<div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
										<button onClick={handleExportCSV} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
											Descargar CSV
										</button>
										<button onClick={handleExportExcel} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100">
											Descargar Excel
										</button>
									</div>
								)}
							</div>
							<Link
								href="/transactions/new"
								className="inline-flex items-center justify-center gap-2 bg-[#0E7C8B] hover:bg-[#0a6470] text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors w-full md:w-auto"
							>
								<svg width="18" height="18" fill="none" viewBox="0 0 24 24">
									<path fill="currentColor" d="M12 4a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5a1 1 0 0 1 1-1Z" />
								</svg>
								Nueva transacción
							</Link>
						</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
						<div className="bg-white rounded-xl border border-slate-100 p-3 md:p-4 shadow-sm">
							<div className="flex flex-col md:flex-row md:items-center gap-2">
								<div className="hidden md:flex bg-emerald-50 text-emerald-600 rounded-full p-2">
									<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21a1 1 0 0 1-1-1V7.83l-4.59 4.58a1 1 0 0 1-1.41-1.41l6.3-6.3a1 1 0 0 1 1.41 0l6.3 6.3a1 1 0 0 1-1.41 1.41L13 7.83V20a1 1 0 0 1-1 1Z" /></svg>
								</div>
								<div>
									<div className="text-xs text-slate-500 font-medium">Ingresos</div>
									<div className="text-base md:text-xl font-bold text-emerald-600">
										${formatCLP(budget.totalIncomeAmount)}
									</div>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl border border-slate-100 p-3 md:p-4 shadow-sm">
							<div className="flex flex-col md:flex-row md:items-center gap-2">
								<div className="hidden md:flex bg-red-50 text-red-600 rounded-full p-2">
									<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v12.17l4.59-4.58a1 1 0 0 1 1.41 1.41l-6.3 6.3a1 1 0 0 1-1.41 0l-6.3-6.3a1 1 0 0 1 1.41-1.41L11 16.17V4a1 1 0 0 1 1-1Z" /></svg>
								</div>
								<div>
									<div className="text-xs text-slate-500 font-medium">Gastado</div>
									<div className="text-base md:text-xl font-bold text-red-600">
										${formatCLP(totalSpent)}
									</div>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl border border-slate-100 p-3 md:p-4 shadow-sm">
							<div className="flex flex-col md:flex-row md:items-center gap-2">
								<div className="hidden md:flex bg-sky-50 text-sky-500 rounded-full p-2">
									<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v1H2V9Zm0 3v6a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6H2Zm9 2h2a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2Z"/></svg>
								</div>
								<div>
									<div className="text-xs text-slate-500 font-medium">Ahorrado</div>
									<div className="text-base md:text-xl font-bold text-sky-500">
										${formatCLP(totalSaved)}
									</div>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl border border-slate-100 p-3 md:p-4 shadow-sm">
							<div className="flex flex-col md:flex-row md:items-center gap-2">
								<div className="hidden md:flex bg-violet-50 text-violet-500 rounded-full p-2">
									<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Zm1 14.93V18a1 1 0 1 1-2 0v-1.07A8.001 8.001 0 0 1 4.07 11H5a1 1 0 0 1 0 2 6 6 0 0 0 6 6v-1.07A4.002 4.002 0 0 1 8 14a1 1 0 1 1 2 0 2 2 0 0 0 4 0 1 1 0 1 1 2 0 4.002 4.002 0 0 1-3 3.93ZM12 4a8 8 0 0 1 7.93 7H19a1 1 0 0 1 0-2 6 6 0 0 0-6-6V7a1 1 0 1 1-2 0v-.07A8.001 8.001 0 0 1 4.07 11H5a1 1 0 0 1 0-2A6 6 0 0 0 11 3.07V5a1 1 0 1 1 2 0V3.07A8.03 8.03 0 0 1 12 4Z"/></svg>
								</div>
								<div>
									<div className="text-xs text-slate-500 font-medium">Restante</div>
									<div className="text-base md:text-xl font-bold text-violet-500">
										${formatCLP(budget.totalIncomeAmount - totalSpent - totalSaved)}
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2 mb-5">
						<div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-600 font-medium">
							<svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-slate-400">
								<path fill="currentColor" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9Z" />
							</svg>
							<span className="text-xs md:text-sm">{currentMonth}</span>
						</div>

						{(typeFilter === "EXPENSE" || typeFilter === "SAVING") && (
							<>
								<div className="w-48">
									<CustomSelect
										options={[
											{ id: "", label: "Todas las categorías" },
											...categories
												.filter(cat => cat.type === typeFilter)
												.map(cat => ({ id: cat.id, label: cat.name }))
												.sort((a, b) => a.label.localeCompare(b.label, "es")),
										]}
										value={parentCategory}
										onChange={(id) => handleParentCategoryChange(id)}
										placeholder="Todas las categorías"
										searchable
									/>
								</div>
								<div className="w-48">
									<CustomSelect
										options={[
											{ id: "", label: "Subcategoría" },
											...subcategoriesOfParent
												.map(sub => ({ id: sub.id, label: sub.name }))
												.sort((a, b) => a.label.localeCompare(b.label, "es")),
										]}
										value={subCategory}
										onChange={(id) => handleSubCategoryChange(id)}
										placeholder={!parentCategory ? "Elige categoría primero" : "Subcategoría"}
										disabled={!parentCategory}
										searchable
									/>
								</div>
							</>
						)}

						{typeFilter === "INCOME" && (
							<div className="w-48">
								<CustomSelect
									options={[
										{ id: "", label: "Todas las fuentes" },
										...incomeSources
											.map(s => ({ id: s.id, label: s.name }))
											.sort((a, b) => a.label.localeCompare(b.label, "es")),
									]}
									value={parentCategory}
									onChange={(id) => {
										setParentCategory(id);
										setCategoryIds(id ? [id] : []);
									}}
									placeholder="Fuente de ingreso"
									searchable
								/>
							</div>
						)}

						{typeFilter === "ALL" && (
							<>
								<div className="w-52">
									<CustomSelect
										options={[
											{ id: "", label: "Categoría" },
											...incomeSources.map(s => ({ id: s.id, label: s.name })),
											...categories
												.filter(cat => cat.type === "EXPENSE")
												.map(cat => ({ id: cat.id, label: cat.name }))
												.sort((a, b) => a.label.localeCompare(b.label, "es")),
											...categories
												.filter(cat => cat.type === "SAVING")
												.map(cat => ({ id: cat.id, label: cat.name }))
												.sort((a, b) => a.label.localeCompare(b.label, "es")),
										]}
										value={parentCategory}
										onChange={(id) => handleAllFilterChange(id)}
										placeholder="Categoría"
										searchable
									/>
								</div>
								{parentCategory && categories.some(cat => cat.id === parentCategory) && (
									<div className="w-48">
										<CustomSelect
											options={[
												{ id: "", label: "Subcategoría" },
												...subcategoriesOfParent
													.map(sub => ({ id: sub.id, label: sub.name }))
													.sort((a, b) => a.label.localeCompare(b.label, "es")),
											]}
											value={subCategory}
											onChange={(id) => handleSubCategoryChange(id)}
											placeholder="Subcategoría"
											searchable
										/>
									</div>
								)}
							</>
						)}

						<div className="relative flex-1 min-w-[180px] max-w-xs">
							<svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="15" height="15" fill="none" viewBox="0 0 24 24">
								<path fill="currentColor" d="M10 2a8 8 0 1 0 4.906 14.32l4.387 4.387a1 1 0 0 0 1.414-1.414l-4.387-4.387A8 8 0 0 0 10 2Zm-6 8a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z" />
							</svg>
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Buscar por descripción..."
								className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E7C8B]/30 focus:border-[#0E7C8B]"
							/>
						</div>

						<div className="flex gap-1 ml-auto flex-wrap">
							{(["ALL", "INCOME", "EXPENSE", "SAVING"] as TypeFilter[]).map((f) => (
								<button
									key={f}
									onClick={() => setTypeFilter(f)}
									className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${typeFilter === f ? "bg-[#0E7C8B] text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
										}`}
								>
									{f === "ALL" ? "Todos" : f === "INCOME" ? "Ingresos" : f === "EXPENSE" ? "Gastos" : "Ahorros"}
								</button>
							))}
						</div>
					</div>

					<section>
						<div className="hidden md:block">
							<table className="w-full bg-white rounded-xl shadow overflow-hidden border border-slate-100">
								<thead>
									<tr className="bg-slate-50 text-slate-500 text-xs uppercase">
										<th className="p-4 w-14 text-left font-semibold">Tipo</th>
										<th className="p-4 text-left font-semibold">Categoría / Fuente</th>
										<th className="p-4 w-36 text-left font-semibold">
											<button
												onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
												className="inline-flex items-center gap-1 hover:text-[#0E7C8B] transition-colors"
												title={sortOrder === "desc" ? "Más recientes primero" : "Más antiguos primero"}
											>
												Fecha
												{sortOrder === "desc" ? (
													<svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v12.17l4.59-4.58a1 1 0 0 1 1.41 1.41l-6.3 6.3a1 1 0 0 1-1.41 0l-6.3-6.3a1 1 0 0 1 1.41-1.41L11 16.17V4a1 1 0 0 1 1-1Z" /></svg>
												) : (
													<svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21a1 1 0 0 1-1-1V7.83l-4.59 4.58a1 1 0 0 1-1.41-1.41l6.3-6.3a1 1 0 0 1 1.41 0l6.3 6.3a1 1 0 0 1-1.41 1.41L13 7.83V20a1 1 0 0 1-1 1Z" /></svg>
												)}
											</button>
										</th>
										<th className="p-4 w-32 text-right font-semibold">Monto</th>
										<th className="p-4 text-left font-semibold">Descripción</th>
										<th className="p-4 w-28 text-right font-semibold">Acciones</th>
									</tr>
								</thead>
								<tbody>
									{transactions.length === 0 ? (
										<tr>
											<td colSpan={6} className="p-8 text-center">
												<div className="flex flex-col items-center gap-3">
													<div className="text-slate-300">
														<svg width="48" height="48" fill="none" viewBox="0 0 24 24">
															<path fill="currentColor" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm3-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6Z" />
														</svg>
													</div>
													<p className="text-slate-400">No hay transacciones que coincidan con los filtros</p>
													<Link href="/transactions/new" className="text-sm text-[#0E7C8B] hover:underline font-medium">
														Agregar tu primera transacción
													</Link>
												</div>
											</td>
										</tr>
									) : (
										transactions.map((tx) => (
											<tr key={tx.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
												<td className="p-4 w-14">
													<span className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ${tx.type === "INCOME" ? "bg-emerald-50 text-emerald-600" : tx.type === "SAVING" ? "bg-sky-50 text-sky-500" : "bg-red-50 text-red-600"}`}>
														{tx.type === "INCOME" ? (
															<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21a1 1 0 0 1-1-1V7.83l-4.59 4.58a1 1 0 0 1-1.41-1.41l6.3-6.3a1 1 0 0 1 1.41 0l6.3 6.3a1 1 0 0 1-1.41 1.41L13 7.83V20a1 1 0 0 1-1 1Z" /></svg>
														) : tx.type === "SAVING" ? (
															<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M19 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3v-1h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1V8Zm-2 8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v8Zm2-5h1v2h-1v-2Zm-7-1a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /></svg>
														) : (
															<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v12.17l4.59-4.58a1 1 0 0 1 1.41 1.41l-6.3 6.3a1 1 0 0 1-1.41 0l-6.3-6.3a1 1 0 0 1 1.41-1.41L11 16.17V4a1 1 0 0 1 1-1Z" /></svg>
														)}
													</span>
												</td>
												<td className="p-4">
													<span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${tx.type === "INCOME" ? "bg-emerald-50 text-emerald-700" : tx.type === "SAVING" ? "bg-sky-50 text-sky-600" : "bg-slate-100 text-slate-700"}`}>
														{tx.type === "INCOME" ? tx.incomeSource?.name ?? "Fuente de ingreso" : categoryMap[tx.categoryId] ?? tx.categoryId}
													</span>
												</td>
												<td className="p-4 text-slate-600 text-sm">
													<div className="font-medium">{formatLocalDate(tx.transactionDate)}</div>
													<div className="text-xs text-slate-400" suppressHydrationWarning>{mounted ? formatTime(tx.createdAt) : ""}</div>
												</td>
												<td className={`p-4 text-right font-bold text-lg ${tx.type === "INCOME" ? "text-emerald-600" : tx.type === "SAVING" ? "text-sky-500" : "text-red-600"}`}>
													${formatCLP(Math.abs(tx.amount))}
												</td>
												<td className="p-4 text-sm text-slate-500 max-w-[180px]">
													<span className="truncate block">{tx.description || <span className="text-slate-300">—</span>}</span>
												</td>
												<td className="p-4 text-right">
													<div className="flex items-center justify-end gap-2">
														<button onClick={() => setEditTx(tx)} className="p-2 text-slate-400 hover:text-[#0E7C8B] hover:bg-[#0E7C8B]/10 rounded-lg transition-colors" title="Editar">
															<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M16.862 3.487a2.5 2.5 0 0 1 3.536 0l.115.115a2.5 2.5 0 0 1 0 3.536L9.06 18.591a1 1 0 0 1-.465.263l-5.5 1.375a1 1 0 0 1-1.213-1.212l1.374-5.5a1 1 0 0 1 .263-.465L16.862 3.487Z" /></svg>
														</button>
														<button onClick={() => setDeleteTx(tx)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
															<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M10 2a2 2 0 0 0-2 2H4a1 1 0 0 0 0 2h1v13a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V6h1a1 1 0 1 0 0-2h-4a2 2 0 0 0-2-2h-4ZM9 6h6v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V6h2Zm1 3a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z" /></svg>
														</button>
													</div>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>

						<div className="md:hidden space-y-3">
							{transactions.length === 0 ? (
								<div className="bg-white rounded-xl border border-slate-100 p-8 text-center shadow-sm">
									<div className="text-slate-300 flex justify-center mb-3">
										<svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm3-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6Z" /></svg>
									</div>
									<p className="text-slate-400 text-sm">No hay transacciones</p>
									<Link href="/transactions/new" className="text-sm text-[#0E7C8B] hover:underline font-medium mt-2 inline-block">
										Agregar tu primera transacción
									</Link>
								</div>
							) : (
								transactions.map((tx) => (
									<div key={tx.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
										{/* Fila 1: icono + categoría + monto */}
										<div className="flex items-center gap-3">
											<span className={`w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 ${tx.type === "INCOME" ? "bg-emerald-50 text-emerald-600" : tx.type === "SAVING" ? "bg-sky-50 text-sky-500" : "bg-red-50 text-red-600"}`}>
												{tx.type === "INCOME" ? (
													<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21a1 1 0 0 1-1-1V7.83l-4.59 4.58a1 1 0 0 1-1.41-1.41l6.3-6.3a1 1 0 0 1 1.41 0l6.3 6.3a1 1 0 0 1-1.41 1.41L13 7.83V20a1 1 0 0 1-1 1Z" /></svg>
												) : tx.type === "SAVING" ? (
													<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M19 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3v-1h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1V8Zm-2 8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v8Zm2-5h1v2h-1v-2Zm-7-1a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /></svg>
												) : (
													<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v12.17l4.59-4.58a1 1 0 0 1 1.41 1.41l-6.3 6.3a1 1 0 0 1-1.41 0l-6.3-6.3a1 1 0 0 1 1.41-1.41L11 16.17V4a1 1 0 0 1 1-1Z" /></svg>
												)}
											</span>
											<div className="flex-1 min-w-0">
												<span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-md ${tx.type === "INCOME" ? "bg-emerald-50 text-emerald-700" : tx.type === "SAVING" ? "bg-sky-50 text-sky-600" : "bg-slate-100 text-slate-600"}`}>
													{tx.type === "INCOME" ? tx.incomeSource?.name ?? "Ingreso" : tx.type === "SAVING" ? categoryMap[tx.categoryId] ?? "Ahorro" : categoryMap[tx.categoryId] ?? "Gasto"}
												</span>
												<p className="text-xs text-slate-400 mt-0.5">{formatLocalDate(tx.transactionDate)}</p>
											</div>
											<p className={`text-base font-bold flex-shrink-0 ${tx.type === "INCOME" ? "text-emerald-600" : tx.type === "SAVING" ? "text-sky-500" : "text-red-600"}`}>
												${formatCLP(Math.abs(tx.amount))}
											</p>
										</div>
										{/* Fila 2: descripción */}
										<p className="text-sm text-slate-500 truncate">
											{tx.description || <span className="text-slate-300">Sin descripción</span>}
										</p>
										{/* Fila 3: acciones */}
										<div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
											<button onClick={() => setEditTx(tx)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0E7C8B] px-3 py-1.5 rounded-lg hover:bg-[#0E7C8B]/10 transition-colors">
												<svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M16.862 3.487a2.5 2.5 0 0 1 3.536 0l.115.115a2.5 2.5 0 0 1 0 3.536L9.06 18.591a1 1 0 0 1-.465.263l-5.5 1.375a1 1 0 0 1-1.213-1.212l1.374-5.5a1 1 0 0 1 .263-.465L16.862 3.487Z" /></svg>
												Editar
											</button>
											<button onClick={() => setDeleteTx(tx)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
												<svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M10 2a2 2 0 0 0-2 2H4a1 1 0 0 0 0 2h1v13a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V6h1a1 1 0 1 0 0-2h-4a2 2 0 0 0-2-2h-4ZM9 6h6v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V6h2Zm1 3a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z" /></svg>
												Eliminar
											</button>
										</div>
									</div>
								))
							)}
						</div>

						<div className="flex items-center justify-between text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100 flex-wrap gap-3">
							<span className="font-medium hidden md:inline">
								Mostrando <span className="text-slate-900">{startEntry}</span> a <span className="text-slate-900">{endEntry}</span> de <span className="text-slate-900 font-semibold">{totalFiltered}</span> transacciones
							</span>
							<span className="font-medium md:hidden text-xs">
								{startEntry}–{endEntry} de {totalFiltered}
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

			{editTx && (
				<EditTransactionModal
					transaction={editTx}
					onClose={() => setEditTx(null)}
					onSave={async (tx: TransactionRow, payload: UpdatePayload) => {
						await updateRow(tx, payload);
					}}
				/>
			)}

			{deleteTx && (
				<DeleteConfirmModal
					transaction={deleteTx}
					onClose={() => setDeleteTx(null)}
					onConfirm={async (tx: TransactionRow) => {
						await deleteRow(tx);
					}}
				/>
			)}
		</>
	);
}
