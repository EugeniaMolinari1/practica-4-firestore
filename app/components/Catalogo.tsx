"use client";

import { useState } from "react";
import { cursos } from "@/lib/cursos";
import FiltroCursos from "./FiltroCursos";
import ResenasCurso from "./ResenasCurso";

export default function Catalogo() {
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <FiltroCursos
      cursos={cursos}
      accion={(c) => (
        <>
          <button
            type="button"
            className="button button--small button--ghost"
            aria-expanded={abierto === c.id}
            onClick={() => setAbierto(abierto === c.id ? null : c.id)}
          >
            {abierto === c.id ? "Ocultar reseñas" : "Ver reseñas"}
          </button>
          {/* Solo se monta al abrir: los listeners se cancelan al cerrar o desmontar. */}
          {abierto === c.id && <ResenasCurso cursoId={c.id} />}
        </>
      )}
    />
  );
}
