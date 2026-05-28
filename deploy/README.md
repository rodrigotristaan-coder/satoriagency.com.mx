# Boda Carlos & Verónica — Deploy a Vercel

## Opción 1 — Drag & drop (más rápido)
1. Entra a **vercel.com/new**
2. Arrastra esta carpeta completa (`vercel-deploy/`) al área de drop
3. Click en **Deploy**
4. Listo — tu URL estará lista en ~30 segundos

## Opción 2 — Vercel CLI
```bash
cd vercel-deploy
npx vercel --prod
```

## Opción 3 — GitHub
1. Sube esta carpeta a un repo de GitHub
2. Conecta el repo en vercel.com/new
3. Framework Preset: **Other** (déjalo en blanco)
4. Output Directory: `.`
5. Deploy

---

## Contenido
- `index.html` — invitación completa (todo embebido: imágenes, audio, scripts, estilos)
- `vercel.json` — configuración de cache y headers

## Notas
- Es 100% HTML estático, no necesita build step ni framework
- Funciona offline una vez cargada
- Tamaño total: ~8.3 MB (incluye 2 canciones MP3 y todas las fotos)
- Compatible con cualquier hosting estático (Netlify, Cloudflare Pages, GitHub Pages, etc.)
