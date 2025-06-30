import { api } from "../lib/api";

import {
  Asistencia,
  AsistenciaAlumno,
  AsistenciaEncargado,
  AsistenciaEntryResponse,
  AsistenciaResponse,
  HistoryAsistenciaResponse,
  RawAsistenciaAlumno,
} from "@/app/types/types";

export const getAllAsistencia = async (): Promise<Asistencia[]> => {
  const response = await api.get<AsistenciaResponse>("/asistencia");
  const data = response.data.data;
  return Array.isArray(data) ? data : [data];
};

export const getAsistenciaOfAlumnosBySectionId = async (
  id: string
): Promise<Asistencia> => {
  const response = await api.get<Asistencia>(`/asistencia/alumnos/${id}`);
  const data = response.data;
  return Array.isArray(data) ? data[0] : data;
};

export const getAsistenciaOfEncargadosBySectionId = async (
  id: string
): Promise<Asistencia> => {
  const response = await api.get<Asistencia>(`/asistencia/encargados/${id}`);
  const data = response.data;
  return Array.isArray(data) ? data[0] : data;
};

export const getRecordOfAlumno = async (id: string): Promise<Asistencia> => {
  const response = await api.get<Asistencia>(
    `/asistencia/alumno/register/${id}`
  );
  const data = response.data;
  return Array.isArray(data) ? data[0] : data;
};

export const updateAsistenciaOfAlumno = async (
  asistencia: Partial<Asistencia>
): Promise<Asistencia> => {
  const response = await api.patch<Asistencia>(
    `/asistencia/alumno/register/${asistencia._id}`,
    asistencia
  );
  return response.data;
};

export const addAlumnoAsistenciaBySectionId = async (
  asistencia: Partial<Asistencia>
): Promise<Asistencia> => {
  const response = await api.patch<Asistencia>(
    "/asistencia/alumno/",
    asistencia
  );
  return response.data;
};

export const addEncargadoAsistenciaBySectionId = async (
  asistencia: Partial<Asistencia>
): Promise<Asistencia> => {
  const response = await api.patch<Asistencia>(
    "/asistencia/encargado/",
    asistencia
  );
  return response.data;
};

export const getAsistenciaByCourseId = async (
  seccionId: string | undefined
): Promise<Asistencia> => {
  // aquí resp.data.data es AsistenciaEntryDto[] y no Asistencia[]
  const resp = await api.get<AsistenciaEntryResponse>(
    `/attendance/get-all-work-group/${seccionId}`
  );
  const entries = resp.data.data; // <-- AsistenciaEntryDto[]

  const alumnos: AsistenciaAlumno[] = entries
    .filter(e => typeof e.alumnoId === "string")
    .map<AsistenciaAlumno>(e => ({
      userXWorkGroupId: e.alumnoId!,
      fecha:            e.fecha,
      estado:           e.estado,
      nombre:           e.nombre,
      imagen:           e.imagen,
    }));

  const encargados: AsistenciaEncargado[] = entries
    .filter(e => typeof e.userId === "string")
    .map<AsistenciaEncargado>(e => ({
      userId:     e.userId!,
      fecha:      e.fecha,
      estado:     e.estado,
      hora_inicio:e.hora_inicio ?? "",
      hora_fin:   e.hora_fin    ?? "",
    }));

  return {
    _id:       seccionId ?? "",
    seccionId: seccionId ?? "",
    alumnos,
    encargados,
  };
};

export const updateAsistenciaById = async (
  asistencia: Partial<Asistencia>
): Promise<Asistencia> => {

  const {seccionId, ...data} = asistencia;

  console.log("Datos a actualizar:", data);
  console.log("Sección ID:", seccionId);
  
  const response = await api.post(
    `/attendance`,
    data
  );
  
  return response.data;
};

export const getAsistenciaByDateAlumnos = async (
  id_section: string | undefined,
  month:      string,
  year:       string
): Promise<HistoryAsistenciaResponse<AsistenciaAlumno>> => {
  type RawHistoryResponseArray = HistoryAsistenciaResponse<Record<string, RawAsistenciaAlumno[]>[]>;
  const resp = await api.get<RawHistoryResponseArray>(
    `/attendance/work-group/${id_section}?month=${month}&year=${year}`
  );

  const rawArray = resp.data.data;
  const rawData: Record<string, RawAsistenciaAlumno[]> =
    Array.isArray(rawArray) ? rawArray[0] : rawArray;

  const mappedData: Record<string, AsistenciaAlumno[]> = {};
  for (const fecha in rawData) {
    mappedData[fecha] = rawData[fecha].map(item => ({
      userXWorkGroupId: item.alumnoId,
      fecha:            item.fecha,
      estado:           item.estado,
      nombre:           item.nombre,
      imagen:           item.imagen,
    }));
  }

  return {
    ...resp.data,
    data: mappedData
  };
};

export const getAsistenciaByDateEncargados = async (
  id_section: string | undefined,
  month: string,
  year: string
): Promise<HistoryAsistenciaResponse<AsistenciaEncargado>> => {
  const response = await api.get<HistoryAsistenciaResponse<AsistenciaEncargado>>(
    `/asistencia/seccion/${id_section}/encargados-agrupados?month=${month}&year=${year}`
  );

  console.log("Response nueva", response);
  return Array.isArray(response.data) ? response.data[0] : response.data;
};

export const addAsistenciaEncargadoIndividualy = async (
  encargado: Partial<AsistenciaEncargado>,
  id_section: string
): Promise<Asistencia> => {
  const response = await api.post<Asistencia>(
    `/asistencia/encargado/${id_section}`,
    encargado
  );
  return response.data;
};

export const updateRegisterById = async (
  asistencia: Partial<Asistencia>
): Promise<Asistencia> => {
  const response = await api.patch<Asistencia>(
    `/asistencia/alumno/register/${asistencia._id}`,
    asistencia
  );
  return response.data;
};