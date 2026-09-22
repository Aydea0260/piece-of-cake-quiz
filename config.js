/* Piece of Cake — Quiz de Arquetipos
 * Configuración del puente a Google Sheets (vía Google Form).
 *
 * Las respuestas del formulario caen en la pestaña "respuestas" de la hoja
 * "Piece of Cake — Quiz Respuestas". No requiere Apps Script.
 *
 * IMPORTANTE: se usa `var` (no `const`) para que las variables queden
 * disponibles como window.QUIZ_FORM_URL / window.QUIZ_FORM_ENTRIES.
 */
var QUIZ_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdmAfKqlk1jUai-TafkrzkdQGT4HlwM6d7I0tbjlk-WpxYQ_w/formResponse";

var QUIZ_FORM_ENTRIES = {
  nombre: "674741773",
  marca: "1179030758",
  email: "81705594",
  web_instagram: "1556766916",
  idioma: "945802651",
  reto: "1052650746",
  utm_source: "1594589431",
  primario: "951548294",
  secundario: "471070499",
  margen_pct: "1511711166",
  confianza: "1491222171",
  perfil_mixto: "412579533",
  top5_json: "1617737564",
  respuestas_json: "153678590"
};
