"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import {Image, Publicacion, FileNew } from "@/app/types/types";
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
}: FormModalProps) => {
    const emptyForm = useMemo<Partial<Publicacion>>(
        () => ({
            categoria: "",
            descripcion: "",
            documentIds: [],
            workgroupId: courseId,
            documentos: [],
            files: [],
        }),
        [courseId]
    );

    const [formData, setFormData] = useState<Partial<Publicacion>>(emptyForm);
    const [files, setFiles] = useState<(File | Partial<FileNew>)[]>([]);
    const [existingFiles, setExistingFiles] = useState<Partial<FileNew>[]>([]);
    
    const queryClient = useQueryClient();

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);

            // Mapear documentos existentes al formato que espera MultiFileSelector
            const mappedFiles = initialData.documentos?.map(doc => ({
                originalFileName: doc.originalFilename,
                url: doc.url,
                tipo: doc.tipo,
                id: doc.id || doc.id,
            })) || [];

            console.log("Archivos existentes mapeados:", mappedFiles);
            setExistingFiles(mappedFiles);
            setFiles(mappedFiles);
        } else {
            setFormData(emptyForm);
            setFiles([]);
            setExistingFiles([]);
        }
    }, [initialData, emptyForm, isOpen]);

    // Mutaciones para agregar y actualizar
    const addPublicationMutation = useMutation({
        mutationFn: addPublication,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['CursoActual']
            });
        },
    });

    // Para actualizar publicación
    const updatePublicationMutation = useMutation({
        mutationFn: updatePublication,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['CursoActual']
            });
        },
    });

    const uploadImageMutation = useMutation({
        mutationFn: uploadImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["image"] });
        },
    });

    const handleFieldChange = (field: keyof Publicacion, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        setFormData(emptyForm);
        setFiles([]);
        setExistingFiles([]);
        onClose();
    };

    const validateForm = (): string[] => {
        const errors: string[] = [];
        if (!formData.descripcion?.trim()) {
            errors.push("La descripción no puede quedar vacía");
        }
        if (files.length === 0) {
            errors.push("Debe adjuntar al menos un archivo");
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
        console.log("Imagen subida:", response);
        return {
            id: response.data.id,
            originalFileName: file.name,
            url: response.data.url,
            tipo: file.type.startsWith('image/') ? 'imagen' : 'documento'
        };
    };

    const processFile = async (file: File | Partial<FileNew>) => {
        if (!(file instanceof File)) {
            // Si no es un File, es un archivo existente
            return file;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error({
                text: "Error",
                description: "El archivo no puede ser mayor a 5MB",
            });
            throw new Error("El archivo no puede ser mayor a 5MB");
        }

        try {
            console.log("Procesando archivo nuevo:", file.name);
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
            console.log("Archivos antes de procesar:", files);
            
            const processedFiles = await Promise.all(files.map((file) => processFile(file)));
            console.log("Archivos procesados:", processedFiles);

            // Filtrar archivos válidos y obtener sus IDs
            const validFiles = processedFiles.filter(Boolean) as Partial<FileNew>[];
            const documentIds = validFiles.map((file) => file.id).filter(Boolean) as string[];

            const submissionData = { 
                ...formData,
                documentIds: documentIds,
                descripcion: formData.descripcion?.substring(0, 50)
            };

            console.log("Datos a enviar:", submissionData);

            if (initialData && initialData._id) {
                submissionData._id = initialData._id;
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
            setFiles([]);
            setExistingFiles([]);
            handleCancel();
        } catch (error) {
            toast.error({
                text: "Error",
                description: "Ha ocurrido un error procesando la publicación",
            });
            console.error("Error procesando publicación:", error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            title={title}
            onClose={handleCancel}
            buttons={
                <div className="flex gap-2">
                    <button 
                        onClick={handleCancel} 
                        className="px-4 py-2 text-[#003C71] rounded hover:bg-gray-100"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        className="px-4 py-2 bg-[#003C71] text-white rounded hover:bg-blue-700"
                    >
                        {initialData && initialData._id ? "Actualizar" : "Agregar"}
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

                <MultiFileSelector
                    initialFiles={existingFiles}
                    setFiles={setFiles}
                />
            </form>
        </Modal>
    );
};