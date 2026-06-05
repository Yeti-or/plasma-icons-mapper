---
name: plasma-icons-search
description: >-
  Search Plasma design-system icons by name or semantic description at
  http://81.26.181.62/api. Fetch SVG URLs and metadata for UI implementation.
  Use when finding icons, looking up Plasma icon names, picking icons for
  buttons or navigation, or when the user mentions icon search, SVG icons,
  or the Plasma icon library.
---

# Plasma Icons Search

**Web UI:** http://81.26.181.62/  
**API base:** http://81.26.181.62/api

## How to use (Claude)

1. Upload this file to your **Claude Project → Project knowledge**
2. Optional custom instruction:
   ```
   When searching Plasma icons, follow the uploaded skill.
   Use HTTP requests to http://81.26.181.62/api. Default icon size is 24.
   ```
3. Claude needs **web access** to call the API

---

## When to use

- User needs an icon by description ("download arrow", "attention in a circle")
- User mentions a PascalCase icon name (`ArrowBarDown`, `AttentionCircleFill`)
- User needs an SVG URL, preview page, or available sizes

Use **HTTP API calls** only. Do not guess icon names. Do not use browser automation.

## Quick decision

| Input | Endpoint |
|-------|----------|
| Icon name or partial name | `GET /api/search?name={query}` |
| Visual / semantic description | `GET /api/search?description={query}` |
| SVG after search | `GET /api/icons/{id}/svg` |

Search does not take a size parameter. Results include `sizesAvailable`; use the returned `id` for a default preview SVG, or replace the size prefix in `id` with one of `sizesAvailable` when the user needs a specific size.

## Workflow

1. **Search** by name or description
2. **Pick** highest `score` result (or top 3–5 if ambiguous)
3. **Check** `sizesAvailable` includes requested size
4. **Return** to user:
   - `name`, `category`, `variant`
   - `id` — e.g. `24/Status/AttentionCircleFill`
   - Preview page — use `previewUrl` from the result
   - SVG URL — `http://81.26.181.62/api/icons/{id}/svg`
   - `sizesAvailable`

## API examples

```http
GET http://81.26.181.62/api/search?name=ArrowBarDown
GET http://81.26.181.62/api/search?description=arrow+bar+down
GET http://81.26.181.62/api/search?description=exclamation+inside+circle
GET http://81.26.181.62/api/icons/24/Arrows/ArrowBarDown/svg
GET http://81.26.181.62/api/icons/24/Status/AttentionCircleFill/svg
GET http://81.26.181.62/api/icons?category=Arrows&size=24&q=arrow
GET http://81.26.181.62/api/health
```

## Search response

```json
{
  "query": "arrow bar down",
  "mode": "description",
  "results": [
    {
      "id": "24/Arrows/ArrowBarDown",
      "name": "ArrowBarDown",
      "category": "Arrows",
      "variant": null,
      "sizesAvailable": [16, 24, 36],
      "score": 0.9,
      "svgUrl": "http://81.26.181.62/api/icons/24/Arrows/ArrowBarDown/svg",
      "previewUrl": "http://81.26.181.62/?description=arrow+bar+down&selected=24%2FArrows%2FArrowBarDown"
    }
  ]
}
```

- `id` = `{size}/{Category}/{Name}` — use for SVG fetch
- `previewUrl` = main UI page with the search already opened and this icon selected
- `svgUrl` = raw SVG endpoint
- `score` = 0–1, higher is better
- If description search fails, retry **name search**

## Naming

- PascalCase: `ArrowBarDown`, `AttentionCircleFill`, `CameraVideoOutline`
- Suffixes: `Fill`, `Outline`, or none
- Categories: `Arrows`, `Media`, `Status`, `Commerce`, `Navigation`, `Devices`, `Communication`, `Operation`, `User`, `Travel`, `Weather`, and others

## Rules

- Do **not** call `/api/admin/*`
- Not every icon exists at every size — check `sizesAvailable`
- SVGs are white — use on dark backgrounds
- Icon examples must be real names from search results, not invented

## Full example

**User:** "Arrow bar down icon"

```http
GET http://81.26.181.62/api/search?description=arrow+bar+down
```

**Answer:**
- Name: `ArrowBarDown`
- Category: `Arrows`
- Preview: http://81.26.181.62/?description=arrow+bar+down&selected=24%2FArrows%2FArrowBarDown
- SVG: http://81.26.181.62/api/icons/24/Arrows/ArrowBarDown/svg
- Sizes: 16, 24, 36
