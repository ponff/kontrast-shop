import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";

export const useOrderForm = () => {
  return useMutation({
    mutationFn: (formData) => api.post("/orders/create/", formData),
    onSuccess: (data) => {
      console.log("Заявка успешно отправлена:", data);
    },
    onError: (error) => {
      console.error("Ошибка при отправке заявки:", error);
    },
  });
};