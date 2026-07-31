import { useState } from "react";
import Header from "../components/Header";
import Matriz from "../components/Matriz";
import FlujoSubidaPostal from "../components/FlujoSubidaPostal/00_ControlPantallas";

function Home() {
  const [mostrarFlujo, setMostrarFlujo] = useState(false);
  const [casillaRecienPublicada, setCasillaRecienPublicada] = useState<number | null>(null);

  return (
    <div className="app">
      <Header />

      <main className="main-area">
        <Matriz
  casillaRecienPublicada={casillaRecienPublicada}
  onCasillaProcesada={() =>
    setCasillaRecienPublicada(null)
  }
/>
      </main>

      <footer className="upload-bar">
        <button
          className="add-button"
          onClick={() => setMostrarFlujo(true)}
        >
          Añadir a la galería
        </button>
      </footer>

      {mostrarFlujo && (
        <FlujoSubidaPostal
          onCerrar={() => setMostrarFlujo(false)}
          onPostalPublicada={(casilla) => {
            setCasillaRecienPublicada(casilla);
            setMostrarFlujo(false);
          }}
        />
      )}
    </div>
  );
}

export default Home;