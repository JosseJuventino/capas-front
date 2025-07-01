"use client";

import { useState } from "react";
import Table from "@/app/components/Tables/Table";
import { Column, Tutor } from "@/app/types/types";
import PageHeader from "@/app/components/Dashboard/PageHeader";
import { Plus, AlertCircle } from "lucide-react";
import { DeleteModal } from "@/app/components/Popups/DeleteModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ListGridLayout from "@/app/components/Dashboard/ListGridLayout";
import { Loading } from "@/app/components/Loading";
import { addTutor, deleteTutor, getTutors } from "@/app/services/tutors.service";
import CardTutor from "@/app/components/CardViews/CardTutor";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { FormModalTutor } from "@/app/components/Popups/AddTutorModal";
import { toast } from "@pheralb/toast";

const ContactInfo = ({ email }: { email: string }) => (
    <div className="flex flex-col">
        <span>{email}</span>
    </div>
);

export default function TutorPage() {
    const [modalState, setModalState] = useState<{
        type: 'add' | 'edit' | 'delete' | null;
        selected: Tutor | null;
    }>({ type: null, selected: null });

    const queryClient = useQueryClient();

    const [isCardView, setIsCardView] = useState(false);

    const {
        data: tutores,
        error,
        isLoading,
        isError,
    } = useQuery<Tutor[], Error>({
        queryKey: ["tutor"],
        queryFn: getTutors,
        retry: 1, // Solo intenta una vez más si falla
    });

    const columns: Column<Tutor>[] = [
        {
            header: "Imagen",
            accessor: (row) => (
                <img
                    src={row.image}
                    alt={`Avatar de ${row.nombre}`}
                    className="w-10 h-10 rounded-full object-cover"
                />
            )
        },
        { header: "Nombre", accessor: "nombre" },
        {
            header: "Contacto",
            accessor: (row) => <ContactInfo email={row.email} />
        },
        {
            header: "Secciones",
            accessor: (row) => (
                <div className="flex items-center -space-x-2 hover:space-x-1 transition-spacing cursor-pointer">
                    {row.workgroups.slice(0, 3).map((seccion, index) => (
                        <div
                            key={index}
                            className="relative "
                            data-tooltip-id="avatar-tooltip"
                            data-tooltip-content={seccion}
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center shadow-sm">
                                <span className="text-xs font-medium text-blue-600">
                                    {seccion.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>
                        </div>
                    ))}
                    {row.workgroups.length > 3 && (
                        <span
                            className="text-sm text-gray-500 ml-2"
                            data-tooltip-id="remaining-tooltip"
                            data-tooltip-content={row.workgroups.slice(3).join(', ')}
                        >
                            + {row.workgroups.length - 3} más
                        </span>
                    )}
                </div>
            ),
        },
    ];

    const addTutorMutation = useMutation({
        mutationFn: addTutor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tutor'] });
            toast.success({
                text: "Tutor agregado exitosamente",
            });
        },
        onError: (error) => {
            toast.error({
                text: "Error al agregar el tutor",
            });
            console.error("Error al crear tutor:", error);
        }
    });

    const deleteTutorMutation = useMutation({
        mutationFn: deleteTutor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tutor'] });
        },
    });

    const handleAdd = async (newTutor: Tutor) => {
        await addTutorMutation.mutateAsync(newTutor);
        closeModal();
    };

    const handleDelete = async () => {
        if (!modalState.selected) return;
        try {
            toast.loading({
                text: "Eliminando tutor...",
                options: {
                    promise: deleteTutorMutation.mutateAsync(modalState.selected._id),
                    success: "Tutor eliminado exitosamente",
                    error: "Error al eliminar el tutor",
                    autoDismiss: true,
                    onSuccess: () => {
                        closeModal();
                        queryClient.invalidateQueries({ queryKey: ['tutor'] });
                    },
                    onError: (error) => {
                        console.error("Error de eliminacion:", error);
                    }
                }
            });
        } catch {
            throw new Error("Error al eliminar el tutor");
        }
    };

    const closeModal = () => setModalState({ type: null, selected: null, });

    // Usar un array vacío si hay error o no hay datos
    const safeTutores = tutores ?? [];

    return (
        <div className="p-10">
            <PageHeader
                title="Tutores"
                buttons={[
                    {
                        label: "Nuevo Tutor",
                        icon: <Plus size={18} />,
                        onClick: () => setModalState({ type: 'add', selected: null }),
                        className: "bg-blue_principal text-white px-4 py-2 rounded-lg shadow-md transition-transform hover:scale-105"
                    },
                ]}
            />

            <ListGridLayout isCardView={isCardView} setIsCardView={setIsCardView} />

            {/* Mostrar loading solo si está cargando */}
            {isLoading && (
                <div className="mt-8">
                    <Loading />
                </div>
            )}

            {/* Mostrar error si hay error, pero no bloquear el resto */}
            {isError && !isLoading && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="text-red-600" size={20} />
                    <div>
                        <p className="text-red-800 font-medium">Error al cargar los tutores</p>
                        <p className="text-red-600 text-sm">{error?.message || "Por favor, intenta de nuevo más tarde"}</p>
                        <button 
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['tutor'] })}
                            className="mt-2 text-sm text-red-700 underline hover:text-red-800"
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                </div>
            )}

            {/* Mostrar contenido si no está cargando */}
            {!isLoading && (
                <>
                    {/* Mensaje cuando no hay tutores pero no hay error */}
                    {!isError && safeTutores.length === 0 && (
                        <div className="mt-8 text-center p-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-600 mb-4">No hay tutores registrados aún</p>
                            <button
                                onClick={() => setModalState({ type: 'add', selected: null })}
                                className="bg-blue_principal text-white px-6 py-2 rounded-lg shadow-md transition-transform hover:scale-105 inline-flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Agregar primer tutor
                            </button>
                        </div>
                    )}

                    {/* Mostrar tabla/cards solo si hay tutores */}
                    {safeTutores.length > 0 && (
                        isCardView ? (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {safeTutores.map((tutor) => (
                                    <CardTutor
                                        key={tutor._id}
                                        tutor={tutor}
                                        setModalState={setModalState}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="mt-4">
                                <Table
                                    data={safeTutores}
                                    columns={columns}
                                    loading={false}
                                    hasEdit={false}
                                    onDelete={(id) => {
                                        const selected = safeTutores.find(r => r._id === id);
                                        if (selected) {
                                            setModalState({ type: 'delete', selected });
                                        }
                                    }}
                                />
                            </div>
                        )
                    )}
                </>
            )}

            <FormModalTutor
                isOpen={modalState.type === 'add'}
                title="Nuevo tutor"
                onClose={closeModal}
                onSubmit={handleAdd}
            />

            <DeleteModal<Tutor>
                isOpen={modalState.type === 'delete'}
                title="Eliminar tutor"
                item={modalState.selected!}
                onClose={closeModal}
                onConfirm={handleDelete}
                description={(item) => (
                    <p>
                        ¿Estás seguro de eliminar al tutor{" "}
                        <strong className="text-red-600">{item?.nombre}</strong>?
                        <br />
                        <span className="text-sm text-gray-500">Esta acción no se puede deshacer</span>
                    </p>
                )}
            />

            <ReactTooltip
                id="professor-tooltip"
                className="z-50"
                place="top"
            />
            <ReactTooltip
                id="avatar-tooltip"
                className="z-50"
                place="top"
            />
            <ReactTooltip
                id="remaining-tooltip"
                className="z-50"
                place="top"
            />
        </div>
    );
}