import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { supabase } from "../lib/supabase";
import "../styles/admin.css";

import {
  FiArrowRight,
  FiArrowUp,
  FiMapPin,
  FiHash,
  FiLock,
  FiUnlock,
  FiRotateCw,
  FiCrop,
  FiRefreshCcw,
  FiTrash2,
  FiSave,
} from "react-icons/fi";

type Casilla = {
  numero: number;
  codigo: string | null;
  ciudad: string | null;
  direccion_postal: string | null;
  created_at: string | null;
  fecha_envio: string | null;
  fecha_subida: string | null;
  imagen: string | null;
  url: string | null;
  imagen_original: string | null;
  url_original: string | null;
  publicada: boolean | null;
  enviada: boolean;
  subida: boolean;
  bloqueada: boolean;
};

function Admin() {
  const [casillas, setCasillas] = useState<Casilla[]>([]);
  const [seleccionada, setSeleccionada] = useState<Casilla | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("todas");
  const [ciudadFiltro, setCiudadFiltro] = useState("todas");

  const [fechaEditable, setFechaEditable] = useState(false);
  const [ciudadEditable, setCiudadEditable] = useState(false);
  const [direccionEditable, setDireccionEditable] = useState(false);

  const [fechaTemporal, setFechaTemporal] = useState("");
  const [ciudadTemporal, setCiudadTemporal] = useState("");
  const [direccionTemporal, setDireccionTemporal] = useState("");

  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
const [confirmarRestaurar, setConfirmarRestaurar] = useState(false);
const [confirmarGuardar, setConfirmarGuardar] = useState(false);
const [recorteAbierto, setRecorteAbierto] = useState(false);
const [visorImagenAbierto, setVisorImagenAbierto] = useState(false);
const [posicionRecorte, setPosicionRecorte] = useState({
  x: 0,
  y: 0,
});

const [zoomRecorte, setZoomRecorte] = useState(1);

const [areaRecortePixeles, setAreaRecortePixeles] = useState<{
  x: number;
  y: number;
  width: number;
  height: number;
} | null>(null);
const [imagenTemporalUrl, setImagenTemporalUrl] = useState<string | null>(null);
const [imagenTemporalBlob, setImagenTemporalBlob] = useState<Blob | null>(null);
const [hayCambiosImagen, setHayCambiosImagen] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function cargarCasillas() {
      const { data, error } = await supabase
        .from("casillas")
        .select(`
          numero,
          codigo,
          ciudad,
          direccion_postal,
          created_at,
          fecha_envio,
          fecha_subida,
          imagen,
          url,
          imagen_original,
          url_original,
          publicada,
          enviada,
          subida,
          bloqueada
        `)
        .order("numero", { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      setCasillas(data || []);
    }

    cargarCasillas();
  }, []);

  useEffect(() => {
    setFechaTemporal(
      seleccionada?.fecha_envio
        ? new Date(seleccionada.fecha_envio).toLocaleDateString("es-ES")
        : ""
    );

    setCiudadTemporal(seleccionada?.ciudad || "");
    setDireccionTemporal(seleccionada?.direccion_postal || "");

    setFechaEditable(false);
setCiudadEditable(false);
setDireccionEditable(false);
setConfirmarEliminar(false);
setConfirmarRestaurar(false);

setImagenTemporalUrl(seleccionada?.url || null);
setImagenTemporalBlob(null);
setHayCambiosImagen(false);
  }, [seleccionada]);

  const ciudadesDisponibles = Array.from(
    new Set(
      casillas
        .map((casilla) => casilla.ciudad)
        .filter((ciudad): ciudad is string => Boolean(ciudad))
    )
  ).sort((a, b) => a.localeCompare(b, "es"));

  const casillasFiltradas = casillas.filter((casilla) => {
    const textoBusqueda = busqueda.toLowerCase();

    const coincideBusqueda =
      textoBusqueda === ""
        ? true
        : /^\d+$/.test(textoBusqueda)
        ? casilla.numero === Number(textoBusqueda)
        : (casilla.codigo || "").toLowerCase() === textoBusqueda;

    const coincideEstado =
      estado === "todas" ||
      (estado === "enviadas" && casilla.enviada) ||
      (estado === "subidas" && casilla.subida) ||
      (estado === "bloqueadas" && casilla.bloqueada) ||
      (estado === "vacias" && !casilla.publicada);

    const coincideCiudad =
      ciudadFiltro === "todas" || casilla.ciudad === ciudadFiltro;

    return coincideBusqueda && coincideEstado && coincideCiudad;
  });

  function actualizarCasillaLocal(casillaActualizada: Casilla) {
    setSeleccionada(casillaActualizada);

    setCasillas((casillasActuales) =>
      casillasActuales.map((casilla) =>
        casilla.numero === casillaActualizada.numero ? casillaActualizada : casilla
      )
    );
  }

  async function cambiarEnviada() {
    if (!seleccionada) return;

    const nuevoValor = !seleccionada.enviada;
    const nuevaFechaEnvio = nuevoValor ? new Date().toISOString().slice(0, 10) : null;

    const { error } = await supabase
      .from("casillas")
      .update({
        enviada: nuevoValor,
        fecha_envio: nuevaFechaEnvio,
      })
      .eq("numero", seleccionada.numero);

    if (error) {
      console.error(error);
      alert("No se pudo actualizar Enviada");
      return;
    }

    actualizarCasillaLocal({
      ...seleccionada,
      enviada: nuevoValor,
      fecha_envio: nuevaFechaEnvio,
    });
  }

  async function cambiarBloqueada() {
    if (!seleccionada) return;

    const nuevoValor = !seleccionada.bloqueada;

    const { error } = await supabase
      .from("casillas")
      .update({ bloqueada: nuevoValor })
      .eq("numero", seleccionada.numero);

    if (error) {
      console.error(error);
      alert("No se pudo actualizar Bloqueada");
      return;
    }

    actualizarCasillaLocal({
      ...seleccionada,
      bloqueada: nuevoValor,
    });
  }

  async function restaurarOriginal() {
  if (!seleccionada) return;

  if (!seleccionada.imagen_original || !seleccionada.url_original) {
    alert("No hay imagen original guardada para esta postal");
    return;
  }

  const { error: errorCasilla } = await supabase
    .from("casillas")
    .update({
      imagen: seleccionada.imagen_original,
      url: seleccionada.url_original,
    })
    .eq("numero", seleccionada.numero);

  if (errorCasilla) {
    console.error(errorCasilla);
    alert("No se pudo restaurar la imagen original");
    return;
  }

  const { error: errorPostales } = await supabase
    .from("postales")
    .update({
      imagen: seleccionada.imagen_original,
      url: seleccionada.url_original,
    })
    .eq("casilla", seleccionada.numero);

  if (errorPostales) {
    console.error(errorPostales);
    alert("La imagen se restauró en casillas, pero no en postales");
  }

  if (
  seleccionada.imagen &&
  seleccionada.imagen !== seleccionada.imagen_original
) {
  const { error: errorBorrado } = await supabase.storage
    .from("postales")
    .remove([seleccionada.imagen]);

  if (errorBorrado) {
    console.error(errorBorrado);
    alert("La imagen original se restauró, pero no se pudo borrar la imagen modificada");
  }
}

const casillaActualizada = {
  ...seleccionada,
  imagen: seleccionada.imagen_original,
  url: seleccionada.url_original,
};

actualizarCasillaLocal(casillaActualizada);

setImagenTemporalBlob(null);
setImagenTemporalUrl(casillaActualizada.url);
setHayCambiosImagen(false);
}

async function girarImagen() {
  const urlActual = imagenTemporalUrl || seleccionada?.url;

  if (!seleccionada || !urlActual) {
    alert("No hay imagen para girar");
    return;
  }

  try {
    const respuesta = await fetch(urlActual);
    const blobOriginal = await respuesta.blob();
    const bitmap = await createImageBitmap(blobOriginal);

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.height;
    canvas.height = bitmap.width;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      alert("No se pudo preparar la imagen");
      return;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

    const blobGirado = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });

    if (!blobGirado) {
      alert("No se pudo generar la imagen girada");
      return;
    }

    const urlTemporal = URL.createObjectURL(blobGirado);

    setImagenTemporalBlob(blobGirado);
    setImagenTemporalUrl(urlTemporal);
    setHayCambiosImagen(true);

  } catch (error) {
    console.error(error);
    alert("No se pudo girar la imagen");
  }
}
async function aplicarRecorte() {
  if (!imagenTemporalUrl || !areaRecortePixeles) {
    return;
  }

  try {
    const respuesta = await fetch(imagenTemporalUrl);
    const blobOriginal = await respuesta.blob();
    const bitmap = await createImageBitmap(blobOriginal);

    const canvas = document.createElement("canvas");
    canvas.width = areaRecortePixeles.width;
    canvas.height = areaRecortePixeles.height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      alert("No se pudo preparar el recorte");
      return;
    }

    ctx.drawImage(
      bitmap,
      areaRecortePixeles.x,
      areaRecortePixeles.y,
      areaRecortePixeles.width,
      areaRecortePixeles.height,
      0,
      0,
      areaRecortePixeles.width,
      areaRecortePixeles.height
    );

    const blobRecortado = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });

    if (!blobRecortado) {
      alert("No se pudo generar la imagen recortada");
      return;
    }

    const nuevaUrlTemporal = URL.createObjectURL(blobRecortado);

    setImagenTemporalBlob(blobRecortado);
    setImagenTemporalUrl(nuevaUrlTemporal);
    setHayCambiosImagen(true);
    setRecorteAbierto(false);
  } catch (error) {
    console.error(error);
    alert("No se pudo aplicar el recorte");
  }
}
async function guardarCambiosImagen() {
  if (!seleccionada || !imagenTemporalBlob || !hayCambiosImagen) {
    return;
  }

  const nuevoArchivo = `${seleccionada.numero}-${Date.now()}.jpg`;

  const { error: errorStorage } = await supabase.storage
    .from("postales")
    .upload(nuevoArchivo, imagenTemporalBlob, {
      contentType: "image/jpeg",
    });

  if (errorStorage) {
    console.error(errorStorage);
    alert(errorStorage.message);
    return;
  }

  const { data } = supabase.storage
    .from("postales")
    .getPublicUrl(nuevoArchivo);

  const nuevaUrl = data.publicUrl;

  const { error: errorCasilla } = await supabase
    .from("casillas")
    .update({
      imagen: nuevoArchivo,
      url: nuevaUrl,
    })
    .eq("numero", seleccionada.numero);

  if (errorCasilla) {
    console.error(errorCasilla);
    alert("No se pudo actualizar la casilla");
    return;
  }

  const { error: errorPostales } = await supabase
    .from("postales")
    .update({
      imagen: nuevoArchivo,
      url: nuevaUrl,
    })
    .eq("casilla", seleccionada.numero);

  if (errorPostales) {
    console.error(errorPostales);
    alert("La imagen se guardó en casillas, pero no en postales");
  }

  if (
    seleccionada.imagen &&
    seleccionada.imagen !== seleccionada.imagen_original
  ) {
    await supabase.storage.from("postales").remove([seleccionada.imagen]);
  }

  const casillaActualizada = {
  ...seleccionada,
  imagen: nuevoArchivo,
  url: nuevaUrl,
};

actualizarCasillaLocal(casillaActualizada);

setImagenTemporalBlob(null);
setImagenTemporalUrl(casillaActualizada.url);
setHayCambiosImagen(false);
}

  async function guardarFechaEnvio() {
    if (!seleccionada) return;

    let fechaBD: string | null = null;

    if (fechaTemporal.trim() !== "") {
      const partes = fechaTemporal.split("/");

      if (partes.length !== 3) {
        alert("La fecha debe tener el formato dd/mm/aaaa");
        return;
      }

      const [dia, mes, anio] = partes;

      fechaBD = `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
    }

    const { error } = await supabase
      .from("casillas")
      .update({ fecha_envio: fechaBD })
      .eq("numero", seleccionada.numero);

    if (error) {
      console.error(error);
      alert("No se pudo guardar la fecha");
      return;
    }

    actualizarCasillaLocal({
      ...seleccionada,
      fecha_envio: fechaBD,
    });

    setFechaEditable(false);
  }

  async function guardarCiudad() {
    if (!seleccionada) return;

    const ciudadLimpia = ciudadTemporal.trim();

    const { error } = await supabase
      .from("casillas")
      .update({ ciudad: ciudadLimpia || null })
      .eq("numero", seleccionada.numero);

    if (error) {
      console.error(error);
      alert("No se pudo guardar la ciudad");
      return;
    }

    actualizarCasillaLocal({
      ...seleccionada,
      ciudad: ciudadLimpia || null,
    });

    setCiudadEditable(false);
  }

  async function guardarDireccion() {
    if (!seleccionada) return;

    const direccionLimpia = direccionTemporal.trim();

    const { error } = await supabase
      .from("casillas")
      .update({ direccion_postal: direccionLimpia || null })
      .eq("numero", seleccionada.numero);

    if (error) {
      console.error(error);
      alert("No se pudo guardar la dirección");
      return;
    }

    actualizarCasillaLocal({
      ...seleccionada,
      direccion_postal: direccionLimpia || null,
    });

    setDireccionEditable(false);
  }

  async function eliminarPostal() {
    if (!seleccionada) return;

    const archivosAEliminar = [
      seleccionada.imagen,
      seleccionada.imagen_original,
    ].filter((archivo): archivo is string => Boolean(archivo));

    if (archivosAEliminar.length > 0) {
      const { error: errorStorage } = await supabase.storage
        .from("postales")
        .remove(archivosAEliminar);

      if (errorStorage) {
        console.error(errorStorage);
        alert("No se pudo eliminar la imagen del almacenamiento");
        return;
      }
    }

    const { error: errorPostales } = await supabase
      .from("postales")
      .delete()
      .eq("casilla", seleccionada.numero);

    if (errorPostales) {
      console.error(errorPostales);
      alert("No se pudo eliminar el registro de postales");
      return;
    }

    const { error: errorCasilla } = await supabase
      .from("casillas")
      .update({
        imagen: null,
        url: null,
        imagen_original: null,
        url_original: null,
        publicada: false,
        subida: false,
        bloqueada: false,
      })
      .eq("numero", seleccionada.numero);

    if (errorCasilla) {
      console.error(errorCasilla);
      alert("No se pudo limpiar la casilla");
      return;
    }

    const casillaLimpia: Casilla = {
      ...seleccionada,
      imagen: null,
      url: null,
      imagen_original: null,
      url_original: null,
      publicada: false,
      subida: false,
      bloqueada: false,
    };

    actualizarCasillaLocal(casillaLimpia);

setImagenTemporalBlob(null);
setImagenTemporalUrl(null);
setHayCambiosImagen(false);

setConfirmarEliminar(false);
  }

  function calcularColumnas() {
    if (!gridRef.current) return 1;

    const estilos = window.getComputedStyle(gridRef.current);
    const columnas = estilos.gridTemplateColumns.split(" ").length;

    return columnas || 1;
  }

  useEffect(() => {
    function manejarFlechas(event: KeyboardEvent) {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        return;
      }

      if (
  !seleccionada ||
  casillasFiltradas.length === 0 ||
  fechaEditable ||
  ciudadEditable ||
  direccionEditable ||
  confirmarEliminar ||
  confirmarRestaurar
) {
  return;
}

      event.preventDefault();

      const indiceActual = casillasFiltradas.findIndex(
        (casilla) => casilla.numero === seleccionada.numero
      );

      if (indiceActual === -1) return;

      const columnas = calcularColumnas();
      let nuevoIndice = indiceActual;

      if (event.key === "ArrowLeft") nuevoIndice = Math.max(0, indiceActual - 1);
      if (event.key === "ArrowRight") nuevoIndice = Math.min(casillasFiltradas.length - 1, indiceActual + 1);
      if (event.key === "ArrowUp") nuevoIndice = Math.max(0, indiceActual - columnas);
      if (event.key === "ArrowDown") nuevoIndice = Math.min(casillasFiltradas.length - 1, indiceActual + columnas);

      setSeleccionada(casillasFiltradas[nuevoIndice]);
    }

    window.addEventListener("keydown", manejarFlechas);

    return () => {
      window.removeEventListener("keydown", manejarFlechas);
    };
  }, [
    seleccionada,
    casillasFiltradas,
    fechaEditable,
    ciudadEditable,
    direccionEditable,
    confirmarEliminar,
    confirmarRestaurar,
  ]);
useEffect(() => {
  function cerrarVisorConEscape(event: KeyboardEvent) {
    if (event.key === "Escape" && visorImagenAbierto) {
      setVisorImagenAbierto(false);
    }
  }

  window.addEventListener("keydown", cerrarVisorConEscape);

  return () => {
    window.removeEventListener("keydown", cerrarVisorConEscape);
  };
}, [visorImagenAbierto]);
  const fechaEnvioFormateada = seleccionada?.fecha_envio
    ? new Date(seleccionada.fecha_envio).toLocaleDateString("es-ES")
    : "-";

  const fechaSubidaFormateada = seleccionada?.fecha_subida
  ? new Date(seleccionada.fecha_subida).toLocaleDateString("es-ES")
  : "";

  return (
    <div className="admin-page">
      <aside className="admin-panel">
        <div className="admin-title">
          <strong>PANEL DE ADMINISTRACIÓN</strong>
        </div>

        <section className="admin-section">
          <div className="admin-filtros-linea">
            <input
              className="admin-input admin-input-codigo"
              type="text"
              placeholder="Código o nº"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <select
              className="admin-input admin-input-estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="todas">Todas</option>
              <option value="enviadas">Enviadas</option>
              <option value="subidas">Subidas</option>
              <option value="bloqueadas">Bloqueadas</option>
              <option value="vacias">Vacías</option>
            </select>
          </div>

          <select
            className="admin-input admin-input-ciudad"
            value={ciudadFiltro}
            onChange={(e) => setCiudadFiltro(e.target.value)}
          >
            <option value="todas">Todas las ciudades</option>

            {ciudadesDisponibles.map((ciudad) => (
              <option key={ciudad} value={ciudad}>
                {ciudad}
              </option>
            ))}
          </select>
        </section>

        <section className="admin-section">
          <div
  className="admin-preview-empty"
  onClick={() => {
  if (imagenTemporalUrl) {
    setVisorImagenAbierto(true);
  }
}}
>
  {imagenTemporalUrl ? (
    <img src={imagenTemporalUrl} alt="" className="admin-preview-img" />
  ) : (
    "Sin casilla seleccionada"
  )}
</div>

          <div className="admin-info">
            <div className="admin-info-row admin-info-two">
              <span className="admin-edit-line">
                <FiArrowRight className="admin-info-icon" />

                {fechaEditable ? (
                  <input
                    className="admin-small-input"
                    type="text"
                    placeholder="dd/mm/aaaa"
                    value={fechaTemporal}
                    onChange={(e) => setFechaTemporal(e.target.value)}
                  />
                ) : (
                  <span className="admin-info-value">{fechaEnvioFormateada}</span>
                )}

                <button
                  className="admin-lock-button"
                  type="button"
                  onClick={async () => {
                    if (fechaEditable) {
                      await guardarFechaEnvio();
                    } else {
                      setFechaEditable(true);
                    }
                  }}
                >
                  {fechaEditable ? <FiUnlock /> : <FiLock />}
                </button>
              </span>

              <span>
                <FiArrowUp className="admin-info-icon" />{" "}
                <span className="admin-info-value">{fechaSubidaFormateada}</span>
              </span>
            </div>

            <div className="admin-info-row admin-info-two">
              <span className="admin-edit-line">
                <FiMapPin className="admin-info-icon" />

                {ciudadEditable ? (
                  <input
                    className="admin-small-input"
                    value={ciudadTemporal}
                    onChange={(e) => setCiudadTemporal(e.target.value)}
                  />
                ) : (
                  <span className="admin-info-value">{seleccionada?.ciudad || "-"}</span>
                )}

                <button
                  className="admin-lock-button"
                  type="button"
                  onClick={async () => {
                    if (ciudadEditable) {
                      await guardarCiudad();
                    } else {
                      setCiudadEditable(true);
                    }
                  }}
                >
                  {ciudadEditable ? <FiUnlock /> : <FiLock />}
                </button>
              </span>

              <span>
                <FiHash className="admin-info-icon" />{" "}
                <span className="admin-info-value">{seleccionada?.codigo || "-"}</span>
              </span>
            </div>

            <div className="admin-info-address-line">
              {direccionEditable ? (
                <input
                  className="admin-address-input"
                  value={direccionTemporal}
                  onChange={(e) => setDireccionTemporal(e.target.value)}
                  placeholder="Dirección postal"
                />
              ) : (
                <span className="admin-info-address">
                  {seleccionada?.direccion_postal || "-"}
                </span>
              )}

              <button
                className="admin-lock-button"
                type="button"
                onClick={async () => {
                  if (direccionEditable) {
                    await guardarDireccion();
                  } else {
                    setDireccionEditable(true);
                  }
                }}
              >
                {direccionEditable ? <FiUnlock /> : <FiLock />}
              </button>
            </div>
          </div>

          <div className="admin-status">
            <button
              className={`admin-status-button ${
                seleccionada?.enviada ? "status-enviada active" : "status-enviada"
              }`}
              onClick={cambiarEnviada}
            >
              Enviada
            </button>

            <button
              className={`admin-status-button ${
                seleccionada?.subida ? "status-subida active" : "status-subida"
              }`}
            >
              Subida
            </button>

            <button
              className={`admin-status-button ${
                seleccionada?.bloqueada ? "status-bloqueada active" : "status-bloqueada"
              }`}
              onClick={cambiarBloqueada}
            >
              Bloqueada
            </button>
          </div>

          <div className="admin-toolbar">
  <button
    className="admin-toolbar-button"
    type="button"
    onClick={girarImagen}
    disabled={!imagenTemporalUrl}
    title="Girar imagen"
  >
    <FiRotateCw />
  </button>

  <button
  className="admin-toolbar-button"
  type="button"
  onClick={() => {
    if (imagenTemporalUrl) {
      setRecorteAbierto(true);
      setPosicionRecorte({ x: 0, y: 0 });
      setZoomRecorte(1);
      setAreaRecortePixeles(null);
    }
  }}
  disabled={!imagenTemporalUrl}
  title="Recortar imagen"
>
  <FiCrop />
</button>

  <button
    className="admin-toolbar-button admin-toolbar-danger"
    type="button"
    onClick={() => {
      if (seleccionada?.url) {
        setConfirmarEliminar(true);
      }
    }}
    disabled={!seleccionada?.url}
    title="Eliminar postal"
  >
    <FiTrash2 />
  </button>

  <button
  className="admin-toolbar-button admin-toolbar-save"
  type="button"
  onClick={() => setConfirmarGuardar(true)}
  disabled={!hayCambiosImagen}
  title="Guardar cambios"
>
  <FiSave />
</button>

  <button
    className="admin-toolbar-button"
    type="button"
    onClick={() => {
      if (seleccionada?.url_original) {
        setConfirmarRestaurar(true);
      }
    }}
    disabled={!seleccionada?.url_original}
    title="Restaurar original"
  >
    <FiRefreshCcw />
  </button>
</div>

          {confirmarEliminar && (
  <div
    className="admin-modal-fondo"
    onClick={() => setConfirmarEliminar(false)}
  >
    <div
      className="admin-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Eliminar postal</h3>

      <p>¿Seguro que quieres eliminar esta postal?</p>

      <p>
        Se eliminará la fotografía de la galería y la casilla volverá a quedar vacía.
      </p>

      <div className="admin-modal-actions">
        <button
          type="button"
          className="admin-modal-cancel"
          onClick={() => setConfirmarEliminar(false)}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="admin-modal-delete"
          onClick={eliminarPostal}
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
)}

{confirmarRestaurar && (
  <div
    className="admin-modal-fondo"
    onClick={() => setConfirmarRestaurar(false)}
  >
    <div
      className="admin-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Recuperar imagen original</h3>

<p>¿Deseas recuperar la imagen original?</p>

<p>
  La imagen original se mostrará en la vista previa. Para que el cambio sea definitivo, deberás pulsar <strong>Guardar</strong>.
</p>

      <div className="admin-modal-actions">
        <button
          type="button"
          className="admin-modal-cancel"
          onClick={() => setConfirmarRestaurar(false)}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="admin-modal-delete"
          onClick={async () => {
            await restaurarOriginal();
            setConfirmarRestaurar(false);
          }}
        >
          Restaurar
        </button>
      </div>
    </div>
  </div>
)}
{confirmarGuardar && (
  <div
    className="admin-modal-fondo"
    onClick={() => setConfirmarGuardar(false)}
  >
    <div
      className="admin-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Guardar cambios</h3>

      <p>
        ¿Deseas guardar definitivamente las modificaciones realizadas sobre esta imagen?
      </p>

      <p>
        La imagen original seguirá conservándose y podrá recuperarse posteriormente mediante la opción <strong>Restaurar</strong>.
      </p>

      <div className="admin-modal-actions">
        <button
          type="button"
          className="admin-modal-cancel"
          onClick={() => setConfirmarGuardar(false)}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="admin-modal-delete"
          onClick={async () => {
            await guardarCambiosImagen();
            setConfirmarGuardar(false);
          }}
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
)}
{recorteAbierto && (
  <div
    className="admin-modal-fondo"
    onClick={() => setRecorteAbierto(false)}
  >
    <div
      className="admin-modal"
      style={{
  width: "90vw",
  height: "90vh",
  maxWidth: "1200px",
  maxHeight: "900px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
}}
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Recortar imagen</h3>

      <div
  style={{
    position: "relative",
    flex: 1,
    background: "#111",
    minHeight: 0,
  }}
>
  {imagenTemporalUrl && (
    <Cropper
      image={imagenTemporalUrl}
      crop={posicionRecorte}
      zoom={zoomRecorte}
      aspect={3 / 2}
      cropShape="rect"
      showGrid={true}
      onCropChange={setPosicionRecorte}
      onZoomChange={setZoomRecorte}
      onCropComplete={(_, areaPixeles) => {
        setAreaRecortePixeles(areaPixeles);
      }}
    />
  )}
</div>

      <div className="admin-modal-actions">
        <button
          type="button"
          className="admin-modal-cancel"
          onClick={() => setRecorteAbierto(false)}
        >
          Cancelar
        </button>

        <button
  type="button"
  className="admin-modal-delete"
  onClick={aplicarRecorte}
  disabled={!areaRecortePixeles}
>
  Aplicar
</button>
      </div>
    </div>
  </div>
)}

{visorImagenAbierto && imagenTemporalUrl && (
  <div
    className="admin-image-viewer"
    onClick={() => setVisorImagenAbierto(false)}
  >
    <img
      src={imagenTemporalUrl}
      alt=""
      className="admin-image-viewer-img"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}

        </section>
      </aside>

      <main className="admin-matriz">
        <h2>Talento inútil nº13</h2>

        <div className="admin-grid" ref={gridRef}>
          {casillasFiltradas.map((casilla) => (
            <div
              key={casilla.numero}
              className={`admin-casilla
                ${seleccionada?.numero === casilla.numero ? "admin-casilla-activa" : ""}
                ${casilla.bloqueada ? "admin-casilla-bloqueada" : ""}
                ${!casilla.bloqueada && casilla.subida ? "admin-casilla-subida" : ""}
                ${!casilla.bloqueada && !casilla.subida && casilla.enviada ? "admin-casilla-enviada" : ""}
              `}
              onClick={() => setSeleccionada(casilla)}
            >
              {casilla.url ? (
                <img src={casilla.url} alt="" className="admin-casilla-img" />
              ) : (
                casilla.numero
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Admin;