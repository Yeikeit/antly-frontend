"use client";

import { useState, useEffect } from "react";
import { getCategories, CategoryTree } from "@/lib/api/categories";

export function useCategories() {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();

        const map: Record<string, string> = {};
        for (const cat of data) {
          map[cat.id] = cat.name;
          for (const sub of cat.subcategories) {
            map[sub.id] = sub.name;
          }
        }

        setCategories(data);
        setCategoryMap(map);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, categoryMap, loading };
}
