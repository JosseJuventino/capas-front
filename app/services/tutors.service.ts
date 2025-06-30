import { api } from '@/app/lib/api';

import { Tutor, TutorResponse } from '@/app/types/types'

export const getTutors = async (): Promise<Tutor[]> => {
  const response = await api.get<TutorResponse>('/user-x-work-groups/tutores');
  return response.data.data;
};

export const addTutor = async (tutor: Tutor): Promise<Partial<Tutor>> => {
  tutor.imageDocumentId = "c745d3cb-ab8b-49eb-bcda-70059b1d2d61";
  tutor.roleName = "tutor";
  console.log("Tutor a crear:", tutor);
  const response = await api.post<Partial<Tutor>>("/users", tutor);
  return response.data;
};

export const deleteTutor = async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
}
    