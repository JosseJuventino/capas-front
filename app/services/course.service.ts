import { api } from "../lib/api";
import { Course, CourseAddInterface, CourseResponse } from "../types/types";


export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await api.get<CourseResponse>("/work-groups");
    const data = response.data.data;
    console.log("Datos obtenidos:", data);

    if (!data) {
      throw new Error("Datos no disponibles");
    }

    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

export const createCourse = async (
  course: CourseAddInterface
): Promise<CourseAddInterface> => {

  const response = await api.post<CourseAddInterface>("/user-x-work-groups", course);
  return response.data;
};

export const getCourseBySlug = async (slug: string): Promise<Course> => {
  const response = await api.get<CourseResponse>(`/user-x-work-groups/work-group/slug/${slug}`);
  const data = response.data.data;
  return Array.isArray(data) ? data[0] : data;
};

export const updateCourse = async (
  course: CourseAddInterface
): Promise<CourseAddInterface> => {
 const { id, ...data } = course;
 console.log("Datos a actualizar:", data);
  const response = await api.patch<CourseAddInterface>(`/user-x-work-groups/workgroup/${id}`, data);

  return response.data;
};


export const getMySections = async (): Promise<Course[]> => {
  const response = await api.get<CourseResponse>("/user-x-work-groups/me");
  console.log(response)
  const data = response.data.data;
  return Array.isArray(data) ? data : [data];
};