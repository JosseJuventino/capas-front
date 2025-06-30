import { useCallback, useRef, useState } from "react";
import { toast } from "@pheralb/toast";

export const useCamera = (
  isMobile: boolean,
  setPreview: React.Dispatch<React.SetStateAction<string | null>>,
  formData: React.MutableRefObject<{ imagen: string }>,
  fileInputRef: React.RefObject<HTMLInputElement | null> // <— recibe la referencia aquí
) => {
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    // 1. ¿Soporta cámara?
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error({text: "Tu navegador no soporta acceso a la cámara. Por favor, usa un navegador moderno como Chrome, Firefox o Safari."});
      // fallback
      fileInputRef.current?.click();
      return;
    }

    // Si es móvil, disparamos input file directamente
    if (isMobile) {
      fileInputRef.current?.click();
      return;
    }

    try {
      setCameraActive(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      console.error("Error al iniciar cámara:", err);
      // 2. Mensajes personalizados según el error
      switch ((err as Error).name) {
        case "NotAllowedError":
          toast.error({text: "Permiso denegado para acceder a la cámara. Por favor, permite el acceso en la configuración del navegador."});
          break;
        case "NotReadableError":
          toast.error({text: "La cámara está siendo usada por otra aplicación o no disponible."});
          break;
        default:
          toast.error({text: `Error al iniciar cámara: ${(err as Error).message}`});
      }
      stopCamera();
      // 3. Fallback a file input
      fileInputRef.current?.click();
    }
  }, [isMobile, fileInputRef, stopCamera]);

  const handleTakePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setPreview(dataUrl);
    formData.current.imagen = dataUrl;
    stopCamera();
  }, [setPreview, formData, stopCamera]);

  const handleRetakePhoto = useCallback(() => {
    setPreview(null);
    formData.current.imagen = "";
    startCamera();
  }, [setPreview, formData, startCamera]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error({text: "El archivo seleccionado no es una imagen"});
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        formData.current.imagen = result;
        stopCamera();
      };
      reader.readAsDataURL(file);
    },
    [setPreview, formData, stopCamera]
  );

  return {
    cameraActive,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    handleTakePhoto,
    handleRetakePhoto,
    handleFileChange,
  };
};
