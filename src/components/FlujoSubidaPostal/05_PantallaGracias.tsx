/* ##########################################################################
#
#  IMPORTACIONES
#
########################################################################### */


import "./CSS_05_PantallaGracias.css";


/* ##########################################################################
#
#  TIPOS
#
########################################################################### */

type Props = {
  casilla: number;
  onFinalizar: () => void;
};


/* ##########################################################################
#
#  FUNCIONAMIENTO
#
########################################################################### */

export default function PantallaGracias({
  casilla,
  onFinalizar,
}: Props) {



  /* ##########################################################################
  #
  #  CONTENIDO
  #
  ########################################################################### */

  return (
    <main className="pantalla-gracias-fondo-oscuro">

      <section className="pantalla-gracias-ventana">

        <div className="pantalla-gracias-contenedor">

          <p className="pantalla-gracias-texto">
            Tu postal se ha subido correctamente y ocupa la casilla número {casilla}.
          </p>

                    <p className="pantalla-gracias-texto">
            Gracias!!!
          </p>

          <button
            type="button"
            className="pantalla-gracias-boton"
            onClick={onFinalizar}
          >
            Ver matriz
          </button>

        </div>

      </section>

    </main>
  );
}