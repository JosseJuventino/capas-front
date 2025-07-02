"use client";
import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { CourseContext } from "@/app/contexts/course-context";
import type { Asistencia, AsistenciaEncargado } from "@/app/types/types";
import { getAsistenciaByCourseId, updateAsistenciaById, addAsistenciaEncargadoIndividualy } from "@/app/services/asistencia.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@pheralb/toast";
import { useWarnIfUnsavedChanges } from "@/app/hooks/useWarnIfUnsavedChanges";
import { FormAsistenciaEncargado } from "@/app/components/Popups/AddEncargadoAsistenciaModal";
import AsistenciaCard from "@/app/components/Asistencia/AsistenciaCard";
import { getLocalTimeZone, today } from "@internationalized/date";

type EstadoAsistencia = "asistio" | "falto" | "permiso";

const getCurrentDateString = today(getLocalTimeZone())

export default function Asistencia() {
  const course = useContext(CourseContext);
  const queryClient = useQueryClient();

  console.log("Course context:", course);

  const [localAsistencia, setLocalAsistencia] = useState<Asistencia>({
    _id: "",
    seccionId: course?._id || "",
    alumnos: [],
    encargados: [],
  });

  const [modalState, setModalState] = useState<{
    type: 'add' | 'edit' | 'delete' | null;
    selected: Partial<AsistenciaEncargado> | null;
  }>({ type: null, selected: null });

  const { data: asistenciaResponse } = useQuery<Asistencia>({
    queryKey: ["asistencia", course?._id],
    queryFn: () => getAsistenciaByCourseId(course?._id as string),
    enabled: !!course?._id,
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialAlumnosRef = useRef(localAsistencia.alumnos);
  const initialEncargadosRef = useRef(localAsistencia.encargados);


  useWarnIfUnsavedChanges(hasUnsavedChanges);

  const updateAsistenciaByIdMutation = useMutation({
    mutationFn: updateAsistenciaById,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["asistencia", course?._id],
      });
    },
  });

  const addAsistenciaEncargadoIndividualyMutation = useMutation<Asistencia, unknown, { encargado: Partial<AsistenciaEncargado>, id_section: string }>({
    mutationFn: ({ encargado, id_section }) => addAsistenciaEncargadoIndividualy(encargado, id_section),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["asistencia", course?._id],
      });
    },
  });

  useEffect(() => {
    if (asistenciaResponse) {

      const todayAsistencias = {
        ...asistenciaResponse,
        alumnos: asistenciaResponse.alumnos.filter(
          (alumno: { fecha: string, userXWorkGroupId: string, }) =>
            alumno.fecha.split("T")[0] === getCurrentDateString.toString()
        ),

        encargados: asistenciaResponse.encargados.filter(
          (encargado: { fecha: string }) =>
            encargado.fecha.split("T")[0] ==
            getCurrentDateString.toString()
        ),
      };

      console.log("todayAsistenciasUSEEFFECT", todayAsistencias);
      console.log("courseALUMNOS", course?.alumnos);

      todayAsistencias.alumnos = todayAsistencias.alumnos.map((alumno) => ({
        ...alumno,
        userXWorkGroupId: course?.alumnos.find((a) => a._id === alumno.userXWorkGroupId)?.userXWorkgroupId || alumno.userXWorkGroupId,
      }));

      initialAlumnosRef.current = todayAsistencias.alumnos;
      initialEncargadosRef.current = todayAsistencias.encargados;

      setLocalAsistencia(todayAsistencias);
 
    }
  }, [asistenciaResponse]);

  useEffect(() => {
    const hasChanges =
      JSON.stringify(localAsistencia.alumnos) !==
      JSON.stringify(initialAlumnosRef.current);
    setHasUnsavedChanges(hasChanges);
  }, [localAsistencia.alumnos]);

  const handleAdd = (formData: AsistenciaEncargado) => {
    if (!modalState.selected) return;

    const payload: AsistenciaEncargado = {
      userId: modalState.selected._id || "",
      fecha: new Date(formData.fecha).toISOString(),
      estado: formData.estado,
      hora_inicio: new Date(`${formData.fecha}T${formData.hora_inicio}`).toISOString(),
      hora_fin: new Date(`${formData.fecha}T${formData.hora_fin}`).toISOString(),
    };

    const finalPromise = addAsistenciaEncargadoIndividualyMutation.mutateAsync({ encargado: payload, id_section: course?._id as string });

    toast.loading({
      text: "Registrando asistencia...",
      options: {
        promise: finalPromise,
        success: "Asistencia registrada exitosamente 🎉",
        error: "Error al guardar la asistencia 😢",
        autoDismiss: true,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["asistencia", course?._id] });
          initialEncargadosRef.current = localAsistencia.encargados;
          setHasUnsavedChanges(false);
          setModalState({ type: null, selected: null });
        },
        onError: (error: unknown) => {
          const err = error as { response?: { status: number, message: string } };
          if (err.response && err.response.status === 409)
            toast.error({ text: "El usuario tiene horarios solapados" });

          else {
            console.log(error);
            toast.error({ text: "Error al guardar la asistencia" });
          }
        },
      },
    });
  }

  const handleEstadoAsistencia = useCallback(
    (alumnoId: string, estado: EstadoAsistencia) => {
      setLocalAsistencia((prev) => {
        const alumno = course?.alumnos.find((a) => a._id === alumnoId);
        if (!alumno) return prev;

        const existingIndex = prev.alumnos.findIndex(
          (a) => a.userXWorkGroupId === alumnoId
        );

        const newAsistencia = {
          userXWorkGroupId: alumno.userXWorkgroupId,
          fecha: new Date().toISOString().split('T')[0],
          estado,
          nombre: alumno.nombre,
          imagen: alumno.image,
        };

        const updatedAlumnos = [...prev.alumnos];

        if (existingIndex === -1) {
          updatedAlumnos.push(newAsistencia);
        } else {
          updatedAlumnos[existingIndex] = newAsistencia;
        }

        return {
          ...prev,
          alumnos: updatedAlumnos,
        };
      });
    },
    [course]
  );

  const closeModal = () => setModalState({ type: null, selected: null, });

  const handleGuardar = () => {
    const payload = {
      seccionId: course?._id || "",
      asistencias: localAsistencia.alumnos.map(({ userXWorkGroupId, fecha, estado }) => ({
        userXWorkGroupId,
        fecha,
        estado,
      })),
    };

    console.log("Guardando asistencia:", payload);

    const finalPromise = updateAsistenciaByIdMutation.mutateAsync(payload);

    toast.loading({
      text: "Actualizando asistencia...",
      options: {
        promise: finalPromise,
        success: "Asistencia registrada exitosamente 🎉",
        error: "Error al guardar la asistencia 😢",
        autoDismiss: true,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["asistencia", course?._id] });
          initialAlumnosRef.current = localAsistencia.alumnos;
          setHasUnsavedChanges(false);
        },
        onError: (error: unknown) => {
          const err = error as { response?: { status: number, message: string } };
          if (err.response && err.response.status === 409)
            toast.error({ text: "El usuario tiene horarios solapados" });
          else {
            console.log(error);
            toast.error({ text: "Error al guardar la asistencia" });
          }
        },
      },
    });
  };

  if (!course) return <div>Seleccione un curso primero</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col w-full gap-2">
          <div className="flex justify-between gap-4">
            <h1 className="sm:text-2xl my-1 text-base text-[#003C71] font-bold">
              Registro de Asistencia
            </h1>
              <button
                onClick={handleGuardar}
                className="bg-[#003C71] text-white sm:px-6 sm:py-0 px-2 py-0 rounded-lg transition-colors disabled:bg-gray-300"
                disabled={!hasUnsavedChanges}
              >
                Guardar Asistencias
              </button>
          </div>
        </div>
      </div>


      <div className="space-y-4">
        {course.alumnos.map((alumno) => (
          <AsistenciaCard key={alumno._id} isAlumno={true} localAsistencia={localAsistencia} alumno={alumno} handleEstadoAsistencia={handleEstadoAsistencia} />
        ))}

        <FormAsistenciaEncargado
          isOpen={modalState.type === 'add'}
          title="Asistencia"
          onClose={closeModal}
          onSubmit={handleAdd}
        />
      </div>
    </div>
  );
}