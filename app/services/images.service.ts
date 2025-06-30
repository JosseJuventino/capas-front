import { api } from "../lib/api";
import { ImageResponse, Image } from "../types/types";

export const uploadImage = async (imagen: Image): Promise<ImageResponse> => {
  const formData = new FormData();
  formData.append("originalFilename", imagen.originalFilename);
  formData.append("category", imagen.category);
  formData.append("file", imagen.file);

  const response = await api.post<ImageResponse>("/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};