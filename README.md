# Catálogo de Cursos · Práctica 4: Cloud Firestore

Programación Avanzada — 2026. Aplicación **Next.js** (export estático) con **Firebase Authentication**
y **Cloud Firestore**: el catálogo de siete cursos es local y los usuarios autenticados publican **reseñas**
de cada curso, que se actualizan en tiempo real.

> El enunciado y la rúbrica están en el documento de la práctica. Este README es la guía técnica rápida.
> Las respuestas de reflexión están en [REFLEXION.md](REFLEXION.md).

## Qué hace la aplicación

- **Catálogo** (`/cursos`): los 7 cursos viven en `lib/cursos.ts`, con los mismos UUID y datos que
  `dataconnect/seed_data.gql`. Se pueden filtrar por título y por nivel.
- **Cuentas**: registro, inicio y cierre de sesión con correo y contraseña (Firebase Authentication).
- **Reseñas** (botón *Ver reseñas* en cada curso):
  - Lectura pública; solo los usuarios autenticados pueden publicar, editar o eliminar **su propia** reseña.
  - Una reseña por usuario y curso. Se muestran las últimas 20, de la más nueva a la más antigua,
    con filtro de 5 estrellas.
  - Cantidad y promedio calculados en el servidor con `count()` y `average()`.
  - Actualización en tiempo real con `onSnapshot`.

## Requisitos de la práctica

| Requisito | Dónde está |
|---|---|
| Modelo `cursos/{cursoId}/resenas/{uid}` con `puntaje` (entero 1–5), `texto` (≤ 500), `autor` (≤ 80) y `creadaEn` (timestamp del servidor) | `lib/resenas.ts`, `firestore.rules` |
| Crear, editar (sin tocar `creadaEn`) y eliminar la propia reseña; escucha en tiempo real; últimas 20; filtro de 5 estrellas; cantidad y promedio | `lib/resenas.ts` |
| Interfaz de reseñas integrada al catálogo | `app/components/ResenasCurso.tsx`, `app/components/Catalogo.tsx` |
| Reglas de seguridad | `firestore.rules` |
| 8 tests de reglas con `@firebase/rules-unit-testing` y `node:test` | `tests/reglas.test.mjs` |
| Índice compuesto `puntaje ASC` + `creadaEn DESC` | `firestore.indexes.json` |
| Firestore y su emulador (puerto 8080) en la configuración | `firebase.json` |
| Evidencia de fallo deliberado (regla temporal con puntaje máximo 6) | `evidencias/fallo-deliberado-puntaje-6.txt` |

## Tecnologías

Next.js 16 · React 19 · TypeScript · Firebase JS SDK 13 (`firebase/auth`, `firebase/firestore`) ·
Firebase Hosting · Firebase Emulator Suite · `@firebase/rules-unit-testing` · `node:test`.

## Configuración

1. **Node.js 20 o superior** y **Java (JDK)**: el emulador de Firestore corre sobre Java.
2. `npm install`
3. Proyecto Firebase `practica-4-firestore` (ya referenciado en `.firebaserc`) con:
   - **Authentication** con *Correo electrónico/contraseña* habilitado.
   - **Cloud Firestore** creado.
4. `lib/firebase-config.ts` contiene la configuración web del proyecto (`apiKey`, `authDomain`, `projectId`,
   `appId`). Se obtiene en la consola: *Configuración del proyecto → Tus apps → App web*. Estos valores
   no son secretos; la seguridad la dan Authentication y `firestore.rules`.

## Ejecutar la aplicación en local

En `npm run dev` la app se conecta a los **emuladores** (Auth en `127.0.0.1:9099`, Firestore en
`127.0.0.1:8080`), no al proyecto real. Se necesitan dos terminales:

```bash
npm run emulators     # 1 · Auth + Firestore locales (interfaz en http://127.0.0.1:4000)
npm run dev           # 2 · la app en http://localhost:3000
```

En el emulador de Auth cualquier correo sirve y los datos se pierden al cerrar los emuladores.
El build de producción (`npm run build`) habla con los servicios reales.

## Tests de reglas de seguridad

```bash
npm run test:reglas
```

Levanta solo el emulador de Firestore con un proyecto ficticio (`demo-practica-4-firestore`), ejecuta
`tests/reglas.test.mjs` y apaga el emulador. No toca recursos reales. Cubre estos 8 escenarios:

1. Un usuario anónimo puede leer reseñas.
2. Un usuario autenticado puede crear su propia reseña.
3. No se puede crear una reseña con el UID de otro usuario.
4. Un usuario anónimo no puede escribir.
5. Se rechazan puntajes inválidos (0, 6, decimal y texto).
6. Se rechazan campos adicionales.
7. `creadaEn` está protegido (no se acepta un valor del cliente ni se puede modificar).
8. Nadie puede escribir documentos de cursos.

> El emulador usa el puerto 8080. Si ya tenés `npm run emulators` corriendo, cerralo antes de ejecutar
> los tests, o fallarán con *port taken*.

La carpeta [evidencias/](evidencias/) guarda la salida de un fallo deliberado: con la regla temporal
`puntaje <= 6`, el test 5 falla; al restaurar `puntaje <= 5` pasan los 8.

## Comandos

Todos los scripts de `package.json`:

| Comando | Para qué |
|---|---|
| `npm run dev` | App en modo desarrollo, conectada a los emuladores |
| `npm run emulators` | Emuladores de Auth y Firestore (+ interfaz en :4000) |
| `npm run test:reglas` | Tests de `firestore.rules` contra el emulador |
| `npm run typecheck` | Verificación de tipos con TypeScript |
| `npm run build` | Build de producción (export estático en `out/`) |
| `npm run serve` | Emulador de Hosting para ver `out/` con los headers de seguridad |
| `npm run deploy:preview` | Publica un canal de preview de Hosting (vence en 1 día) |
| `node scripts/check-headers.mjs <URL>` | Verifica headers de seguridad y caché de un sitio publicado |

Scripts heredados de la práctica anterior (`npm run seed`, `npm run atacar`): requieren el emulador de
SQL Connect, que **ya no** se levanta con `npm run emulators`. **No forman parte del flujo de esta práctica.**

## Publicar reglas e índices

Las reglas (`firestore.rules`) y el índice (`firestore.indexes.json`) deben estar publicados en el proyecto
real para que la app desplegada pueda leer y filtrar reseñas. Como `firebase.json` conserva el bloque de
Data Connect de la práctica anterior, conviene publicar por servicio y no con un `deploy` completo:

```bash
npx firebase deploy --only firestore
npx firebase deploy --only hosting
```

El índice compuesto tarda unos minutos en construirse; hasta entonces el filtro de 5 estrellas puede fallar.
Los workflows de GitHub Actions están desactivados (carpeta `.github/workflows-desactivados/`).

## Estructura del proyecto

```
app/
  page.tsx · cursos/page.tsx · layout.tsx · globals.css
  components/
    AuthPanel.tsx        Registro e inicio de sesión (Firebase Auth)
    Catalogo.tsx         Lista de cursos + botón "Ver reseñas"
    FiltroCursos.tsx     Búsqueda por título y filtro por nivel
    ResenasCurso.tsx     Reseñas de un curso (formulario, lista, estadísticas)
lib/
  cursos.ts              Catálogo local de 7 cursos
  firebase.ts            Inicialización de Firebase y conexión a emuladores
  firebase-config.ts     Configuración web del proyecto
  resenas.ts             Operaciones de Firestore para reseñas
  useUsuario.ts · errores.ts · build-info.ts
firestore.rules          Reglas de seguridad
firestore.indexes.json   Índice compuesto
firebase.json            Hosting (headers y CSP), Firestore y emuladores
tests/reglas.test.mjs    Tests de las reglas
evidencias/              Salida del fallo deliberado
scripts/check-headers.mjs  Verificación de headers
```

### Archivos de la práctica anterior (solo como referencia)

Se conservan, pero **no forman parte del flujo activo de esta práctica** ni los usa la aplicación:

- `dataconnect/` (esquema, conector y `seed_data.gql`) y `src/dataconnect-generated/` (SDK generado).
- `scripts/seed.mjs` y `scripts/atacar.mjs`, y los informes `auditoria-antes.txt` y `auditoria-despues.txt`.
- El bloque `dataconnect` de `firebase.json`.

## Problemas frecuentes

- **`Port 8080 is not open` / `port taken`** al correr los emuladores o `test:reglas`: otro proceso usa el
  puerto 8080 (por ejemplo, emuladores que quedaron abiertos).
- **Las reseñas no cargan en `npm run dev`**: faltan los emuladores (`npm run emulators`).
- **`Missing or insufficient permissions` en producción**: las reglas todavía no están publicadas.
- **El filtro de 5 estrellas falla en producción con un error de índice**: el índice compuesto aún no
  está construido o no se publicó.
- **Java no encontrado** al iniciar el emulador: instalá un JDK.
