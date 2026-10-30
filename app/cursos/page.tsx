import Catalogo from "../components/Catalogo";

export const metadata = {
  title: "Cursos | Catálogo de Cursos",
};

export default function CursosPage() {
  return (
    <section>
      <h1>Cursos disponibles</h1>
      <Catalogo />
    </section>
  );
}
