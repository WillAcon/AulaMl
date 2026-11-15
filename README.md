# AulaML · Python y C++ para Machine Learning

Plataforma educativa **estática** para aprender Python y C++ desde cero hasta producción, con
enfoque en Machine Learning. Construida con SvelteKit + Svelte 5, sin backend, sin base de datos y
sin servicios externos para el contenido.

> Documentación técnica y cobertura del temario: carpeta `docs/` del proyecto local
> (`../docs/PROYECTO.md` y `../docs/COBERTURA.md`), fuera del repositorio de despliegue.

## Qué incluye

- **Dos cursos completos**: 65 lecciones y 20 módulos (38 de Python, 27 de C++).
- **107 933 palabras** de explicaciones, 194 evaluaciones, 129 ejercicios, 65 retos de completar
  código, 84 visualizaciones interactivas y 356 bloques de código.
- **Lecciones con estructura de clase**: qué es, para qué sirve, cómo funciona por dentro,
  sintaxis, ejemplos progresivos, visualización, errores comunes, buenas prácticas, ejercicios,
  soluciones, resumen y evaluación.
- **Visualizaciones interactivas**: traza línea a línea, slicing con índices, mapa de memoria
  (stack/heap/punteros), matrices y tensores.
- **Práctica**: evaluaciones de opción múltiple, completar código y ejercicios con solución.
- **Buscador local** en todo el contenido, con sinónimos, filtros por lenguaje y enlaces a la
  sección exacta.
- **Progreso local**: lecciones completadas, favoritos, notas, respuestas y tema claro/oscuro en
  `localStorage`.
- **Analítica opcional GA4**: page views SPA y eventos de búsqueda, lecciones, quizzes, ejercicios,
  código, favoritos y tema. Se activa con `PUBLIC_GA_MEASUREMENT_ID`.
- **Ejecución opcional de Python** en el navegador con Pyodide (se descarga solo al pulsar
  «Probar»). El sitio funciona sin conexión para leer y estudiar.

## Comandos

```bash
npm install          # instalar dependencias
npm run dev          # servidor de desarrollo
npm run build        # generar el sitio estático en build/
npm run preview      # previsualizar el build
npm run validate     # validar todo el contenido JSON
npm run verify:traces  # comprobar trazas Python contra ejecución real
npm run verify:cpp     # compilar ejemplos C++ autocontenidos
npm run audit          # auditar la cobertura del temario
```

Para validar una sola lección:

```bash
node scripts/validate-content.mjs --solo=py-02-variables-tipos
```

## Estructura

```
src/
├── app.css                     sistema de diseño
├── app.html
├── lib/
│   ├── components/             UI reutilizable (CodeBlock, TracePlayer, Quiz, …)
│   ├── content/
│   │   ├── python/*.json       una lección por archivo
│   │   └── cpp/*.json
│   ├── data/
│   │   └── curriculum.json     cursos → módulos → ids de lección
│   ├── data.ts                 carga y resuelve el contenido
│   ├── search.ts               índice y ranking de búsqueda
│   ├── progress.svelte.ts      progreso en localStorage
│   └── types.ts                tipos de lección y bloques
├── routes/
│   ├── +page.svelte            inicio
│   ├── [track]/                portada del curso
│   ├── [track]/[slug]/         lección
│   ├── buscar/                 buscador
│   └── practica/               índice de ejercicios
└── scripts/validate-content.mjs
```

## Añadir una lección

1. Crea `src/lib/content/python/<id>.json` (o `cpp/`).
2. Añade el `id` al módulo correspondiente en `src/lib/data/curriculum.json`.
3. Sigue el esquema y las reglas de [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md).
4. Ejecuta `npm run validate`, `npm run verify:traces`, `npm run verify:cpp` y `npm run audit`.
5. `npm run build` genera automáticamente la ruta y la incluye en el buscador.

Los componentes no se tocan: toda lección nueva es datos.

## Analítica (GA4)

La integración es opcional y se activa solo si defines el Measurement ID.

1. Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

2. Coloca tu ID de GA4:

```dotenv
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
PUBLIC_GA_FORCE=false
```

3. En Vercel, añade `PUBLIC_GA_MEASUREMENT_ID` en **Settings → Environment Variables**
   (Production y, si quieres, Preview) y vuelve a desplegar: SvelteKit lo inserta en build.

En desarrollo GA no se carga por defecto para no contaminar las métricas. Para probar eventos en
local, usa `PUBLIC_GA_FORCE=true`.

### Eventos enviados

| Evento | Cuándo se envía |
|---|---|
| `page_view` | Carga inicial y cada navegación SPA |
| `lesson_start` | Al abrir una lección |
| `lesson_complete` / `lesson_uncomplete` | Al marcar/desmarcar una lección |
| `quiz_answer` | Al responder una evaluación (`correct`, `selected`) |
| `exercise_complete` / `exercise_reopen` | Al marcar/desmarcar un ejercicio |
| `fill_complete` | Al acertar todos los huecos de un código |
| `code_run` | Al ejecutar Python con Pyodide (`success`, `duration_ms`) |
| `code_copy` | Al copiar un bloque de código |
| `search` | Al enviar una búsqueda |
| `search_result_click` | Al abrir un resultado (`position`, `source`) |
| `search_suggestion_click` | Al usar una sugerencia del buscador |
| `favorite_toggle` | Al añadir/quitar un favorito |
| `theme_change` | Al cambiar entre tema claro y oscuro |

Los eventos se envían a `dataLayer` mediante `gtag`. No se envía el texto de las notas personales ni
las respuestas escritas en los ejercicios.

> GA4 usa cookies. Si esperas tráfico de la UE, añade un banner de consentimiento antes de cargar
> `initAnalytics()`; la función está aislada en `src/lib/analytics.ts` para facilitarlo.

## Despliegue

El build es completamente estático (`build/`) y el proyecto ya incluye **`vercel.json`** para que
Vercel no busque `dist`:

```json
{
  "framework": null,
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "trailingSlash": true
}
```

Pasos en Vercel:

1. Importa el repositorio.
2. Si el repositorio contiene varias carpetas, configura **Root Directory** en
   `Programacion Machine Learning/lenguajes` (o sube solo esa carpeta).
3. Deja **Framework Preset: Other** y no cambies el Output Directory: `vercel.json` ya indica
   `build`.
4. Deploy. El sitio usa `trailingSlash: 'always'`, así que las rutas terminan en `/`
   (`/python/py-01-que-es-python/`).

Si prefieres configurarlo sin `vercel.json`, ve a **Project Settings → Build & Development
Settings** y pon **Output Directory: `build`**. El error `STATIC_BUILD_NO_OUT_DIR` aparece
justamente porque Vercel busca `dist` por defecto.

También sirve para GitHub Pages, Netlify, Cloudflare Pages o cualquier servidor de archivos.

## Créditos y alcance

El contenido es material de estudio original en español. Los enlaces externos apuntan a
documentación oficial. Pyodide se carga desde jsDelivr únicamente cuando el alumno pide ejecutar
código; no se envía ningún dato.
