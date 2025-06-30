"use client";
import { Info, Target, Award } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-white py-8 px-6 md:px-12">
        <h1 className="text-3xl font-bold text-center text-[#003C71]">
          Círculos de Estudio
        </h1>
        <p className="mt-2 text-center text-gray-500 italic">
          “Aprender juntos, crecer juntos”
        </p>
      </div>

      {/* Definición, objetivos y prioridad */}
      <div className="max-w-5xl mx-auto px-4 md:px-0 mt-12 space-y-8">
        <h2 className="text-2xl font-semibold text-[#003C71] text-center">
          Definición, objetivos y prioridad
        </h2>

        {/* ¿Qué es? */}
        <div className="bg-white rounded-lg p-6 flex items-start space-x-4">
          <Info className="w-8 h-8 text-[#003C71] mt-1" />
          <div>
            <h3 className="text-xl font-medium text-[#003C71] mb-2">
              ¿Qué es el Servicio Social?
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Es la colaboración no remunerada que realiza el estudiantado, dirigida a apoyar proyectos o actividades con finalidad social o educativa, orientados al desarrollo sostenible del país.
            </p>
          </div>
        </div>

        {/* Objetivos */}
        <div className="bg-white rounded-lg p-6 flex items-start space-x-4">
          <Target className="w-8 h-8 text-[#003C71] mt-1" />
          <div>
            <h3 className="text-xl font-medium text-[#003C71] mb-2">
              Objetivos
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                Promover el contacto del estudiantado con la realidad del país, para contribuir al bien común.
              </li>
              <li>
                Brindar oportunidad para que el estudiantado ponga sus conocimientos técnicos y científicos al servicio de los sectores sociales más necesitados.
              </li>
              <li>
                Apoyar las actividades de la Universidad, priorizando las funciones básicas de docencia, investigación y proyección social.
              </li>
              <li>
                Facilitar que los estudiantes presten el servicio social como requisito para obtener la calidad de egresado, de acuerdo con la LES.
              </li>
            </ul>
          </div>
        </div>

        {/* Prioridad */}
        <div className="bg-white rounded-lg p-6 flex items-start space-x-4">
          <Award className="w-8 h-8 text-[#003C71] mt-1" />
          <div>
            <h3 className="text-xl font-medium text-[#003C71] mb-2">
              Prioridad
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                Actividades o proyectos que beneficien a sectores débiles, vulnerables y pobres.
              </li>
              <li>
                Iniciativas útiles a la sociedad que no estén siendo atendidas por la Universidad u otras instituciones.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pie de página */}
      <footer className="mt-16 py-6 bg-white text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Círculos de Estudio. Todos los derechos reservados.
      </footer>
    </div>
  );
}
