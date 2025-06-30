"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import { FilePublicacion, Image, Publicacion, FileNew } from "@/app/types/types";
import { toast } from "@pheralb/toast";
import { TextAreaField } from "../Fields/TextAreaField";
import SelectFieldV2 from "../Fields/SelectField2";
import { ClipboardList, NotebookTextIcon } from "lucide-react";
import MultiFileSelector from "../Fields/MultiFileSelector";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadImage } from "@/app/services/images.service";
import { addPublication, updatePublication } from "@/app/services/publish.service";

interface FormModalProps {
    isOpen: boolean;
    initialData?: Publicacion;
    onClose: () => void;
    title: string;
    courseId: string | undefined;
    courseSlug: string | undefined;
}

const optionsCategory = [
    {
        value: "anuncio",
        label: "Anuncio",
        icon: <ClipboardList size={18} className="text-beige_secondary" />,
    },
    {
        value: "material de apoyo",
        label: "Material de apoyo",
        icon: <NotebookTextIcon size={18} className="text-[#003C71]" />,
    },
];

export const AddPublicationModal = ({
    isOpen,
    initialData,
    onClose,
    title,
    courseId,
    courseSlug
}: FormModalProps) => {
    const emptyForm = useMemo<Partial<Publicacion>>(
        () => ({
            categoria: "",
            descripcion: "",
            documentIds: [],
            workgroupId: courseId,
        }),
        [courseId]
    );

    const [formData, setFormData] = useState<Partial<Publicacion>>(emptyForm);

    const [files, setFiles] = useState<(File | Partial<FileNew>)[]>([]);
    const queryClient = useQueryClient();

    useEffect(() => {
        setFormData(initialData || emptyForm);
    }, [initialData, emptyForm]);

    // Mutaciones para agregar y actualizar
    const addPublicationMutation = useMutation({
        mutationFn: addPublication,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['course', courseSlug]
            });
        },
    });

    // Para actualizar publicación
    const updatePublicationMutation = useMutation({
        mutationFn: updatePublication,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['course', courseSlug]
            });
        },
    });

    const uploadImageMutation = useMutation({
        mutationFn: uploadImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["image"] });
        },
    });

    // Inicializar el formulario con los datos de edición (si existen)
    useEffect(() => {
        setFormData(initialData || emptyForm);
        setFiles(initialData?.files || []);
    }, [initialData, emptyForm]);

    const handleFieldChange = (field: keyof Publicacion, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        setFormData(emptyForm);
        onClose();
    };

    const validateForm = (): string[] => {
        const errors: string[] = [];
        if (!formData.descripcion?.trim()) {
            errors.push("La descripción no puede quedar vacía");
        }
        if (!formData.categoria?.trim()) {
            errors.push("La categoría no puede quedar vacía");
        }
        return errors;
    };

    // Funciones de carga para imágenes y documentos
    const handleImageUpload = async (file: File): Promise<Partial<FileNew>> => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error({
                text: "Error",
                description: "El archivo no puede ser mayor a 5MB",
            });
            throw new Error("El archivo no puede ser mayor a 5MB");
        }

        const imagen: Image = {
            originalFilename: file.name,
            category: "files_images_section",
            file,
        };

        const response = await uploadImageMutation.mutateAsync(imagen);
        console.log("Imagen subida----------------", response);
        return {
            id: response.data.id,
        };
    };


    const processFile = async (file: File | Partial<FileNew>) => {
        if (!(file instanceof File)) return file;

        if (file.size > 5 * 1024 * 1024) {
            toast.error({
                text: "Error",
                description: "El archivo no puede ser mayor a 5MB",
            });
            throw new Error("El archivo no puede ser mayor a 5MB");
        }

        try {
            console.log("Procesando archivo:", file.name);
            return await handleImageUpload(file);
        } catch (error) {
            toast.error({
                text: "Error",
                description: (error as Error).message,
            });
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (formErrors.length > 0) {
            formErrors.forEach((error) =>
                toast.error({ text: "Error", description: error })
            );
            return;
        }

        try {
            const processedFiles = await Promise.all(files.map((file) => processFile(file)));
            console.log("Archivos procesados:", processedFiles);

            const documentArray = processedFiles.filter(Boolean) as FilePublicacion[];

            formData.documentIds = documentArray.map((file) => file.id);

            const submissionData = { ...formData };

            console.log("Datos a enviar:", submissionData);

            if (initialData && initialData._id) {
                await updatePublicationMutation.mutateAsync(submissionData);

                toast.success({
                    text: "Éxito",
                    description: "La publicación se ha actualizado correctamente",
                });
            } else {
                console.log("Enviando datos de nueva publicación:", submissionData);
                await addPublicationMutation.mutateAsync(submissionData);
                toast.success({
                    text: "Éxito",
                    description: "Se ha agregado la publicación correctamente",
                });
            }

            setFormData(emptyForm);
            handleCancel();
        } catch (error) {
            toast.error({
                text: "Error",
                description: "Ha ocurrido un error procesando tus archivos",
            });
            console.error("Error procesando archivos:", error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            title={title}
            onClose={handleCancel}
            buttons={
                <div className="flex gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-[#003C71] rounded">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-[#003C71] text-white rounded">
                        {initialData && initialData._id ? "Editar" : "Agregar"}
                    </button>
                </div>
            }
        >
            <form
                className="space-y-4 px-6 overflow-y-auto h-96 scroll-smooth"
                onSubmit={handleSubmit}
            >
                <TextAreaField
                    label="Descripción"
                    value={formData.descripcion || ""}
                    onChange={(v) => handleFieldChange("descripcion", v)}
                    placeholder="Descripción de la publicación"
                    isRequired={true}
                />

                <SelectFieldV2
                    label="Categoría"
                    options={optionsCategory}
                    defaultValue={formData.categoria || ""}
                    onChange={(v) => handleFieldChange("categoria", v)}
                />

                <MultiFileSelector initialFiles={formData.files || []} setFiles={setFiles} />
            </form>
        </Modal>
    );
};