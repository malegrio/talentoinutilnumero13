/* ##########################################################################
#
#  IMPORTACIONES
#
########################################################################### */

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

import "./CSS_03_PantallaPostalElegida.css";


/* ##########################################################################
#
#  TIPOS
#
########################################################################### */

type Props = {
  foto: File;
  onCancelar: () => void;
  onCambiarFoto: (foto: File) => void;
  onContinuar: () => void;
};


/* ##########################################################################
#
#  FUNCIONAMIENTO
#
########################################################################### */

export default function PantallaPostalElegida({
  foto,
  onCancelar,
  onCambiarFoto,
  onContinuar,
}: Props) {

  /* ========================================================
     ESTADOS
  ======================================================== */

  const [vistaPrevia, setVistaPrevia] =
    useState("");


  /* ========================================================
     REFERENCIAS
  ======================================================== */

  const selectorFoto =
    useRef<HTMLInputElement>(null);


  /* ========================================================
     CREACIÓN DE LA VISTA PREVIA
  ======================================================== */

  useEffect(() => {
    const nuevaVistaPrevia =
      URL.createObjectURL(foto);

    setVistaPrevia(nuevaVistaPrevia);

    return () => {
      URL.revokeObjectURL(nuevaVistaPrevia);
    };
  }, [foto]);


  /* ========================================================
     APERTURA DEL SELECTOR
  ======================================================== */

  function abrirSelectorFoto() {
    selectorFoto.current?.click();
  }


  /* ========================================================
     CAMBIO DE LA FOTO
  ======================================================== */

  function cambiarFoto(
    evento: ChangeEvent<HTMLInputElement>
  ) {
    const nuevaFoto =
      evento.target.files?.[0];

    if (!nuevaFoto) {
      return;
    }

    onCambiarFoto(nuevaFoto);

    evento.target.value = "";
  }


  /* ========================================================
     CANCELACIÓN
  ======================================================== */

  function cancelar() {
    onCancelar();
  }


  /* ========================================================
     CONTINUACIÓN
  ======================================================== */

  function continuar() {
    onContinuar();
  }


  /* ##########################################################################
  #
  #  CONTENIDO
  #
  ########################################################################### */

  return (
    <main className="pantalla-postal-elegida-fondo-oscuro">

      <section className="pantalla-postal-elegida-ventana">

        {/* ==================================================
            CONTENEDOR SUPERIOR
        ================================================== */}

        <div className="pantalla-postal-elegida-contenedor-superior">

          {/* ================================================
              FOTO
          ================================================ */}

          <div className="pantalla-postal-elegida-foto">

            {vistaPrevia && (
              <img
                className="pantalla-postal-elegida-imagen"
                src={vistaPrevia}
                alt="Fotografía de la postal seleccionada"
              />
            )}

          </div>


          {/* ================================================
              TEXTO
          ================================================ */}

          <div className="pantalla-postal-elegida-textos">

            <p className="pantalla-postal-elegida-texto">
              Esta es la fotografía de la postal que has seleccionado.
            </p>

            <p className="pantalla-postal-elegida-texto">
              Si crees que la fotografía no está en condiciones
              o se ve alguna parte de tus datos personales,
              puedes elegir otra.
            </p>

            <p className="pantalla-postal-elegida-texto">
              Comprueba que todo está correcto y pulsa continuar.
            </p>

          </div>

        </div>


        {/* ==================================================
            CONTENEDOR CENTRAL
        ================================================== */}

        <div className="pantalla-postal-elegida-contenedor-central">

          {/* ================================================
              BARRA DE ACCIONES
          ================================================ */}

          <div className="pantalla-postal-elegida-acciones">

            {/* ----------------------------------------------
                BOTÓN ELEGIR OTRA
            ---------------------------------------------- */}

            <div className="pantalla-postal-elegida-acciones-izquierda">

              <button
                type="button"
                className="pantalla-postal-elegida-boton"
                onClick={abrirSelectorFoto}
              >
                Elegir otra
              </button>

              <input
                ref={selectorFoto}
                className="pantalla-postal-elegida-selector"
                type="file"
                accept="image/*"
                onChange={cambiarFoto}
              />

            </div>


            {/* ----------------------------------------------
                ESPACIO CENTRAL
            ---------------------------------------------- */}

            <div className="pantalla-postal-elegida-acciones-centro">
            </div>


            {/* ----------------------------------------------
                BOTÓN CONTINUAR
            ---------------------------------------------- */}

            <div className="pantalla-postal-elegida-acciones-derecha">

              <button
                type="button"
                className="pantalla-postal-elegida-boton"
                onClick={continuar}
              >
                Continuar
              </button>

            </div>

          </div>

        </div>


        {/* ==================================================
            CONTENEDOR INFERIOR
        ================================================== */}

        <div className="pantalla-postal-elegida-contenedor-inferior">

          {/* ================================================
              BOTÓN CANCELAR
          ================================================ */}

          <button
            type="button"
            className="pantalla-postal-elegida-cancelar"
            onClick={cancelar}
          >
            Puedes cancelar
            <span> en cualquier momento</span>
          </button>

        </div>

      </section>

    </main>
  );
}