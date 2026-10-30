"use client";

import { useEffect, useState, type FormEvent } from "react";
import { mensajeDeError } from "@/lib/errores";
import {
  crearResena,
  editarResena,
  eliminarResena,
  escucharMiResena,
  escucharResenas,
  obtenerEstadisticas,
  type DatosResena,
  type Estadisticas,
  type Resena,
} from "@/lib/resenas";
import { useUsuario } from "@/lib/useUsuario";

function estrellas(n: number) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export default function ResenasCurso({ cursoId }: { cursoId: string }) {
  const usuario = useUsuario();
  const uid = usuario?.uid;

  const [lista, setLista] = useState<Resena[] | null>(null);
  const [soloCinco, setSoloCinco] = useState(false);
  const [mia, setMia] = useState<DatosResena | null>(null);
  const [stats, setStats] = useState<Estadisticas | null>(null);
  // Se incrementa cuando el servidor confirma un cambio, para recalcular las estadísticas.
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState(false);
  const [editando, setEditando] = useState(false);

  const [puntaje, setPuntaje] = useState(5);
  const [texto, setTexto] = useState("");

  // Últimas 20 reseñas en tiempo real (se vuelve a suscribir al cambiar el filtro).
  useEffect(() => {
    setLista(null);
    return escucharResenas(
      cursoId,
      soloCinco,
      (datos, pendiente) => {
        setLista(datos);
        if (!pendiente) setVersion((v) => v + 1);
      },
      (e) => setError(mensajeDeError(e)),
    );
  }, [cursoId, soloCinco]);

  // Reseña propia, para precargar el formulario.
  useEffect(() => {
    if (!uid) {
      setMia(null);
      setEditando(false);
      return;
    }
    return escucharMiResena(
      cursoId,
      uid,
      (r) => {
        setMia(r);
        setPuntaje(r?.puntaje ?? 5);
        setTexto(r?.texto ?? "");
      },
      (e) => setError(mensajeDeError(e)),
    );
  }, [cursoId, uid]);

  // Cantidad y promedio calculados en el servidor.
  useEffect(() => {
    let vigente = true;
    obtenerEstadisticas(cursoId)
      .then((s) => vigente && setStats(s))
      .catch((e) => vigente && setError(mensajeDeError(e)));
    return () => {
      vigente = false;
    };
  }, [cursoId, version]);

  async function ejecutar(accion: () => Promise<void>) {
    setEnCurso(true);
    setError(null);
    try {
      await accion();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnCurso(false);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!usuario) return;
    const datos: DatosResena = {
      puntaje,
      texto: texto.trim(),
      autor: (usuario.displayName ?? usuario.email ?? "Anónimo").slice(0, 80),
    };
    void ejecutar(async () => {
      if (mia) {
        await editarResena(cursoId, usuario.uid, datos);
        setEditando(false);
      } else {
        await crearResena(cursoId, usuario.uid, datos);
      }
    });
  }

  function onEditar() {
    if (!mia) return;
    setPuntaje(mia.puntaje);
    setTexto(mia.texto);
    setEditando(true);
  }

  function onCancelar() {
    setPuntaje(mia?.puntaje ?? 5);
    setTexto(mia?.texto ?? "");
    setEditando(false);
  }

  return (
    <div className="resenas">
      <p className="resenas__resumen" data-testid="resumen-resenas">
        {stats === null
          ? "Calculando…"
          : stats.cantidad === 0
            ? "Sin reseñas todavía"
            : `★ ${stats.promedio?.toFixed(1)} · ${stats.cantidad} ${stats.cantidad === 1 ? "reseña" : "reseñas"}`}
      </p>

      {error && (
        <p className="alerta alerta--error" role="alert">
          {error}
        </p>
      )}

      {usuario ? (
        mia && !editando ? (
          <div className="resenas__mia">
            <strong>Tu reseña</strong> <span aria-label={`${mia.puntaje} de 5`}>{estrellas(mia.puntaje)}</span>
            {mia.texto && <p>{mia.texto}</p>}
            <div className="resenas__botones">
              <button type="button" className="button button--small" disabled={enCurso} onClick={onEditar}>
                Editar
              </button>
              <button
                type="button"
                className="button button--small button--ghost"
                disabled={enCurso}
                onClick={() => void ejecutar(() => eliminarResena(cursoId, usuario.uid))}
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <form className="resenas__form" onSubmit={onSubmit}>
            <label>
              Puntaje{" "}
              <select value={puntaje} onChange={(e) => setPuntaje(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {estrellas(n)}
                  </option>
                ))}
              </select>
            </label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Contá tu experiencia (máx. 500 caracteres)"
              aria-label="Texto de la reseña"
            />
            <div className="resenas__botones">
              <button type="submit" className="button button--small" disabled={enCurso}>
                {mia ? "Guardar cambios" : "Publicar reseña"}
              </button>
              {mia && (
                <button type="button" className="button button--small button--ghost" disabled={enCurso} onClick={onCancelar}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )
      ) : (
        <small className="hint">Ingresá para publicar una reseña</small>
      )}

      <div className="chips" role="group" aria-label="Filtrar reseñas">
        <button type="button" className={!soloCinco ? "chip chip--activo" : "chip"} aria-pressed={!soloCinco} onClick={() => setSoloCinco(false)}>
          últimas
        </button>
        <button type="button" className={soloCinco ? "chip chip--activo" : "chip"} aria-pressed={soloCinco} onClick={() => setSoloCinco(true)}>
          ★★★★★
        </button>
      </div>

      {lista === null ? (
        <p className="hint">Cargando reseñas…</p>
      ) : lista.length === 0 ? (
        <p className="hint">{soloCinco ? "No hay reseñas de 5 estrellas." : "Todavía no hay reseñas."}</p>
      ) : (
        <ul className="resenas__lista">
          {lista.map((r) => (
            <li key={r.uid}>
              <strong>{r.autor}</strong> <span aria-label={`${r.puntaje} de 5`}>{estrellas(r.puntaje)}</span>
              {r.texto && <p>{r.texto}</p>}
              {r.creadaEn && <small>{r.creadaEn.toLocaleDateString("es-AR")}</small>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
