# AulaML · Python y C++ para Machine Learning

Plataforma educativa **estática** para aprender Python y C++ desde cero hasta producción, con
enfoque en Machine Learning. Construida con SvelteKit + Svelte 5, sin backend, sin base de datos y
sin servicios externos para el contenido.

> Documentación técnica completa, estado del contenido y hoja de ruta: **[PROYECTO.md](PROYECTO.md)**.
> Cobertura verificada del temario: **[docs/COBERTURA.md](docs/COBERTURA.md)** (77/77 temas).

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

## Despliegue

El build es completamente estático (`build/`). Sirve para GitHub Pages, Netlify, Vercel, Cloudflare
Pages o cualquier servidor de archivos. El sitio usa `trailingSlash: 'always'`, así que las rutas
terminan en `/` (`/python/py-01-que-es-python/`).

## Créditos y alcance

El contenido es material de estudio original en español. Los enlaces externos apuntan a
documentación oficial. Pyodide se carga desde jsDelivr únicamente cuando el alumno pide ejecutar
código; no se envía ningún dato.
