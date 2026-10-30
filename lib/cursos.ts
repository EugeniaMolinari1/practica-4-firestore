export type Nivel = "inicial" | "intermedio" | "avanzado";

export interface Curso {
  id: string;
  titulo: string;
  nivel: Nivel;
  horas: number;
  descripcion: string;
  cupo: number;
}

/**
 * Catálogo local. Mismos datos y UUID que dataconnect/seed_data.gql (se conserva como referencia).
 * El `id` es la clave que se usará para las reseñas en Firestore.
 */
export const cursos: Curso[] = [
  {
    id: "0b7c1a2e-0001-4c3a-9d5e-000000000001",
    titulo: "Git y flujos de trabajo en equipo",
    nivel: "inicial",
    horas: 12,
    descripcion: "Branches, pull requests, revisiones de código y resolución de conflictos.",
    cupo: 30,
  },
  {
    id: "0b7c1a2e-0001-4c3a-9d5e-000000000002",
    titulo: "Integración y entrega continua",
    nivel: "intermedio",
    horas: 16,
    descripcion: "Pipelines, entornos efímeros, despliegues progresivos y rollback.",
    cupo: 25,
  },
  {
    id: "0b7c1a2e-0001-4c3a-9d5e-000000000003",
    titulo: "Seguridad en aplicaciones web",
    nivel: "avanzado",
    horas: 20,
    descripcion: "OWASP Top 10, headers HTTP, CSP, autenticación y manejo de secretos.",
    cupo: 20,
  },
  {
    id: "0b7c1a2e-0001-4c3a-9d5e-000000000004",
    titulo: "Arquitecturas serverless",
    nivel: "avanzado",
    horas: 24,
    descripcion: "Funciones, contenedores gestionados, colas de mensajes y costos.",
    cupo: 20,
  },
  {
    id: "0b7c1a2e-0001-4c3a-9d5e-000000000005",
    titulo: "React desde cero",
    nivel: "inicial",
    horas: 18,
    descripcion: "Componentes, estado, efectos y composición.",
    cupo: 40,
  },
  {
    id: "0b7c1a2e-0001-4c3a-9d5e-000000000006",
    titulo: "Observabilidad y SRE",
    nivel: "intermedio",
    horas: 14,
    descripcion: "Logs estructurados, métricas, trazas, SLOs y alertas.",
    cupo: 25,
  },
  {
    id: "0b7c1a2e-0001-4c3a-9d5e-000000000007",
    titulo: "Bases de datos relacionales",
    nivel: "intermedio",
    horas: 20,
    descripcion: "Modelado, normalización, índices, transacciones y SQL.",
    cupo: 30,
  },
];
