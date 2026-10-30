/**
 * Tests de firestore.rules contra el emulador de Firestore.
 * Se ejecutan con `npm run test:reglas` (levanta el emulador, corre los tests y lo apaga).
 */
import { after, before, beforeEach, describe, test } from "node:test";
import { readFileSync } from "node:fs";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";

const CURSO = "0b7c1a2e-0001-4c3a-9d5e-000000000001";
const ALICE = "alice";
const BOB = "bob";

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-practica-4-firestore",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

const ref = (db, uid = ALICE) => doc(db, "cursos", CURSO, "resenas", uid);
const valida = (extra = {}) => ({ puntaje: 4, texto: "Muy buen curso", autor: "Alice", creadaEn: serverTimestamp(), ...extra });

/** Deja una reseña de Alice ya guardada, saltando las reglas. */
async function sembrarResenaDeAlice() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(ref(ctx.firestore()), { puntaje: 4, texto: "Muy buen curso", autor: "Alice", creadaEn: Timestamp.fromMillis(1_700_000_000_000) });
  });
}

describe("reglas de Firestore: reseñas", () => {
  test("1. un usuario anónimo puede leer reseñas", async () => {
    await sembrarResenaDeAlice();
    const anon = env.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(ref(anon)));
  });

  test("2. un usuario autenticado puede crear su propia reseña", async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    await assertSucceeds(setDoc(ref(db), valida()));
  });

  test("3. un usuario no puede crear una reseña con el UID de otro", async () => {
    const db = env.authenticatedContext(BOB).firestore();
    await assertFails(setDoc(ref(db, ALICE), valida()));
  });

  test("4. un usuario anónimo no puede escribir", async () => {
    const anon = env.unauthenticatedContext().firestore();
    await assertFails(setDoc(ref(anon), valida()));
  });

  test("5. se rechazan puntajes inválidos (0, 6, decimal y texto)", async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    for (const puntaje of [0, 6, 3.5, "5"]) {
      await assertFails(setDoc(ref(db), valida({ puntaje })));
    }
  });

  test("6. se rechazan campos adicionales", async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    await assertFails(setDoc(ref(db), valida({ admin: true })));
  });

  test("7. creadaEn está protegido: no se acepta un valor del cliente ni se puede modificar", async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    // Al crear debe ser la hora del servidor, no una fecha enviada por el cliente.
    await assertFails(setDoc(ref(db), valida({ creadaEn: Timestamp.fromMillis(1_000) })));

    // Al actualizar, creadaEn debe conservarse.
    await sembrarResenaDeAlice();
    await assertFails(updateDoc(ref(db), { creadaEn: Timestamp.fromMillis(2_000) }));
    await assertSucceeds(updateDoc(ref(db), { puntaje: 5, texto: "Excelente" }));
  });

  test("8. nadie puede escribir documentos de cursos", async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    await assertFails(setDoc(doc(db, "cursos", CURSO), { titulo: "Hackeado" }));
    await assertFails(deleteDoc(doc(db, "cursos", CURSO)));
  });
});
