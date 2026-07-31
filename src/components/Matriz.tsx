import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { IoShareSocialOutline } from "react-icons/io5";

type Casilla = {
  numero: number;
  foto: string | null;
  ciudad: string | null;
  fechaSubida: string | null;
};

type CasillaBD = {
  numero: number;
  url: string | null;
  ciudad: string | null;
  fecha_subida: string | null;
  publicada: boolean | null;
  bloqueada: boolean | null;
};

type Props = {
  casillaRecienPublicada: number | null;
  onCasillaProcesada: () => void;
};

function Matriz({
  casillaRecienPublicada,
  onCasillaProcesada,
}: Props) {
  const navigate = useNavigate();
  const { numero } = useParams();

  const [casillaAbierta, setCasillaAbierta] = useState<number | null>(null);
  const [casillasBD, setCasillasBD] = useState<CasillaBD[]>([]);

  const urlActual = casillaAbierta
    ? `${window.location.origin}/${casillaAbierta}`
    : window.location.origin;

  async function compartir() {
    if (!casillaAbierta) return;

    if (navigator.share) {
      await navigator.share({
        title: `Postal ${casillaAbierta}`,
        text: "Mira esta postal",
        url: urlActual,
      });
    } else {
      await navigator.clipboard.writeText(urlActual);
      alert("Enlace copiado al portapapeles");
    }
  }

  useEffect(() => {
    async function cargarCasillas() {
      const { data, error } = await supabase
        .from("casillas")
        .select("numero, url, ciudad, fecha_subida, publicada, bloqueada")
        .eq("publicada", true)
        .eq("bloqueada", false);

      if (error) {
        console.error(error);
        return;
      }

      setCasillasBD(data || []);
    }

    cargarCasillas();
  }, []);

  useEffect(() => {
    if (!casillaRecienPublicada) return;

    async function recargarCasillas() {
      const { data, error } = await supabase
        .from("casillas")
        .select("numero, url, ciudad, fecha_subida, publicada, bloqueada")
        .eq("publicada", true)
        .eq("bloqueada", false);

      if (error) {
        console.error(error);
        return;
      }

      setCasillasBD(data || []);
      navigate(`/${casillaRecienPublicada}`);
      onCasillaProcesada();
    }

    recargarCasillas();
  }, [
    casillaRecienPublicada,
    navigate,
    onCasillaProcesada,
  ]);

  const casillas: Casilla[] = [];

  for (let i = 1; i <= 1000; i++) {
    const casillaBD = casillasBD.find(
      (casilla) => casilla.numero === i
    );

    casillas.push({
      numero: i,
      foto: casillaBD?.url || null,
      ciudad: casillaBD?.ciudad || null,
      fechaSubida: casillaBD?.fecha_subida || null,
    });
  }

  const casillaActual =
    casillaAbierta !== null
      ? casillas.find(
          (casilla) => casilla.numero === casillaAbierta
        )
      : null;

  useEffect(() => {
    if (numero) {
      setCasillaAbierta(Number(numero));
    } else {
      setCasillaAbierta(null);
    }
  }, [numero]);

  const fechaFormateada = casillaActual?.fechaSubida
    ? new Date(casillaActual.fechaSubida).toLocaleDateString("es-ES")
    : null;

  useEffect(() => {
    function manejarTeclado(event: KeyboardEvent) {
      if (casillaAbierta === null) return;

      if (event.key === "Escape") {
        setCasillaAbierta(null);
        navigate("/");
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigate(`/${Math.max(1, casillaAbierta - 1)}`);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        navigate(`/${Math.min(1000, casillaAbierta + 1)}`);
      }
    }

    window.addEventListener("keydown", manejarTeclado);

    return () => {
      window.removeEventListener("keydown", manejarTeclado);
    };
  }, [casillaAbierta, navigate]);

  function irAnterior() {
    if (casillaActual) {
      const anterior = Math.max(1, casillaActual.numero - 1);
      navigate(`/${anterior}`);
    }
  }

  function irSiguiente() {
    if (casillaActual) {
      const siguiente = Math.min(1000, casillaActual.numero + 1);
      navigate(`/${siguiente}`);
    }
  }

  return (
    <>
      <main className="matriz">
        {casillas.map((casilla) => (
          <div
            key={casilla.numero}
            className="casilla"
            onClick={() => navigate(`/${casilla.numero}`)}
          >
            {casilla.foto ? (
              <img
                src={casilla.foto}
                className="foto-casilla"
                alt=""
              />
            ) : (
              casilla.numero
            )}
          </div>
        ))}
      </main>

      {casillaActual && (
        <div
          className="visor-foto"
          onClick={() => {
            setCasillaAbierta(null);
            navigate("/");
          }}
        >
          <div
            className="ventana-visor"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="zona-click zona-izquierda"
              onClick={irAnterior}
            />

            <button
              className="zona-click zona-derecha"
              onClick={irSiguiente}
            />

            {casillaActual.foto ? (
              <img
                src={casillaActual.foto}
                alt=""
                className="visor-foto-img"
              />
            ) : (
              <div className="casilla-vacia-visor">
                {casillaActual.numero}
              </div>
            )}
          </div>

          <div
            className="info-visor"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="datos-visor">
              {casillaActual.numero}

              {casillaActual.ciudad && (
                <> · {casillaActual.ciudad}</>
              )}

              {fechaFormateada && (
                <> · {fechaFormateada}</>
              )}
            </div>

            <div className="iconos-visor">
              <button
                className="boton-icono-visor"
                onClick={compartir}
              >
                <IoShareSocialOutline />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Matriz;