# Reflexión — Caso Práctico 2: SQL con Firebase SQL Connect, modelo relacional y autorización

**Materia:** Programación Avanzada — 2026

**Producción:** https://clase-2-lunes.web.app

**Proyecto Firebase:** `clase-2-lunes` · servicio `catalogo` · conector `cursos` · región `us-east4`

## 1. ¿Por qué ninguna operación recibe el id del alumno como variable? ¿Qué es IDOR y cómo lo evita `auth.uid`?

IDOR (*Insecure Direct Object Reference*, en OWASP API1: *Broken Object Level Authorization*) ocurre cuando el servidor confía en un identificador que envía el cliente para decidir sobre qué objeto actuar, sin comprobar que ese objeto le pertenece. Si `MisInscripciones` recibiera `$alumnoId`, cualquier usuario autenticado podría enviar el id de otra persona y leer sus inscripciones; con `Inscribirme($alumnoId, $cursoId)` podría matricular a un tercero.

En este conector el identificador del alumno nunca viaja desde el cliente. El servidor lo toma del token verificado de Firebase Authentication:

- `Inscribirme` usa `alumnoId_expr: "auth.uid"` (`dataconnect/cursos/mutations.gql`), y solo recibe `$cursoId`.
- `MisInscripciones` busca `alumno(key: { id_expr: "auth.uid" })` (`dataconnect/cursos/queries.gql`) y no recibe ninguna variable.
- `UpsertAlumno` completa `id_expr: "auth.uid"` y `email_expr: "auth.token.email"`.

Como el `uid` proviene de un token firmado, el cliente no puede falsificarlo, y cada usuario solo puede operar sobre sus propias filas. Esto se comprobó con `npm run atacar` (sección 7): el usuario B, autenticado, no ve la inscripción del usuario A.

## 2. `ListCursos` es `PUBLIC` y `ListAlumnos` terminó en `NO_ACCESS`. ¿Qué criterio se usó? ¿Cómo haría el panel de admin para listar alumnos?

El criterio fue el tipo de dato que devuelve cada operación:

- `ListCursos` devuelve el catálogo (título, nivel, horas, descripción, cupo). Es información pública por diseño, por lo que se declaró `@auth(level: PUBLIC, insecureReason: "El catálogo de cursos es información pública.")`. SQL Connect exige justificar explícitamente el acceso público.
- `ListAlumnos` devuelve `id`, `nombre` y `email` de todos los alumnos, es decir, datos personales de terceros. La versión heredada permitía a cualquiera obtenerlos: en la auditoría inicial devolvió `{"email":"ana@ejemplo.test","id":"seed-uid-ana","nombre":"Ana Ficticia"}` sin login. Se la dejó con `@auth(level: NO_ACCESS)`, que rechaza cualquier llamada de un cliente. El nivel `USER` no alcanzaba, porque cualquier usuario registrado habría podido listar a todos los demás.

Para el panel de administración, la operación sigue sin ser invocable desde la aplicación web. Un panel de admin debería ejecutarse en un entorno de confianza (por ejemplo, un backend propio con credenciales de administrador mediante el Admin SDK, o la herramienta `firebase dataconnect:execute`), porque las llamadas con privilegios de administrador no pasan por `@auth`. Otra opción sería permitir la operación solo a usuarios con un *custom claim* de administrador asignado desde el servidor. En este trabajo no se implementó ninguna de las dos; es solo la propuesta.

## 3. ¿Qué ventaja tiene una clave primaria compuesta en `Matricula` frente a validar duplicados en el cliente?

`Matricula` se definió con `@table(key: ["alumno", "curso"])`, de modo que la clave primaria es el par (`alumnoId`, `cursoId`). La base de datos garantiza que un alumno no pueda estar inscripto dos veces en el mismo curso.

Validar en el cliente no ofrece esa garantía: el código del navegador puede ser modificado u omitido, y el atacante puede llamar a la operación directamente. Además, una verificación del tipo "consultar y luego insertar" tiene condiciones de carrera: dos solicitudes simultáneas pueden pasar la verificación y crear un duplicado. Con la restricción en la base, la integridad se cumple siempre y en un único lugar.

La clave compuesta también hace posible que `Inscribirme` sea idempotente: usa `matricula_upsert`, de modo que repetir la llamada actualiza la misma fila en lugar de fallar o duplicar. Un `matricula_insert` fallaría ante la segunda llamada por violar la clave. La auditoría lo verificó ("Inscribirme es idempotente").

## 4. La configuración de Firebase (`apiKey`, etc.) es pública. ¿Por qué no compromete la base de datos? ¿Qué capa faltaría?

Los valores de `lib/firebase-config.ts` (`apiKey`, `authDomain`, `projectId`, `appId`) solo identifican el proyecto al que se conecta el SDK; no otorgan permisos. Viajan en el bundle de JavaScript y cualquiera puede verlos. Lo que protege la base de datos son Authentication (identifica a la persona) y las reglas `@auth` de cada operación (deciden qué puede hacer). Con la configuración pública, un atacante puede llamar a las operaciones, pero cada una lo rechaza si no corresponde: `ListAlumnos` responde `PERMISSION_DENIED` e `Inscribirme` responde `UNAUTHENTICATED` sin sesión.

Lo que no frena esa configuración es el abuso desde fuera de la aplicación. Alguien puede crear cuentas gratuitas desde un script (así lo hace `scripts/atacar.mjs`), llamar a las operaciones públicas como `ListCursos` de forma masiva y consumir cuota o generar costos. La capa que faltaría es **App Check**, que verifica que las solicitudes provengan de la aplicación legítima (por ejemplo, mediante reCAPTCHA) y no de un script que solo conoce la configuración. App Check no se configuró en este trabajo.

## 5. Comparado con una API REST propia (Express + `pg`), ¿qué da SQL Connect y qué se pierde?

**Qué aporta:**
- Autenticación y autorización declarativas: `@auth` y `auth.uid` se aplican en el servidor sin escribir middleware, y cada operación debe declarar su nivel de acceso.
- Esquema relacional y operaciones tipadas en GraphQL; el SDK del cliente se genera con `firebase dataconnect:sdk:generate`.
- Consultas parametrizadas por construcción, lo que reduce el riesgo de inyección SQL frente a concatenar SQL a mano.
- Infraestructura gestionada (Cloud SQL, emuladores locales de Authentication y SQL Connect) y despliegue con `firebase deploy --only dataconnect`.

**Qué se pierde:**
- Control fino sobre el SQL y la lógica del servidor: las operaciones están limitadas a lo que permite el lenguaje de SQL Connect, y la lógica compleja (por ejemplo, controlar el cupo de un curso) es más difícil de expresar que en un backend propio.
- Portabilidad: el proyecto queda acoplado a Firebase y a Google Cloud.
- Costos: SQL Connect usa una instancia de Cloud SQL, que requiere el plan Blaze y se cobra una vez terminada la prueba sin costo.
- Con Express se podría implementar, por ejemplo, un panel de administración con roles propios sin recurrir a otra herramienta.

## 6. ¿Por qué no alcanzó con la CSP de la clase 1 y por qué conviene listar dominios exactos en `connect-src`?

La CSP de la clase 1 definía `default-src 'self'` y no incluía `connect-src`. Cuando una política no define `connect-src`, las conexiones de red (`fetch`, XHR, WebSocket) se rigen por `default-src`, que solo permite el propio origen. Como la aplicación ahora se comunica con Authentication y con SQL Connect, el navegador habría bloqueado esas solicitudes en producción ("Refused to connect").

Se agregó a `firebase.json`:

```
connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebasedataconnect.googleapis.com
```

- `identitytoolkit.googleapis.com`: registro e inicio de sesión con correo y contraseña.
- `securetoken.googleapis.com`: renovación del token de sesión.
- `firebasedataconnect.googleapis.com`: llamadas a las operaciones de SQL Connect.

Se listan dominios exactos para mantener el principio de mínimo privilegio. Un comodín como `https://*.googleapis.com` o `connect-src *` autorizaría la conexión a cientos de servicios de Google, o a cualquier sitio. Si un atacante lograra inyectar código en la página (XSS), podría enviar datos del usuario a un destino permitido por una política amplia; con orígenes exactos, esa salida queda restringida a los tres servicios que la aplicación realmente necesita. Esta política depende de que la aplicación solo use correo y contraseña: no se incluyeron los orígenes de otros métodos (popup o redirect), porque no se utilizan.

## 7. Resultados de la auditoría (`npm run atacar`)

Ambas auditorías se ejecutaron contra los **emuladores locales** (Authentication en el puerto 9099 y SQL Connect en el 9399), no contra producción. La salida completa está en `auditoria-antes.txt` y `auditoria-despues.txt`.

### Antes de corregir (`auditoria-antes.txt`)

```text
✔ ListCursos responde sin login (7 cursos) — público por diseño
✘ ListAlumnos devuelve datos personales SIN login
    Ejemplo filtrado: {"email":"ana@ejemplo.test","id":"seed-uid-ana","nombre":"Ana Ficticia"}
… Inscribirme todavía no existe (TODO L2)
    operation "Inscribirme" not found
… No se pudo inscribir al usuario A: no se pueden probar los controles de aislamiento

❌ 1 vulnerabilidad(es) · 2 pendiente(s)
```

**Vulnerabilidad inicial:** `ListAlumnos` exponía nombre y correo de todos los alumnos a cualquier persona sin iniciar sesión. Además, `Inscribirme` no estaba disponible (la mutation estaba comentada), por lo que no se podían probar los controles de aislamiento entre usuarios.

### Después de corregir (`auditoria-despues.txt`)

```text
✔ ListCursos responde sin login (7 cursos) — público por diseño
✔ ListAlumnos rechazada para un cliente
    unauthorized: you are not authorized to perform this operation
✔ Inscribirme rechazada sin login
    unauthenticated: this operation requires a signed-in user
✔ Inscribirme es idempotente (repetir no falla)
✔ MisInscripciones solo devuelve lo del usuario que llama
… DarmeDeBaja todavía no existe (TODO L5, opcional)

… Sin vulnerabilidades detectadas, 1 control(es) pendiente(s)
```

### Cómo se corrigió

- **L1:** tabla `Matricula` con clave primaria compuesta (`alumno`, `curso`) y `fecha` con `@default(expr: "request.time")`.
- **L2:** se habilitó `Inscribirme($cursoId: UUID!) @auth(level: USER)`, que usa `matricula_upsert` con `alumnoId_expr: "auth.uid"`.
- **L3:** `MisInscripciones @auth(level: USER)`, que consulta `alumno(key: { id_expr: "auth.uid" })`.
- **L4:** `ListAlumnos` con `@auth(level: NO_ACCESS)`.
- **L6:** `connect-src` con los tres orígenes exactos indicados en la sección 6.

### Verificaciones que pasaron

- Los controles de la auditoría: `ListAlumnos` rechazada, `Inscribirme` exige sesión y es idempotente, y el usuario B no ve las inscripciones del usuario A.
- `npm run build` termina correctamente.
- La verificación de headers contra producción (`node scripts/check-headers.mjs https://clase-2-lunes.web.app`) pasó los controles: `content-security-policy`, `strict-transport-security`, `x-content-type-options`, `x-frame-options`, `referrer-policy` y `permissions-policy` presentes, `cache-control: public, max-age=0, must-revalidate` en el HTML y `public, max-age=31536000, immutable` en los assets de `/_next/static/`. La política que devuelve producción incluye el `connect-src` de la sección 6.

### Limitaciones

- La operación opcional `DarmeDeBaja` (L5) no se implementó; por eso ese control figura como pendiente y la interfaz no ofrece la opción de darse de baja.
- La auditoría `atacar` se ejecutó solo contra emuladores, no contra el servicio desplegado.
- No se configuró App Check (sección 4).
