import Header from "../components/Header";
import Matriz from "../components/Matriz";
import UploadBar from "../components/UploadBar";

function Home() {
  return (
    <div className="app">
      <Header />

      <main className="main-area">
        <Matriz />
      </main>

      <UploadBar />
    </div>
  );
}

export default Home;