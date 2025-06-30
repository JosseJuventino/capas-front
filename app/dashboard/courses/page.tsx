"use client"

import { useState } from "react";
import PageHeader from "../../components/Dashboard/PageHeader";
import Table from "../../components/Tables/Table";
import ListGridLayout from "../../components/Dashboard/ListGridLayout";
import { Column, Course, CourseAddInterface, Image as ImageFile } from "@/app/types/types";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { createCourse, getCourses } from "@/app/services/course.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loading } from "../../components/Loading";
import ServerErrorPage from "@/app/error";
import Link from "next/link";
import { Plus } from "lucide-react";
import { RoleGuard } from "@/app/components/Dashboard/RoleGuard";
import { ROLES } from "@/app/constants/roles";
import { uploadImage } from "@/app/services/images.service";
import { AddCourseModal } from "@/app/components/Popups/AddCourseModal";


const CourseCard = ({ course }: { course: Course }) => (
    <Link
        href={`/dashboard/my-courses/${course.slug}`}
        className="relative cursor-pointer rounded-xl bg-center shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-48 group"
        style={{
            backgroundImage: `url(${course.backgroundImage})`,
            backgroundSize: '120%',
            backgroundPosition: 'center',
            transition: 'background-size 0.3s ease'
        }}
    >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 flex flex-col justify-end">
            <div className="transform transition-transform group-hover:translate-y-1">
                <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md">
                    {course.nombre}
                </h3>
            </div>
        </div>
    </Link>
);

const columns: Column<Course>[] = [
    {
        header: "Curso",
        accessor: (course) => (
            <Link href={`/dashboard/my-courses/${course.slug}`} className="flex items-center gap-3 group">
                <div
                    className="w-8 h-8 rounded-lg bg-cover bg-center shadow-sm"
                    style={{ backgroundImage: `url(${course.backgroundImage})` }}
                />
                <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                    {course.nombre}
                </span>
            </Link>
        ),
    },
];

export default function CoursesPage() {
    const [isCardView, setIsCardView] = useState(true);

    const queryClient = useQueryClient();
    const [modalState, setModalState] = useState<{
        type: "add" | "edit" | "delete" | null;
        selected: CourseAddInterface | null;
    }>({ type: null, selected: null });

    const {
        data: cursos,
        isLoading,
        isError,
    } = useQuery<Course[]>({
        queryKey: ["cursosNuevos"],
        queryFn: getCourses,
        staleTime: 60 * 1000,
    });

    const uploadImageMutation = useMutation({
        mutationFn: uploadImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cursosNuevos"] });
        },
    });

    const createCourseMutation = useMutation({
        mutationFn: createCourse,
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["cursosNuevos"],
          });
        },
      });

    const closeModal = () => {
        setModalState({ type: null, selected: null });
    };

    const handleAddCourse = async (course: CourseAddInterface, image: File | string | null) => {
        const updateData: CourseAddInterface = {
            workGroupName: course.workGroupName,
            backgroundImageId: course.backgroundImageId,
            userIds: course.userIds,
        };
        try {
            let imageId = course.backgroundImageId;

            if (image instanceof File) {
                if (!image.type.startsWith("image/")) {
                    throw new Error("Solo se permiten imágenes");
                }

                if (image.size > 5 * 1024 * 1024) {
                    throw new Error("Tamaño máximo de imagen: 5MB");
                }

                const imagen: ImageFile = {
                    originalFilename: image.name,
                    category: "workgroups",
                    file: image,
                };

                const imageResponse = await uploadImageMutation.mutateAsync(imagen);
                imageId = imageResponse.data.id;



            } else if (typeof image === "string") {
                updateData.backgroundImageId = image;
            }

            updateData.backgroundImageId = imageId;
            updateData.workGroupName = course.workGroupName;
            updateData.userIds = course.userIds;

            console.log("Datos a actualizar:", updateData);

            const courseResponse = await createCourseMutation.mutateAsync(updateData);

            console.log("Curso creado:", courseResponse);

        } catch (error) {
            console.error("Error al agregar el curso:", error);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return <ServerErrorPage />;
    }

    if (!cursos || cursos.length === 0) {
        return <div className="p-10 text-center">No tienes cursos asignados</div>;
    }

    return (
        <div className='p-10'>
            <PageHeader
                title="Cursos"
                buttons={[
                    {
                        label: "Agregar Curso",
                        icon: <Plus size={18} />,
                        onClick: () => {
                            setModalState({ type: "add", selected: null });
                        },
                        className: "bg-blue_principal text-white px-4 py-2 rounded-lg shadow-md transition-transform hover:scale-105"
                    },
                ]}
            />


            <ListGridLayout isCardView={isCardView} setIsCardView={setIsCardView} />

            {isCardView ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cursos && cursos?.map((course) => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="mt-4  bg-white rounded-lg shadow-md">
                    <Table
                        data={cursos ?? []}
                        columns={columns}
                        loading={false}
                        hasEdit={false}
                        onDelete={(id) => console.log("Eliminar:", id)}
                    />
                </div>
            )}

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

            <RoleGuard
                allowedRoles={[ROLES.ADMIN, ROLES.PROFESOR, ROLES.TUTOR]}
            >
                <AddCourseModal
                    isOpen={modalState.type === "add"}
                    title="Agregar curso"
                    initialData={modalState.selected!}
                    onClose={closeModal}
                    onSubmit={handleAddCourse}
                />
            </RoleGuard>
        </div>
    );
}