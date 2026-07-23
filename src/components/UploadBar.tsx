import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { prepararImagen } from "../lib/image";

function UploadBar() {
  const [file, setFile] = useState<File | null>(null);
  const [codigo, setCodigo] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const codigoInputRef = useRef<HTMLInputElement>(null);

  const cerrarError = () => {
    setMensajeError("");

    setTimeout(() => {
      codigoInputRef.current?.focus();
      codigoInputRef.current?.select();
    }, 0);
  };

  useEffect(() => {
    function cerrarConEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      if (mensajeError) {
        cerrarError();
        return;
      }

      if (mensajeExito) {
        setMensajeExito("");
      }
    }

    window.addEventListener("keydown", cerrarConEscape);

    return () => {
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [mensajeError, mensajeExito]);

  const mostrarError = (mensaje: string) => {
    setMensajeError(mensaje);
  };

  const subirPostal = async () => {
    if (!file) {
      mostrarError("Busca tu postal");
      return;
    }

    if (!codigo.trim()) {
      mostrarError("Introduce el código");
      return;
    }

    const codigoLimpio = codigo.trim().toUpperCase();

    if (!codigoLimpio.match(/^[ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/)) {
      mostrarError("Código no válido");
      return;
    }

    const { data: casillaData, error: errorCodigo } = await supabase
      .from("casillas")
      .select("numero, publicada")
      .eq("codigo", codigoLimpio)
      .single();

    if (errorCodigo || !casillaData) {
      mostrarError("Código no válido");
      return;
    }

    if (casillaData.publicada) {
      mostrarError("Este código ya ha sido utilizado");
      return;
    }

    const casilla = casillaData.numero;

    const imagenPreparada = await prepararImagen(file);
    const nombreArchivo = `${Date.now()}.jpg`;

    const { error: errorStorage } = await supabase.storage
      .from("postales")
      .upload(nombreArchivo, imagenPreparada);

    if (errorStorage) {
      console.error(errorStorage);
      mostrarError(errorStorage.message);
      return;
    }

    const { data } = supabase.storage
      .from("postales")
      .getPublicUrl(nombreArchivo);

    const urlImagen = data.publicUrl;

    const { error: errorPostales } = await supabase.from("postales").insert({
      codigo: codigoLimpio,
      casilla,
      imagen: nombreArchivo,
      url: urlImagen,
      imagen_original: nombreArchivo,
      url_original: urlImagen,
      publicada: true,
    });

    if (errorPostales) {
      console.error(errorPostales);
      mostrarError(errorPostales.message);
      return;
    }

    const { error: errorCasillas } = await supabase.rpc(
  "publicar_postal",
  {
    codigo_recibido: codigo,
    nombre_imagen: nombreArchivo,
    url_imagen: urlImagen,
  }
);

    if (errorCasillas) {
      console.error(errorCasillas);
      mostrarError(errorCasillas.message);
      return;
    }

    setMensajeExito(
      `Postal guardada correctamente en la casilla ${casilla}`
    );

    setFile(null);
    setCodigo("");

    setTimeout(() => {
      setMensajeExito("");
      window.location.reload();
    }, 2500);
  };

  return (
    <>
      {mensajeError && (
        <div className="mensaje-exito">
          <button
            type="button"
            className="mensaje-exito-cerrar"
            onClick={cerrarError}
            aria-label="Cerrar aviso"
          >
            ×
          </button>

          <span>{mensajeError}</span>
        </div>
      )}

      {mensajeExito && (
        <div className="mensaje-exito">
          <button
            type="button"
            className="mensaje-exito-cerrar"
            onClick={() => setMensajeExito("")}
            aria-label="Cerrar aviso"
          >
            ×
          </button>

          <span>{mensajeExito}</span>
        </div>
      )}

      <footer className="upload-bar">
        <label className="file-button">
          {file ? file.name : "Busca tu postal"}

          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.length) {
                setFile(e.target.files[0]);
              }
            }}
          />
        </label>

        <input
          ref={codigoInputRef}
          className="code-input"
          type="text"
          placeholder="introduce el código"
          value={codigo}
          maxLength={6}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
        />

        <button className="add-button" onClick={subirPostal}>
          Añadir a la galería
        </button>
      </footer>
    </>
  );
}

export default UploadBar;