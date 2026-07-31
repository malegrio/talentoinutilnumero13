/* ##########################################################################
#
#  IMPORTACIONES
#
########################################################################### */

import {
  useEffect,
  useState,
} from "react";

import "./CSS_04_PantallaAñadirGaleria.css";


/* ##########################################################################
#
#  TIPOS
#
########################################################################### */

type Props = {
  foto: File;
  onAtras: () => void;
  onCancelar: () => void;
  onPublicar: () => void;
};


/* ##########################################################################
#
#  FUNCIONAMIENTO
#
########################################################################### */

export default function PantallaAñadirGaleria({
  foto,
  onAtras,
  onCancelar,
  onPublicar,
}: Props) {

  /* ========================================================
     ESTADOS
  ======================================================== */

  const [vistaPrevia, setVistaPrevia] =
    useState("");

  const [direccionOculta, setDireccionOculta] =
    useState(false);

  const [textoLegible, setTextoLegible] =
    useState(false);

  const [postalCompleta, setPostalCompleta] =
    useState(false);


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
     COMPROBACIÓN PARA PUBLICAR
  ======================================================== */

  const puedePublicar =
    direccionOculta &&
    textoLegible &&
    postalCompleta;


  /* ========================================================
     VOLVER ATRÁS
  ======================================================== */

  function volverAtras() {
    onAtras();
  }


  /* ========================================================
     CANCELACIÓN
  ======================================================== */

  function cancelar() {
    onCancelar();
  }


  /* ========================================================
     PUBLICACIÓN
  ======================================================== */

  function publicar() {
    if (!puedePublicar) {
      return;
    }

    onPublicar();
  }


  /* ##########################################################################
  #
  #  CONTENIDO
  #
  ########################################################################### */

  return (
    <main className="pantalla-anadir-galeria-fondo-oscuro">

      <section className="pantalla-anadir-galeria-ventana">

        {/* ==================================================
            CONTENEDOR SUPERIOR
        ================================================== */}

        <div className="pantalla-anadir-galeria-contenedor-superior">

          {/* ================================================
              FOTO
          ================================================ */}

          <div className="pantalla-anadir-galeria-foto">

            {vistaPrevia && (
              <img
                className="pantalla-anadir-galeria-imagen"
                src={vistaPrevia}
                alt="Fotografía de la postal seleccionada"
              />
            )}

          </div>


          {/* ================================================
              TEXTO
          ================================================ */}

          <div className="pantalla-anadir-galeria-textos">

            <p className="pantalla-anadir-galeria-texto">
              Esta es la foto que has elegido.
            </p>

            <p className="pantalla-anadir-galeria-texto">
              Al pulsar en añadir a la galería ya no habrá
              vuelta atrás. El código quedará invalidado
              definitivamente y la fotografía permanecerá
              ligada al proyecto.
            </p>

            <p className="pantalla-anadir-galeria-texto">
              Comprueba los tres puntos antes de continuar.
            </p>

          </div>

        </div>


        {/* ==================================================
            CONTENEDOR CENTRAL
        ================================================== */}

        <div className="pantalla-anadir-galeria-contenedor-central">

          {/* ================================================
              BARRA DE ACCIONES
          ================================================ */}

          <div className="pantalla-anadir-galeria-acciones">

            {/* ----------------------------------------------
                BOTÓN ATRÁS
            ---------------------------------------------- */}

            <div className="pantalla-anadir-galeria-acciones-izquierda">

              <button
                type="button"
                className="pantalla-anadir-galeria-boton-atras"
                onClick={volverAtras}
              >
                Atrás
              </button>

            </div>


            {/* ----------------------------------------------
                BOTÓN AÑADIR A LA GALERÍA
            ---------------------------------------------- */}

            <div className="pantalla-anadir-galeria-acciones-centro">

              <button
                type="button"
                className="pantalla-anadir-galeria-boton-publicar"
                onClick={publicar}
                disabled={!puedePublicar}
              >
                Añadir a la galería
              </button>

            </div>


            {/* ----------------------------------------------
                COMPROBADORES
            ---------------------------------------------- */}

            <div className="pantalla-anadir-galeria-comprobadores">

              <label className="pantalla-anadir-galeria-comprobador">

                <input
                  type="checkbox"
                  checked={direccionOculta}
                  onChange={(evento) => {
                    setDireccionOculta(
                      evento.target.checked
                    );
                  }}
                />

                <span>
                  Dirección oculta
                </span>

              </label>

              <label className="pantalla-anadir-galeria-comprobador">

                <input
                  type="checkbox"
                  checked={textoLegible}
                  onChange={(evento) => {
                    setTextoLegible(
                      evento.target.checked
                    );
                  }}
                />

                <span>
                  Texto legible
                </span>

              </label>

              <label className="pantalla-anadir-galeria-comprobador">

                <input
                  type="checkbox"
                  checked={postalCompleta}
                  onChange={(evento) => {
                    setPostalCompleta(
                      evento.target.checked
                    );
                  }}
                />

                <span>
                  Postal completa
                </span>

              </label>

            </div>

          </div>

        </div>


        {/* ==================================================
            CONTENEDOR INFERIOR
        ================================================== */}

        <div className="pantalla-anadir-galeria-contenedor-inferior">

          {/* ================================================
              BOTÓN CANCELAR
          ================================================ */}

          <button
            type="button"
            className="pantalla-anadir-galeria-cancelar"
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