import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

const fetchProducts = async (categoryId = null, q = null) => {
  const params = {};
  if (categoryId) params.category_id = categoryId;
  if (q) params.q = q;
  const response = await api.get("/products/", { params });
  return response.data;
};
export const useProducts = (categoryId = null, q = null) => {
  return useQuery({
    queryKey: ['products', categoryId, q],
    queryFn: () => fetchProducts(categoryId, q),
    select: (productsData) => {
      const formattedProducts = Array.isArray(productsData)
        ? productsData.map(product => ({
            id: product.id,
            name: product.name || 'Без названия',
            price: product.price
              ? parseFloat(product.price).toLocaleString('ru-RU') + ' ₽'
              : '0 ₽',
            description: product.description || '',
            category: product.category,
            gradient: 'linear-gradient(135deg, #4A3B2F 0%, #2B221C 100%)',
            images: product.images
              ? product.images.map(img => {
                  // Если это уже абсолютный URL, оставляем как есть
                  if (img.startsWith('http')) {
                    return img;
                  }
                  // Если это относительный путь /media/..., используем API базовый URL
                  // Он будет переписан nginx правилами rewrite
                  return img;
                })
              : [],
            image_directory: product.image_directory,
          }))
        : [];
      return formattedProducts;
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });
};