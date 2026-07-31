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
  ReactNode,
} from "react";

import {
  FaCheckCircle,
  FaRegCircle,
  FaTimesCircle,
} from "react-icons/fa";

import {
  AiOutlineLoading3Quarters,
} from "react-icons/ai";

import { supabase } from "../../lib/supabase";

import "./CSS_01_PantallaCodigo.css";


/* ##########################################################################
#
#  TIPOS
#
########################################################################### */

type Props = {
  onCancelar: () => void;
  onContinuar: (codigo: string) => void;
};

type EstadoCodigo =
  | "vacio"
  | "incompleto"
  | "comprobando"
  | "valido"
  | "invalido";

type CasillaCodigo = {
  numero: number;
  publicada: boolean;
};


/* ##########################################################################
#
#  FUNCIONAMIENTO
#
########################################################################### */

export default function PantallaCodigo({
  onCancelar,
  onContinuar,
}: Props) {

  /* ========================================================
     ESTADOS
  ======================================================== */

  const [codigo, setCodigo] = useState("");

  const [estadoCodigo, setEstadoCodigo] =
    useState<EstadoCodigo>("vacio");


  /* ========================================================
     REFERENCIAS
  ======================================================== */

  const comprobacionActual = useRef(0);


  /* ========================================================
     VARIABLES DERIVADAS
  ======================================================== */

  const codigoCompleto =
    codigo.length === 6;

  const codigoValido =
    estadoCodigo === "valido";

  const comprobandoCodigo =
    estadoCodigo === "comprobando";


  /* ========================================================
     COMPROBACIÓN DEL CÓDIGO
  ======================================================== */

  useEffect(() => {
    const numeroComprobacion =
      comprobacionActual.current + 1;

    comprobacionActual.current =
      numeroComprobacion;

    if (codigo.length === 0) {
      setEstadoCodigo("vacio");
      return;
    }

    if (!codigoCompleto) {
      setEstadoCodigo("incompleto");
      return;
    }

    async function comprobarCodigo() {
      setEstadoCodigo("comprobando");

      const { data, error } =
        await supabase
          .from("casillas")
          .select("numero, publicada")
          .eq("codigo", codigo)
          .maybeSingle();

      if (
        numeroComprobacion !==
        comprobacionActual.current
      ) {
        return;
      }

      const casilla =
        data as CasillaCodigo | null;

      if (
        error ||
        !casilla ||
        casilla.publicada
      ) {
        setEstadoCodigo("invalido");
        return;
      }

      setEstadoCodigo("valido");
    }

    void comprobarCodigo();
  }, [codigo, codigoCompleto]);


  /* ========================================================
     CAMBIO DEL CÓDIGO
  ======================================================== */

  function cambiarCodigo(
    evento: ChangeEvent<HTMLInputElement>
  ) {
    const nuevoCodigo =
      evento.target.value
        .toUpperCase()
        .replace(
          /[^ABCDEFGHJKLMNPQRSTUVWXYZ]/g,
          ""
        )
        .slice(0, 6);

    comprobacionActual.current += 1;

    setCodigo(nuevoCodigo);

    if (nuevoCodigo.length === 0) {
      setEstadoCodigo("vacio");
      return;
    }

    if (nuevoCodigo.length < 6) {
      setEstadoCodigo("incompleto");
    }
  }


  /* ========================================================
     CANCELACIÓN
  ======================================================== */

  function cancelar() {
    if (comprobandoCodigo) {
      return;
    }

    comprobacionActual.current += 1;

    onCancelar();
  }


  /* ========================================================
     CONTINUACIÓN
  ======================================================== */

  function continuar() {
    if (!codigoValido) {
      return;
    }

    onContinuar(codigo);
  }


  /* ##########################################################################
  #
  #  CONTENIDO
  #
  ########################################################################### */

  /* ========================================================
     ESTADO
  ======================================================== */

  let mensajeEstado = "";

  switch (estadoCodigo) {
    case "incompleto":
      mensajeEstado = "Código incompleto";
      break;

    case "comprobando":
      mensajeEstado = "Comprobando código...";
      break;

    case "valido":
      mensajeEstado = "El código es válido";
      break;

    case "invalido":
      mensajeEstado =
        "Este código no es válido o ya ha sido utilizado";
      break;
  }

  let iconoEstado: ReactNode = null;

switch (estadoCodigo) {

  case "vacio":
case "incompleto":
  iconoEstado = (
    <FaRegCircle
      className="
        pantalla-codigo-icono
        pantalla-codigo-icono-vacio
      "
    />
  );
  break;

  case "comprobando":
    iconoEstado = (
      <AiOutlineLoading3Quarters
        className="
          pantalla-codigo-icono
          pantalla-codigo-icono-cargando
        "
      />
    );
    break;

  case "valido":
    iconoEstado = (
      <FaCheckCircle
        className="
          pantalla-codigo-icono
          pantalla-codigo-icono-valido
        "
      />
    );
    break;

  case "invalido":
    iconoEstado = (
      <FaTimesCircle
        className="
          pantalla-codigo-icono
          pantalla-codigo-icono-error
        "
      />
    );
    break;
}

  return (
    <main className="pantalla-codigo-fondo-oscuro">

      <section className="pantalla-codigo-ventana">

        {/* ==================================================
            CONTENEDOR SUPERIOR
        ================================================== */}

        <div className="pantalla-codigo-contenedor-superior">

          {/* ================================================
              TEXTO
          ================================================ */}

          <div className="pantalla-codigo-textos">

            <p className="pantalla-codigo-texto">
              Hola.
            </p>

            <p className="pantalla-codigo-texto">
              No nos conocemos y,
              probablemente,
              nunca lleguemos a hacerlo. Pero si has llegado hasta aquí
              es porque la postal que te envié
              al azar ha cumplido parte de su
              función.
            </p>

            <p className="pantalla-codigo-texto">
              Y como lo único verdaderamente
              importante es la historia,
              debemos permanecer en el
              anonimato. Nunca nadie sabrá de nosotros.
              Y eso está bien.
            </p>

            <p className="pantalla-codigo-texto">
              Ahora, para que todo esto
              continúe, ya solo depende de ti...
            </p>

          </div>


          {/* ================================================
              FOTOS
          ================================================ */}

        </div>


        {/* ==================================================
            CONTENEDOR CENTRAL
        ================================================== */}

        <div className="pantalla-codigo-contenedor-central">

          {/* ================================================
              ESTADO
          ================================================ */}

          <div className="pantalla-codigo-estado">

            {/* ----------------------------------------------
                ICONO
            ---------------------------------------------- */}

            {iconoEstado}


            {/* ----------------------------------------------
                MENSAJE
            ---------------------------------------------- */}

            <p className="pantalla-codigo-mensaje">
              {mensajeEstado}
            </p>

          </div>


          {/* ================================================
              BARRA DE ACCIONES
          ================================================ */}

          <div className="pantalla-codigo-acciones">

            {/* ----------------------------------------------
                BOTÓN IZQUIERDA
            ---------------------------------------------- */}

            <div className="pantalla-codigo-acciones-izquierda">
            </div>


            {/* ----------------------------------------------
                CAJA CÓDIGO
            ---------------------------------------------- */}

            <div className="pantalla-codigo-acciones-centro">

              <input
                className="pantalla-codigo-input"
                type="text"
                value={codigo}
                maxLength={6}
                autoComplete="off"
                spellCheck={false}
                placeholder="CÓDIGO"
                disabled={comprobandoCodigo}
                onChange={cambiarCodigo}
              />

            </div>


            {/* ----------------------------------------------
                BOTÓN CONTINUAR
            ---------------------------------------------- */}

            <div className="pantalla-codigo-acciones-derecha">

              {codigoValido && (
                <button
                  type="button"
                  className="pantalla-codigo-boton"
                  onClick={continuar}
                >
                  Continuar
                </button>
              )}

            </div>

          </div>

        </div>


        {/* ==================================================
            CONTENEDOR INFERIOR
        ================================================== */}

        <div className="pantalla-codigo-contenedor-inferior">

          {/* ================================================
              BOTÓN CANCELAR
          ================================================ */}

          <button
            type="button"
            className="pantalla-codigo-cancelar"
            disabled={comprobandoCodigo}
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