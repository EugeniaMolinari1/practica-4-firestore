/**
 * Configuración web de tu proyecto Firebase.
 * Consola de Firebase → ⚙ Configuración del proyecto → General → Tus apps → App web → SDK setup and configuration
 *
 * Estos valores NO son secretos: viajan en el bundle de JavaScript y cualquiera puede verlos.
 * La seguridad no depende de esconderlos, sino de Auth + las reglas de seguridad
 * de Firestore (y, más adelante, App Check).
 *
 * Mientras desarrollás con `npm run dev`, la app usa los emuladores locales y no importa
 * si estos valores son realess. Para producción tenés que completarlos.
 */

export const firebaseConfig = {
  apiKey: "AIzaSyBuRypep9Fej-rsiORCw9lux_lSYy9QPaE",
  authDomain: "practica-4-firestore.firebaseapp.com",
  projectId: "practica-4-firestore",
  appId: "1:267220378715:web:3c90ac48e0b35a52da4b7e",
};
