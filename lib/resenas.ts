"use client";

import {
  average,
  collection,
  count,
  deleteDoc,
  doc,
  getAggregateFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { firebase } from "./firebase";

/**
 * Capa de acceso a Firestore para las reseñas.
 * Modelo: cursos/{cursoId}/resenas/{uid}. El ID del documento es el UID del autor,
 * así que un usuario tiene como máximo UNA reseña por curso.
 */

export const MAX_RESENAS = 20;

export interface Resena {
  /** UID del autor (ID del documento). */
  uid: string;
  puntaje: number;
  texto: string;
  autor: string;
  creadaEn: Date | null;
}

export interface DatosResena {
  puntaje: number;
  texto: string;
  autor: string;
}

export interface Estadisticas {
  cantidad: number;
  /** null si el curso todavía no tiene reseñas. */
  promedio: number | null;
}

function resenas(cursoId: string) {
  return collection(firebase().db, "cursos", cursoId, "resenas");
}

function resenaRef(cursoId: string, uid: string) {
  return doc(firebase().db, "cursos", cursoId, "resenas", uid);
}

// ── Escrituras ─────────────────────────────────────────────────────────────
export async function crearResena(cursoId: string, uid: string, datos: DatosResena): Promise<void> {
  await setDoc(resenaRef(cursoId, uid), { ...datos, creadaEn: serverTimestamp() });
}

/** Edita puntaje, texto y autor. No envía `creadaEn`, por lo que conserva su valor original. */
export async function editarResena(cursoId: string, uid: string, datos: DatosResena): Promise<void> {
  await updateDoc(resenaRef(cursoId, uid), { ...datos });
}

export async function eliminarResena(cursoId: string, uid: string): Promise<void> {
  await deleteDoc(resenaRef(cursoId, uid));
}

// ── Lecturas en tiempo real ────────────────────────────────────────────────
/**
 * Escucha las últimas 20 reseñas (más nuevas primero). Con `soloCincoEstrellas`
 * filtra por puntaje == 5 (usa el índice compuesto de firestore.indexes.json).
 * Devuelve la función para cancelar la suscripción.
 */
export function escucharResenas(
  cursoId: string,
  soloCincoEstrellas: boolean,
  onDatos: (lista: Resena[], pendiente: boolean) => void,
  onError: (e: Error) => void,
): () => void {
  const filtros: QueryConstraint[] = [];
  if (soloCincoEstrellas) filtros.push(where("puntaje", "==", 5));
  filtros.push(orderBy("creadaEn", "desc"), limit(MAX_RESENAS));

  return onSnapshot(
    query(resenas(cursoId), ...filtros),
    (snap) =>
      onDatos(
        snap.docs.map((d) => {
          // "estimate": mientras el servidor no confirma, usa la hora local en vez de null.
          const x = d.data({ serverTimestamps: "estimate" });
          return {
            uid: d.id,
            puntaje: x.puntaje,
            texto: x.texto,
            autor: x.autor,
            creadaEn: x.creadaEn?.toDate() ?? null,
          };
        }),
        snap.metadata.hasPendingWrites,
      ),
    onError,
  );
}

/** Escucha la reseña del usuario (null si todavía no escribió una). */
export function escucharMiResena(
  cursoId: string,
  uid: string,
  onDatos: (resena: DatosResena | null) => void,
  onError: (e: Error) => void,
): () => void {
  return onSnapshot(
    resenaRef(cursoId, uid),
    (snap) => {
      const x = snap.data();
      onDatos(x ? { puntaje: x.puntaje, texto: x.texto, autor: x.autor } : null);
    },
    onError,
  );
}

// ── Agregaciones ───────────────────────────────────────────────────────────
/** Cantidad y promedio calculados en el servidor, sin descargar los documentos. */
export async function obtenerEstadisticas(cursoId: string): Promise<Estadisticas> {
  const snap = await getAggregateFromServer(resenas(cursoId), {
    cantidad: count(),
    promedio: average("puntaje"),
  });
  // data() es un método de la instancia: hay que llamarlo sobre `snap` (no desestructurarlo).
  const d = snap.data();
  return { cantidad: d.cantidad, promedio: d.promedio };
}
