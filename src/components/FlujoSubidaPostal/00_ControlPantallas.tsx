/* ==========================================================
   IMPORTACIONES
========================================================== */

import {
  useState,
} from "react";

import { supabase } from "../../lib/supabase";
import { prepararImagen } from "../../lib/image";

import PantallaCodigo from "./01_PantallaCodigo";
import PantallaBuscarPostal from "./02_PantallaInstrucciones";
import PantallaPostalElegida from "./03_PantallaPostalElegida";
import PantallaAñadirGaleria from "./04_PantallaAñadirGaleria";
import PantallaGracias from "./05_PantallaGracias";


/* ==========================================================
   TIPOS
========================================================== */

type Props = {
  onCerrar: () => void;
  onPostalPublicada: (casilla: number) => void;
};

type Pantalla =
  | "codigo"
  | "instrucciones"
  | "postal"
  | "galeria"
  | "gracias";


/* ==========================================================
   FUNCIONAMIENTO
========================================================== */

export default function ControlPantallas({
  onCerrar,
}: Props) {

  /* ========================================================
     ESTADOS
  ======================================================== */

  const [pantallaActual, setPantallaActual] =
    useState<Pantalla>("codigo");

  const [codigoValidado, setCodigoValidado] =
    useState("");

  const [fotoSeleccionada, setFotoSeleccionada] =
    useState<File | null>(null);

  const [casillaPublicada, setCasillaPublicada] =
    useState<number | null>(null);

  const [publicando, setPublicando] =
    useState(false);


  /* ========================================================
     PUBLICACIÓN DE LA POSTAL
  ======================================================== */

  async function publicarPostal() {
    if (
      publicando ||
      !fotoSeleccionada ||
      !codigoValidado
    ) {
      return;
    }

    setPublicando(true);

    try {
      const {
        data: casillaData,
        error: errorCodigo,
      } = await supabase
        .from("casillas")
        .select("numero, publicada")
        .eq("codigo", codigoValidado)
        .single();

      if (
        errorCodigo ||
        !casillaData
      ) {
        throw new Error("Código no válido");
      }

      if (casillaData.publicada) {
        throw new Error(
          "Este código ya ha sido utilizado"
        );
      }

      const casilla =
        casillaData.numero;

      const imagenPreparada =
        await prepararImagen(fotoSeleccionada);

      const nombreArchivo =
        `${Date.now()}.jpg`;

      const { error: errorStorage } =
        await supabase.storage
          .from("postales")
          .upload(
            nombreArchivo,
            imagenPreparada
          );

      if (errorStorage) {
        throw errorStorage;
      }

      const { data: datosUrl } =
        supabase.storage
          .from("postales")
          .getPublicUrl(nombreArchivo);

      const urlImagen =
        datosUrl.publicUrl;

      const { error: errorPostales } =
        await supabase
          .from("postales")
          .insert({
            codigo: codigoValidado,
            casilla,
            imagen: nombreArchivo,
            url: urlImagen,
            imagen_original: nombreArchivo,
            url_original: urlImagen,
            publicada: true,
          });

      if (errorPostales) {
        throw errorPostales;
      }

      const { error: errorCasillas } =
        await supabase.rpc(
          "publicar_postal",
          {
            codigo_recibido: codigoValidado,
            nombre_imagen: nombreArchivo,
            url_imagen: urlImagen,
          }
        );

      if (errorCasillas) {
        throw errorCasillas;
      }

      setCasillaPublicada(casilla);
      setPantallaActual("gracias");

    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        window.alert(error.message);
      } else {
        window.alert(
          "No se ha podido publicar la postal"
        );
      }

      setPublicando(false);
    }
  }


  /* ========================================================
     CONTENIDO
  ======================================================== */

  switch (pantallaActual) {

    case "codigo":
      return (
        <PantallaCodigo
          onCancelar={onCerrar}
          onContinuar={(codigo) => {
            setCodigoValidado(codigo);
            setPantallaActual("instrucciones");
          }}
        />
      );

    case "instrucciones":
      return (
        <PantallaBuscarPostal
          onCancelar={onCerrar}
          onSeleccionarFoto={(foto) => {
            setFotoSeleccionada(foto);
            setPantallaActual("postal");
          }}
        />
      );

    case "postal":
      if (!fotoSeleccionada) {
        return null;
      }

      return (
        <PantallaPostalElegida
          foto={fotoSeleccionada}
          onCancelar={onCerrar}
          onCambiarFoto={(foto) => {
            setFotoSeleccionada(foto);
          }}
          onContinuar={() => {
            setPantallaActual("galeria");
          }}
        />
      );

    case "galeria":
      if (!fotoSeleccionada) {
        return null;
      }

      return (
        <PantallaAñadirGaleria
          foto={fotoSeleccionada}
          onAtras={() => {
            setPantallaActual("postal");
          }}
          onCancelar={onCerrar}
          onPublicar={() => {
            void publicarPostal();
          }}
        />
      );

    case "gracias":
  if (casillaPublicada === null) {
    return null;
  }

  return (
    <PantallaGracias
      casilla={casillaPublicada}
      onFinalizar={() => {
        onCerrar();
        window.location.reload();
      }}
    />
  );

    default:
      return null;
  }
}