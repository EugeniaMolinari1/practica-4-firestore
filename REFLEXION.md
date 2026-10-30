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

---

## Práctica 4 · Firestore

**Proyecto Firebase:** `practica-4-firestore` · modelo `cursos/{cursoId}/resenas/{uid}` · reglas en `firestore.rules` · tests en `tests/reglas.test.mjs`.

En esta práctica el catálogo pasó a ser local (`lib/cursos.ts`) y las reseñas se guardan en Cloud Firestore. Las secciones 1 a 7 de arriba corresponden al caso práctico anterior (SQL Connect), cuyos archivos se conservan solo como referencia.

### 1. ¿Por qué utilizar el UID como identificador del documento de reseña en lugar de un ID aleatorio?

Porque el ID del documento hace cumplir la regla de negocio "una reseña por usuario y curso" sin código adicional. Con la ruta `cursos/{cursoId}/resenas/{uid}`, un segundo intento de reseñar el mismo curso apunta al mismo documento, de modo que solo puede reemplazarlo o editarlo; no puede duplicarlo.

Con IDs aleatorios (`addDoc`) habría que guardar el UID dentro del documento y evitar duplicados por otro medio. Las reglas de seguridad no pueden, de forma confiable, verificar que "no existe otra reseña de este usuario": habría que consultar con `exists()`/`get()` sobre una ruta conocida (que es justamente lo que da el UID como ID) o agregar un contador, y dos solicitudes simultáneas podrían pasar la verificación. Con el UID en la ruta, el duplicado es imposible por construcción.

Otras ventajas:

- La regla de propiedad es una comparación directa con la ruta: `request.auth.uid == uid`, sin leer el documento.
- Editar, eliminar y cargar "mi reseña" son accesos directos por ruta (`doc(...)`), sin consultas ni índices.
- `crearResena` (`setDoc`) y `editarResena` (`updateDoc`) operan sobre un destino conocido de antemano.

El costo es que el UID de cada autor queda visible en la ruta del documento. No es un secreto (no permite autenticarse), pero es información que se publica; y solo se admite una reseña por usuario y curso, que es lo que pide la consigna.

### 2. ¿Por qué guardar el nombre del autor dentro de la reseña?

Firestore no tiene *joins*. Para mostrar "quién escribió esta reseña" habría que leer otro documento por cada reseña (un perfil de usuario), lo que multiplica las lecturas y la latencia (20 reseñas serían 20 lecturas más). Además, los datos de Authentication no son legibles por otros clientes, y exponer una colección de perfiles públicos sería publicar más datos de los necesarios. Copiar el nombre dentro de la reseña (desnormalización) permite mostrar la lista con una sola consulta, que es el patrón habitual en modelos documentales: se optimiza para la lectura, que es la operación más frecuente.

Costos de esta decisión:

- Si el usuario cambia su nombre, las reseñas viejas conservan el anterior, salvo que se actualicen.
- `autor` lo envía el cliente. Las reglas actuales solo validan que sea un texto de hasta 80 caracteres; no comprueban que coincida con el nombre de la cuenta. Un usuario modificando el cliente podría escribir cualquier nombre. Para endurecerlo habría que comparar contra `request.auth.token.name`, algo que no se implementó porque excede la consigna.
- Se guarda el nombre, no el correo, para no publicar un dato personal innecesario.

### 3. ¿Qué diferencia hay entre `resource.data` y `request.resource.data` en las reglas?

- `resource.data` es el documento **tal como está guardado ahora**, antes de la operación. No existe al crear (el documento todavía no está).
- `request.resource.data` es el documento **tal como quedaría después** de la operación, es decir, lo que se intenta escribir. En una actualización parcial (`updateDoc`) incluye también los campos que no se tocaron, ya combinados. No existe al eliminar.

En `firestore.rules` se usan así:

- Al crear y actualizar, `datosValidos(request.resource.data)` valida el resultado final: campos permitidos, tipos, puntaje entre 1 y 5 y longitudes. Se valida lo que quedará guardado, no lo que viaja en la solicitud.
- Al crear: `request.resource.data.creadaEn == request.time`.
- Al actualizar: `request.resource.data.creadaEn == resource.data.creadaEn`. Solo se puede expresar comparando el valor nuevo con el valor guardado, y por eso se necesitan los dos objetos. Es lo que impide modificar `creadaEn` (test 7).

### 4. ¿Por qué validar `creadaEn` con `request.time` y no confiar en el reloj del cliente?

El reloj del cliente lo controla el usuario: puede estar mal configurado o manipularse a propósito. Si se aceptara una fecha enviada por el cliente, se podría falsificar la antigüedad de una reseña, por ejemplo poniéndole una fecha futura para quedar siempre primero en la lista, que ordena por `creadaEn` descendente y muestra solo las últimas 20.

`request.time` es la hora del servidor en el momento de la solicitud. El cliente escribe `serverTimestamp()`, un marcador que el servidor reemplaza por su propia hora, y la regla exige `creadaEn == request.time`. Así, el único valor aceptable es el que fijó el servidor. El test 7 lo comprueba: un `Timestamp` elegido por el cliente es rechazado. Para que el valor no se pueda reescribir después, la regla de actualización exige que `creadaEn` no cambie.

Mientras el servidor no confirma, la interfaz usa una estimación local solo para mostrar la reseña (`serverTimestamps: "estimate"`); el valor guardado es siempre el del servidor.

### 5. ¿Qué limitaciones tienen las consultas de agregación de Firestore y qué alternativas existen?

Las consultas de agregación (`count()`, `sum()`, `average()`) calculan en el servidor sin descargar los documentos, y es lo que usa `obtenerEstadisticas`. Limitaciones:

- **Pocas operaciones:** solo cuenta, suma y promedio. No hay mínimo, máximo, mediana ni agrupar por un campo (el equivalente a `GROUP BY`).
- **Una consulta sobre una colección:** no hay uniones entre colecciones. El promedio se calcula sobre una sola consulta, por lo que hay que ejecutar una por curso.
- **Costo y tiempo proporcionales al volumen:** el servidor debe recorrer las entradas de índice que coinciden con la consulta, y por eso la operación se factura según esa cantidad (las tarifas exactas figuran en la documentación oficial de precios de Firestore y no se detallan acá). Cuantas más reseñas tenga un curso, más trabajo implica cada cálculo; recalcular el promedio en cada cambio se vuelve cada vez más costoso.
- **Se ejecutan en el servidor, no en tiempo real:** no existe un `onSnapshot` para agregaciones. Por eso `ResenasCurso.tsx` vuelve a pedirlas cada vez que el servidor confirma un cambio en la lista, y requieren conexión.
- **Dependen de los índices** cuando se combinan con filtros.
- Con documentos que no tienen el campo numérico, `average()` los ignora, y devuelve `null` si no hay ninguno.

Alternativas:

- **Contadores y acumulados guardados:** mantener en el documento del curso `cantidad` y `sumaPuntajes`, actualizados en una transacción o con una Cloud Function al escribir una reseña. La lectura pasa a costar un documento, aunque aparecen riesgos de consistencia y un límite de escrituras sostenidas sobre un mismo documento (para lo cual existen los contadores distribuidos). Esto no se implementó porque la consigna excluye las Cloud Functions.
- **Exportar a BigQuery** (extensión de Firebase) para análisis complejos, con la demora propia de un proceso por lotes.
- **Una base relacional (SQL Connect):** para agrupar, promediar por categoría o unir tablas, SQL es la herramienta natural.

### 6. ¿Por qué las inscripciones con cupos limitados son más apropiadas para SQL Connect que para este modelo documental de Firestore?

Una inscripción con cupo tiene reglas que cruzan varios registros: que un alumno no se inscriba dos veces al mismo curso, que el curso exista y que la cantidad de inscriptos no supere el cupo, incluso cuando muchas personas se inscriben a la vez. Eso es integridad relacional y consistencia transaccional, que es lo que PostgreSQL ofrece de forma nativa:

- **Claves y restricciones:** la clave primaria compuesta (`alumno`, `curso`) de `Matricula` y las claves foráneas las garantiza la base de datos (ver sección 3 del caso anterior).
- **Transacciones entre tablas:** contar las matrículas del curso e insertar una nueva puede hacerse como una unidad atómica.
- **Consultas con uniones y agregación:** "mis inscripciones" y "cuántos inscriptos tiene el curso" son un `JOIN` y un `COUNT`.

En Firestore se puede aproximar, pero con más esfuerzo y más riesgo:

- Las reglas de seguridad no pueden contar documentos, así que un cupo solo se hace cumplir manteniendo un contador aparte y actualizándolo en una transacción junto con la inscripción.
- Ese contador es un único documento muy disputado en los cursos populares, y Firestore limita la frecuencia de escrituras sostenidas sobre un mismo documento.
- Para ver las inscripciones de un alumno y las de un curso hay que duplicar datos (o usar consultas de grupo de colecciones) y mantener ambas copias coherentes.
- No hay claves foráneas: nada impide una inscripción a un curso inexistente salvo que lo valide cada regla.

Las reseñas, en cambio, encajan bien en el modelo documental: cada una es independiente, pertenece a un usuario, se lee mucho más de lo que se escribe, se ordena por fecha y no compite por un recurso limitado. En el caso práctico anterior, el control de cupo no se llegó a implementar; el argumento es sobre qué modelo lo expresa mejor, no sobre algo ya resuelto.

### Verificaciones de esta práctica

- 8 de 8 tests de reglas aprobados (`npm run test:reglas`).
- Fallo deliberado: con la regla temporal `puntaje <= 6` falla el test 5 (puntajes inválidos); la salida está en `evidencias/fallo-deliberado-puntaje-6.txt`. Se restauró `puntaje <= 5` y volvieron a pasar los 8.
- Comprobación manual con los emuladores: crear, editar y eliminar reseñas, y actualización en tiempo real entre dos navegadores.

### Limitaciones

- Las reglas y el índice se probaron solo en el emulador; no se publicaron en el proyecto real desde esta rama.
- `autor` no se verifica contra el token de Authentication (sección 2).
- No se configuró App Check ni se implementaron Cloud Functions, moderación o paginación adicional.
