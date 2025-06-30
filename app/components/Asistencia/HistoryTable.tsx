import React, { JSX } from "react";


interface HistoryTableProps {
    isAlumno: boolean;
    alumno: {
        _id: string;
        alumnoId?: string;
        userId?: string;
        nombre: string;
        image: string;
        email: string;
        telefono: string;
        hora_inicio?: string;
        hora_fin?: string;
    };
    sabadosDelMes: Date[];
    getEstadoAsistencia: (alumnoId: string, fecha: Date) => string | null;
    getIconoEstado: (estado: string | null) => JSX.Element | null;
}

export default function HistoryTable({ isAlumno, alumno, sabadosDelMes, getEstadoAsistencia, getIconoEstado }: HistoryTableProps) {
    return (
        <tr key={alumno._id} className="hover:bg-gray-50">
            <td className="py-2 flex flex-row justify-center gap-2 px-4 border-b border-gray-300">
                <div>
                    <img
                        src={alumno.image}
                        alt={`Avatar de ${alumno.nombre}`}
                        className="w-10 h-10 rounded-full object-cover"
                        width={300}
                        height={300}
                    />
                </div>
            </td>

            <td className="py-2 gap-2 px-4 border-b text-center border-gray-300">
                {alumno.nombre}
            </td>

            {sabadosDelMes.map((sabado, idx) => {
                const estado = getEstadoAsistencia(alumno._id, sabado);
                return (
                    <td key={idx} className="py-2 px-4 border-b text-center border-gray-300">
                        <div
                            key={alumno._id}
                            className="relative "
                            data-tooltip-id="avatar-tooltip"
                            data-tooltip-content={
                                !isAlumno && alumno.hora_fin && alumno.hora_inicio
                                    ? String(parseFloat(alumno.hora_fin) - parseFloat(alumno.hora_inicio))
                                    : alumno.nombre
                            }
                        >
                            <div className="relative flex flex-row justify-center group">
                                {getIconoEstado(estado)}
                            </div>
                        </div>
                    </td>
                );
            })}

        </tr>

    );
}