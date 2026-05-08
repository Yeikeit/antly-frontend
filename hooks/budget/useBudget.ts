"use client";
import { useBudgetFlow } from "@/store/BudgetFlowContext";

export type { Subcategory, Category } from "@/store/BudgetFlowContext";

export function useBudget() {
  const { categories, setCategories, selectedCategoryId, setSelectedCategoryId } = useBudgetFlow();

  const selectedId = selectedCategoryId;
  const selectedCategory = categories.find((cat) => cat.id === selectedId);

  function handleAddCategory() {
    const newCategory = {
      id: crypto.randomUUID(),
      name: "",
      budget: "",
      subcategories: [],
    };
    setCategories((prev) => [...prev, newCategory]);
    setSelectedCategoryId(newCategory.id);
  }

  function handleCategoryChange(field: "name" | "budget", value: string) {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === selectedId ? { ...cat, [field]: value } : cat))
    );
  }

  function handleSubChange(subId: string, field: "name" | "budget", value: string) {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === selectedId
          ? {
              ...cat,
              subcategories: cat.subcategories.map((sub) =>
                sub.id === subId ? { ...sub, [field]: value } : sub
              ),
            }
          : cat
      )
    );
  }

  function handleAddSub() {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === selectedId
          ? {
              ...cat,
              subcategories: [
                ...cat.subcategories,
                { id: crypto.randomUUID(), name: "", budget: "" },
              ],
            }
          : cat
      )
    );
  }

  function handleRemoveSub(subId: string) {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === selectedId
          ? { ...cat, subcategories: cat.subcategories.filter((sub) => sub.id !== subId) }
          : cat
      )
    );
  }

  function handleRemoveCategory(catId: string) {
    setCategories((prev) => prev.filter((cat) => cat.id !== catId));
    if (selectedId === catId) setSelectedCategoryId(null);
  }

  return {
    categories,
    selectedId,
    setSelectedId: setSelectedCategoryId,
    selectedCategory,
    handleAddCategory,
    handleCategoryChange,
    handleSubChange,
    handleAddSub,
    handleRemoveSub,
    handleRemoveCategory,
  };
}
