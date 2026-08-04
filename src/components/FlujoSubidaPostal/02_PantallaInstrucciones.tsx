/* ##########################################################################
#
#  IMPORTACIONES
#
########################################################################### */

import {
  useRef,
} from "react";

import type {
  ChangeEvent,
} from "react";

import "./CSS_02_PantallaInstrucciones.css";

/* ##########################################################################
#
#  TIPOS
#
########################################################################### */

type Props = {
  onCancelar: () => void;
  onSeleccionarFoto: (foto: File) => void;
};


/* ##########################################################################
#
#  FUNCIONAMIENTO
#
########################################################################### */

export default function PantallaBuscarPostal({
  onCancelar,
  onSeleccionarFoto,
}: Props) {

  /* ========================================================
     REFERENCIAS
  ======================================================== */

  const selectorFoto =
    useRef<HTMLInputElement>(null);


  /* ========================================================
     APERTURA DEL SELECTOR
  ======================================================== */

  function abrirSelectorFoto() {
    selectorFoto.current?.click();
  }


  /* ========================================================
     SELECCIÓN DE LA FOTO
  ======================================================== */

  function seleccionarFoto(
  evento: ChangeEvent<HTMLInputElement>
) {
  const foto =
    evento.target.files?.[0];

  if (!foto) {
    return;
  }

  if (!foto.type.startsWith("image/")) {
    alert("Solo puedes seleccionar archivos de imagen.");

    evento.target.value = "";
    return;
  }

  onSeleccionarFoto(foto);

  evento.target.value = "";
}


  /* ========================================================
     CANCELACIÓN
  ======================================================== */

  function cancelar() {
    onCancelar();
  }


  /* ##########################################################################
  #
  #  CONTENIDO
  #
  ########################################################################### */

  return (
    <main className="pantalla-buscar-postal-fondo-oscuro">

      <section className="pantalla-buscar-postal-ventana">

        {/* ==================================================
            CONTENEDOR SUPERIOR
        ================================================== */}

        <div className="pantalla-buscar-postal-contenedor-superior">

          {/* ================================================
    FOTO
=============================================== */}

<div className="pantalla-buscar-postal-foto">

  <img
    className="pantalla-buscar-postal-imagen"
    src="/postal-datos-protegidos.jpg"
    alt="Postal con una mano cubriendo los datos personales"
  />

</div>


          {/* ================================================
              TEXTO
          ================================================ */}

          <div className="pantalla-buscar-postal-textos">

            <p className="pantalla-buscar-postal-texto">
              La postal debe fotografiarse por la parte escrita.
              Comprueba que el texto, el sello, el matasellos y
              el código puedan verse claramente.
            </p>

            <p className="pantalla-buscar-postal-texto">
              IMPORTANTE! Oculta los datos personales antes de
              seleccionar la postal. 
            </p>

          </div>

        </div>


        {/* ==================================================
            CONTENEDOR CENTRAL
        ================================================== */}

        <div className="pantalla-buscar-postal-contenedor-central">

          {/* ================================================
              BARRA DE ACCIONES
          ================================================ */}

          <div className="pantalla-buscar-postal-acciones">

            {/* ----------------------------------------------
                ZONA IZQUIERDA
            ---------------------------------------------- */}

            <div className="pantalla-buscar-postal-acciones-izquierda">
            </div>


            {/* ----------------------------------------------
                BOTÓN BUSCAR POSTAL
            ---------------------------------------------- */}

            <div className="pantalla-buscar-postal-acciones-centro">

              <button
                type="button"
                className="pantalla-buscar-postal-boton"
                onClick={abrirSelectorFoto}
              >
                Buscar postal
              </button>

              <input
                ref={selectorFoto}
                className="pantalla-buscar-postal-selector"
                type="file"
                accept="image/*"
                onChange={seleccionarFoto}
              />

            </div>


            {/* ----------------------------------------------
                ZONA DERECHA
            ---------------------------------------------- */}

            <div className="pantalla-buscar-postal-acciones-derecha">
            </div>

          </div>

        </div>


        {/* ==================================================
            CONTENEDOR INFERIOR
        ================================================== */}

        <div className="pantalla-buscar-postal-contenedor-inferior">

          {/* ================================================
              BOTÓN CANCELAR
          ================================================ */}

          <button
            type="button"
            className="pantalla-buscar-postal-cancelar"
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