"use client";
import { useEditBudgetFlow, type EditCategory, type EditSubcategory, type CategoryType } from "@/store/EditBudgetFlowContext";

export type { EditSubcategory, EditCategory, CategoryType };

export function useEditBudget() {
  const { categories, setCategories, selectedCategoryId, setSelectedCategoryId, spentByCategory } =
    useEditBudgetFlow();

  const selectedId = selectedCategoryId;
  const selectedCategory = categories.find((cat) => cat.id === selectedId);

  function handleAddCategory() {
    const newCategory: EditCategory = {
      id: crypto.randomUUID(),
      name: "",
      budget: "",
      type: "EXPENSE",
      subcategories: [],
      isNew: true,
    };
    setCategories((prev) => [...prev, newCategory]);
    setSelectedCategoryId(newCategory.id);
  }

  function handleCategoryChange(field: "name" | "budget", value: string) {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === selectedId ? { ...cat, [field]: value } : cat))
    );
  }

  function handleTypeChange(type: CategoryType) {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === selectedId ? { ...cat, type } : cat))
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
                { id: crypto.randomUUID(), name: "", budget: "", isNew: true },
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

  // Returns how much has been spent in a subcategory (for warning UI)
  function getSubSpent(subId: string): number {
    return spentByCategory[subId] ?? 0;
  }

  return {
    categories,
    selectedId,
    setSelectedId: setSelectedCategoryId,
    selectedCategory,
    handleAddCategory,
    handleCategoryChange,
    handleTypeChange,
    handleSubChange,
    handleAddSub,
    handleRemoveSub,
    handleRemoveCategory,
    getSubSpent,
    spentByCategory,
  };
}
