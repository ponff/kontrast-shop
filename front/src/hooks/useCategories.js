import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

const fetchCategories = async () => {
  const response = await api.get("/categories/");
  return response.data;
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    select: (categoriesData) => {
      const formattedCategories = Array.isArray(categoriesData)
        ? categoriesData.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description || '',
            image: category.image || null,
            order: category.order,
          }))
        : [];
      return formattedCategories;
    },
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 20 * 60 * 1000, // 20 минут
  });
};
