import { api } from '../lib/api';

import { Publicacion } from '../types/types';

export const addPublication = async (publicacion: Partial<Publicacion>): Promise<Partial<Publicacion>> => {
  const response = await api.post('/documents-support-materials', publicacion);
  console.log("Publicación creada:", response);
  return response.data;
};

export const updatePublication = async (publicacion: Partial<Publicacion>): Promise<Partial<Publicacion>> => {
  const response = await api.patch<Partial<Publicacion>>(`/documents-support-materials/support-material/${publicacion._id}`, publicacion);
  return response.data;
};

export const deletePublication = async (id: string): Promise<void> => {
  await api.delete(`/support-materials/${id}`);
};