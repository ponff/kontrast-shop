import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";

export const useCustomForm = () => {
  return useMutation({
    mutationFn: (formData) => api.post("/orders/create-custom/", formData),
    onSuccess: (data) => {
    },
    onError: (error) => {
    },
  });
};