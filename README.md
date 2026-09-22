# Quiz de Arquetipos — Piece of Cake (GitHub Page)

Sitio estático del test de arquetipos de marca: 20 preguntas (~5 minutos),
scoring ponderado según `quiz-v2-spec.md`, resultado instantáneo sin email
obligatorio y formulario de lead que envía a Google Sheets vía Apps Script.

## Archivos

| Archivo      | Qué es |
|---|---|
| `index.html` | Estructura: bienvenida → quiz → resultado → formulario lead |
| `styles.css` | Diseño cálido premium, mobile-first, 100% responsive |
| `app.js`     | Lógica del quiz, scoring exacto, i18n ES/EN, envío del lead, compartir |
| `config.js`  | `APPS_SCRIPT_URL`: pega aquí la URL de la app web de Apps Script |
| `data.json`  | 20 preguntas ES/EN + 12 arquetipos (esencia y ejemplos) — **no editar a mano** |
| `test-scoring.js` | Pruebas del scoring: `node test-scoring.js` |
| `Code.gs`    | Puente Apps Script → Google Sheet (**se despliega en Google, no en GitHub**) |

## Despliegue, paso a paso

### A. Conectar el puente a Google Sheets (una sola vez)

1. Ve a [script.google.com](https://script.google.com) con la cuenta
   `jarvis.aydea@gmail.com` → **Nuevo proyecto**.
2. Borra el contenido del editor, pega **todo** el contenido de `Code.gs`
   y guarda (Ctrl/Cmd+S).
3. **Implementar → Nueva implementación** → tipo **Aplicación web**.
   - *Ejecutar como:* **Yo**
   - *Quién tiene acceso:* **Cualquier usuario**
   - Clic en **Implementar** y autoriza cuando lo pida.
4. Copia la **URL de la aplicación web** (termina en `/exec`).
5. En `config.js`, reemplaza `"PEGAR_URL_AQUI"` por esa URL, entre comillas.
6. (Opcional) En el editor de Apps Script: **Ejecutar → testAppend** y
   verifica que aparezca una fila `PRUEBA` en la hoja `respuestas` del
   spreadsheet `Piece of Cake — Quiz Respuestas`.

### B. Publicar el sitio en GitHub Pages

1. En GitHub, crea un repositorio nuevo (p. ej. `piece-of-cake-quiz`).
   Puede ser público o privado; Pages funciona con ambos.
2. Sube estos archivos a la raíz del repo (rama `main`):
   `index.html`, `styles.css`, `app.js`, `config.js`, `data.json`.
   (`Code.gs` y `test-scoring.js` no son necesarios en el sitio, pero no
   estorban si los subes.)
3. En el repo: **Settings → Pages**.
4. En *Build and deployment*, Source: **Deploy from a branch**.
   Branch: **main** · carpeta: **/ (root)** → **Save**.
5. Espera 1–2 minutos. Tu quiz vivirá en
   `https://TU_USUARIO.github.io/piece-of-cake-quiz/`.

### C. Distribuir con UTMs

Agrega `?utm_source=` a los enlaces para saber de dónde viene cada lead.
El sitio lo captura solo y lo envía con el formulario:

- Web: `.../piece-of-cake-quiz/?utm_source=web`
- Instagram bio: `?utm_source=instagram_bio`
- TikTok bio: `?utm_source=tiktok_bio`
- Stories / posts: `?utm_source=stories`, `?utm_source=posts`

## Probar en local

```bash
cd ~/workspace/quiz-site
python3 -m http.server 8000
# abre http://localhost:8000
```

```bash
node test-scoring.js   # verifica el scoring contra el spec
```

## Notas

- El resultado se muestra **antes** de pedir el email: el email solo se pide
  para enviar el Brand Voice Playbook gratis.
- Si el envío a Google Sheets falla (o falta la URL en `config.js`), el
  usuario ve su resultado y el mensaje de éxito igual; el sitio reintenta el
  envío en silencio 4 segundos después.
- Idioma por defecto según el navegador (ES si empieza con `es`, si no EN);
  el visitante puede cambiarlo en la pantalla de bienvenida.
