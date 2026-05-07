"use client";
import { useState } from "react";

export type Subcategory = { id: string; name: string; budget: string };
export type Category = { id: string; name: string; budget: string; subcategories: Subcategory[] };

export function useBudget() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedCategory = categories.find((cat) => cat.id === selectedId);

  function handleAddCategory() {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: "",
      budget: "",
      subcategories: [],
    };
    setCategories([...categories, newCategory]);
    setSelectedId(newCategory.id);
  }

  function handleCategoryChange(field: "name" | "budget", value: string) {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === selectedId ? { ...cat, [field]: value } : cat
      )
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
          ? {
              ...cat,
              subcategories: cat.subcategories.filter((sub) => sub.id !== subId),
            }
          : cat
      )
    );
  }

  return {
    categories,
    selectedId,
    setSelectedId,
    selectedCategory,
    handleAddCategory,
    handleCategoryChange,
    handleSubChange,
    handleAddSub,
    handleRemoveSub,
  };
}