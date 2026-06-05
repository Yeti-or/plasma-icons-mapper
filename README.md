# Plasma Icons Mapper

TypeScript service and React UI for searching Plasma SVG icons by name or generated description.

## Features

- Search icons by name (`?name=AttentionCircleFill`) or description (`?description=icon+inside+circle`)
- Optional `size` query param, defaults to `24`
- Search results include `category`
- Filesystem-backed description storage generated via [OpenRouter](https://openrouter.ai)
- Admin UI for batch generation, stale detection, force regeneration, and prompt testing

## Setup

```bash
npm install
cp .env.example .env
```

Set `OPENROUTER_API_KEY` in `.env` before running description generation.

## Development

```bash
npm run dev
```

- API: http://localhost:3001
- Web UI: http://localhost:5173

## AI agent skill

Share [`skills/plasma-icons-search/SKILL.md`](skills/plasma-icons-search/SKILL.md) with colleagues — upload it to a Claude Project knowledge.

## Scripts

- `npm run dev` - start API and web UI
- `npm run dev:server` - API only
- `npm run dev:web` - web UI only
- `npm test` - server tests
- `npm run build` - build all packages

## API

- `GET /api/search?name=AttentionCircleFill&size=24`
- `GET /api/search?description=icon+inside+circle&size=24`
- `GET /api/icons`
- `GET /api/icons/:id`
- `GET /api/icons/:id/svg`
- `POST /api/admin/descriptions/generate`
- `POST /api/admin/descriptions/test`
- `GET /api/admin/descriptions/status`

## Description generation modes

Descriptions are generated **once per unique icon** (`Category/Name`) and shared across all available sizes. Generation uses the size 24 SVG when available.

- `missing` - only icons without saved descriptions
- `stale` - missing icons and icons whose representative SVG hash changed
- `force` - regenerate selected or all icons, archiving previous descriptions in the run log
