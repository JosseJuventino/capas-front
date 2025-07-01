"use client";
import { useState, useRef, useEffect } from "react";
import { FileText, X, Plus, Image as ImageIcon, File } from "lucide-react";
import { FileNew } from "@/app/types/types";
import { toast } from "@pheralb/toast";

interface MultiFileSelectorProps {
  initialFiles?: Array<Partial<FileNew>>;
  setFiles?: (files: (File | Partial<FileNew>)[]) => void;
}

export const MultiFileSelector: React.FC<MultiFileSelectorProps> = ({
  initialFiles = [],
  setFiles,
}) => {
  const [selectedItems, setSelectedItems] = useState<(File | Partial<FileNew>)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILES = 5;

  useEffect(() => {
    console.log("MultiFileSelector - initialFiles recibidos:", initialFiles);
    if (initialFiles && initialFiles.length > 0) {
      console.log("Estableciendo archivos iniciales:", initialFiles);
      setSelectedItems(initialFiles);
      // También actualizar el padre cuando se cargan los archivos iniciales
      if (setFiles) {
        setFiles(initialFiles);
      }
    } else {
      setSelectedItems([]);
    }
  }, [initialFiles]);

  // Validar si el archivo es de imagen o documento (pdf, doc, docx)
  const validateFileType = (file: File) => {
    return (
      file.type.startsWith("image/") ||
      file.type === "application/pdf" ||
      file.type === "application/msword" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  };

  const addFileItem = (selectedFile: File) => {
    if (selectedItems.length >= MAX_FILES) {
      toast.error({
        text: "Error",
        description: `Máximo ${MAX_FILES} archivos permitidos`,
      });
      return;
    }

    if (!validateFileType(selectedFile)) {
      toast.error({
        text: "Error",
        description: "Tipo de archivo no permitido",
      });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error({
        text: "Error",
        description: "El archivo no puede ser mayor a 5MB",
      });
      return;
    }

    const newItems = [...selectedItems, selectedFile];
    setSelectedItems(newItems);

    if (setFiles) {
      setFiles(newItems);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (selectedItems.length < MAX_FILES) {
          addFileItem(file);
        }
      });
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeItem = (index: number) => {
    const newItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(newItems);

    if (setFiles) {
      setFiles(newItems);
    }
  };

  // Helper para determinar si es una imagen
  const isImage = (item: File | Partial<FileNew>) => {
    if ('type' in item && item.type) {
      return (item as File).type.startsWith('image/');
    }
    if ('originalFileName' in item && item.originalFileName) {
      return /\.(png|jpe?g|gif|bmp|webp)$/i.test(item.originalFileName);
    }
    return false;
  };

  // Helper para obtener el nombre del archivo
  const getFileName = (item: File | Partial<FileNew>) => {
    if ('originalFileName' in item) {
      return item.originalFileName || 'Archivo sin nombre';
    }
    return (item as File).name;
  };

  // Helper para obtener la URL del archivo
  const getFileUrl = (item: File | Partial<FileNew>) => {
    if ('url' in item && item.url) {
      return item.url;
    }
    return URL.createObjectURL(item as File);
  };

  return (
    <div className="space-y-3">
      {/* Botón para seleccionar archivos */}
      <div className="flex gap-2">
        <label className="block text-medium text-[#003C71] font-medium">
          Archivos adjuntos
        </label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple
          accept="image/png,image/jpg,image/jpeg,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
        />
      </div>

      {selectedItems.length === 0 && (
        <div 
          className="space-y-1 cursor-pointer border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors" 
          onClick={() => fileInputRef.current?.click()}
        >
          <FileText className="w-5 h-5 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-500 text-center">
            Seleccione un máximo de {MAX_FILES} archivos
          </p>
          <p className="text-sm text-gray-500 text-center">
            PDF, DOCX, JPG, PNG
          </p>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="grid grid-cols-4 gap-2 items-center">
          {selectedItems.map((item, index) => (
            <div
              key={index}
              className="relative group flex flex-col items-center justify-center gap-2
                 border border-gray-200 rounded-md p-2 min-h-[80px]"
            >
              {isImage(item) ? (
                <ImageIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <File className="w-5 h-5 text-gray-400" />
              )}
              
              <p className="text-xs max-w-full truncate px-1" title={getFileName(item)}>
                {getFileName(item)}
              </p>

              {/* Enlace para ver el archivo */}
              {'url' in item && item.url && (
                <a
                  href={getFileUrl(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">Ver archivo</span>
                </a>
              )}

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeItem(index);
                }}
                type="button"
                className="absolute top-1 right-1 text-gray-600 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {selectedItems.length < MAX_FILES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group flex flex-col items-center justify-center gap-2
                       border border-gray-200 rounded-md p-2 min-h-[80px] cursor-pointer
                       hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiFileSelector;