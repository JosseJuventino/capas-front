"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import { Course, CourseAddInterface } from "@/app/types/types";
import { InputField } from "../Fields/InputField";
import { ImageSelector } from "../Fields/ImageSelector";
import { toast } from "@pheralb/toast";
import SelectFieldMultiple from "@/app/components/Fields/SelectFieldMultiple";
import { getTutors } from "@/app/services/tutors.service";
import { getAlumnos } from "@/app/services/alumnos.service";

interface FormModalProps {
  isOpen: boolean;
  initialData?: Course;
  onClose: () => void;
  title: string;
  onSubmit: (data: CourseAddInterface, image: File | string | null) => void;
}

export const AddCourseModal = ({
  isOpen,
  initialData,
  onClose,
  onSubmit,
  title,
}: FormModalProps) => {
  const emptyForm = useMemo<Partial<Course>>(
    () => ({
      userIds: [],
      name: "",
      backgroundImageId: "",
    }),
    []
  );

  const [formData, setFormData] = useState<Partial<Course>>(emptyForm);
  const [imageFile, setImageFile] = useState<File | string | null>(null);
  const [tutors, setTutors] = useState<{ value: string; label: string; image: string; email: string; }[]>([]); // Estado para tutores
  const [alumnos, setAlumnos] = useState<{ value: string; label: string; image: string; email: string; }[]>([]); // Estado para alumnos
  const [selectedTutors, setSelectedTutors] = useState<string[]>([]);
  const [selectedAlumnos, setSelectedAlumnos] = useState<string[]>([]);

  useEffect(() => {
  if (!initialData) return;

  setFormData({
    name: initialData.nombre,                     // ← aquí estaba el desajuste
    backgroundImageId: initialData.backgroundImageId,
    userIds: [
      ...(initialData.tutores  ?? []).map(t => typeof t === "string" ? t : t._id),
      ...(initialData.alumnos ?? []).map(a => typeof a === "string" ? a : a._id),
    ],
    id: initialData._id,
  });

  // y previews de imagen si las necesitas:
  setImageFile(initialData.backgroundImage || initialData.backgroundImageId || null);
}, [initialData])

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await getTutors();
        const mappedTutors = response.map((tutor) => ({
          value: tutor._id,
          label: tutor.nombre,
          image: tutor.image || "",
          email: tutor.email || "",
        }));
        setTutors(mappedTutors);
      } catch (error) {
        console.error("Error fetching tutors:", error);
        toast.error({
          text: "Error",
          description: "No se pudieron cargar los tutores.",
        });
      }
    };

    fetchTutors();
  }, []);

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const response = await getAlumnos();
        const mappedAlumnos = response.map((alumno) => ({
          value: alumno._id,
          label: alumno.nombre,
          image: alumno.image || "",
          email: alumno.email || "",
        }));
        setAlumnos(mappedAlumnos);
      } catch (error) {
        console.error("Error fetching alumnos:", error);
        toast.error({
          text: "Error",
          description: "No se pudieron cargar los alumnos.",
        });
      }
    };

    fetchAlumnos();
  }, []);

  const handleImageChange = (file: File | string | null) => {
    setImageFile(file);
  };

  useEffect(() => {
    if (initialData?.userIds) {
      initialData.userIds.forEach((encargado) => {

        if (tutors.find((tutor) => tutor.value === encargado)) {
          setSelectedTutors((prev) => [...prev, encargado]);
        } else if (alumnos.find((alumno) => alumno.value === encargado)) {
          setSelectedAlumnos((prev) => [...prev, encargado]);
        }
      });
    }
  }, [initialData, emptyForm, tutors, alumnos]);

  useEffect(() => {
  if (!initialData) return;

  const alumnoIds =
    initialData.alumnos?.map(a => typeof a === "string" ? a : a._id) 
    ?? [];

  const tutorIds =
    initialData.tutores?.map(t => typeof t === "string" ? t : t._id) 
    ?? [];

  setSelectedAlumnos(alumnoIds);
  setSelectedTutors(tutorIds);
}, [initialData]);

  const handleFieldChange = (field: keyof CourseAddInterface, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTutorsChange = (values: string[]) => {
    setSelectedTutors(values);
  };

  const handleAlumnosChange = (values: string[]) => {
    setSelectedAlumnos(values);
  };

  const combineIds = (): string[] => {
    return [...selectedTutors, ...selectedAlumnos];
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setSelectedTutors([]);
    setSelectedAlumnos([]);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.name.trim() === "") {
      toast.error({
        text: "Error",
        description: "EL nombre no puede quedar vacio",
      })
      return;
    }

    const combinedData = combineIds();
    formData.userIds = combinedData;

    onSubmit(formData as CourseAddInterface, imageFile);
    handleCancel();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={handleCancel}
      buttons={
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-blue_principal rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue_principal text-white rounded"
          >
            Guardar
          </button>
        </div>
      }
    >
      <form className="space-y-4 px-6" onSubmit={handleSubmit}>
        <InputField
          label="Nombre"
          type="text"
          value={formData.name || ""}
          onChange={(v) => handleFieldChange("name", v)}
          placeholder="Nombre del programa"
          isRequired={true}
        />

        <SelectFieldMultiple
          label="Selecciona Tutores"
          options={tutors.map((tutor) => ({ value: tutor.value, label: tutor.label }))}
          onChange={handleTutorsChange}
          defaultValues={selectedTutors}
        />

        <SelectFieldMultiple
          label="Selecciona Alumnos"
          options={alumnos.map((alumno) => ({ value: alumno.value, label: alumno.label }))}
          onChange={handleAlumnosChange}
          defaultValues={selectedAlumnos}
        />

        <ImageSelector
          initialPreview={formData.backgroundImageId}
          onImageChange={handleImageChange}
        />
      </form>
    </Modal>
  );
};