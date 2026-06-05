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

**Search does not take a `size` parameter.** Results are deduplicated to one representative icon per logical name and include `sizesAvailable`. The returned `id` uses a default preview size (usually 24). To fetch another size, replace the size prefix in `id` with one of `sizesAvailable`.

| User intent | Prefer |
|-------------|--------|
| Known or likely icon name (`LikeFill`, `heart outline`) | `name` search first |
| Visual concept without a name (`download arrow`, `exclamation in circle`) | `description` search |
| Short semantic word (`like`, `heart`) | `description` search; verify top `score` |
| Variant matters (`outline`, `fill`) | include variant words in the query |

## Workflow

1. **Search** by name or description
2. **Pick** the highest `score` result (or top 3–5 if ambiguous)
3. **Ignore** low-confidence results — see score guide below
4. **Check** `sizesAvailable` includes the requested size
5. **Return** to user:
   - `name`, `category`, `variant`
   - `id` — e.g. `24/Status/AttentionCircleFill`
   - Preview page — use `previewUrl` from the result
   - SVG URL — `http://81.26.181.62/api/icons/{id}/svg`
   - `sizesAvailable`

If description search returns nothing useful, retry **name search**.

## Description search ranking

Description search uses **field-aware scoring**. Final `score` is the best match across these fields, in priority order:

1. **Name** — strongest signal
   - exact compact name match: `1.0`
   - name starts with query / all query tokens in name: `0.95`
   - partial name token match: lower (e.g. 1 of 2 words → `0.425`)
2. **Tags** — generated searchable keywords
   - exact tag match: `0.9`
   - all query tokens present as tags: `0.8`
3. **Description** — complete words only, not substrings inside other words
   - consecutive phrase match: `0.7`
   - all query words present: `0.55–0.65`
4. **Category / name tokens** — weak tie-breakers: `0.15–0.3`

Important behaviors:
- `like` matches `LikeFill` by **name/tags**, not `DislikeFill` or `unlike` via substring
- incidental prose such as `features like undo` or `plug-like` scores low (`~0.55`), not top-tier
- multi-word queries filter out weak partial matches

### Score thresholds

Results below the threshold are excluded from the API response:

| Query type | Minimum score |
|------------|---------------|
| Single word (`like`) | `> 0.2` |
| Multiple words (`heart outline`) | `> 0.5` |

### How to read scores

| Score | Meaning |
|-------|---------|
| `1.0` | Exact name match — very high confidence |
| `0.95` | Strong name match — high confidence |
| `0.9` | Exact tag match — high confidence |
| `0.65–0.8` | Good semantic match via tags or description |
| `0.55` | Description-only single-word match — use with caution |
| below threshold | filtered out |

Prefer results with `score >= 0.9` when available. For multi-word queries, expect only results where all words matched meaningfully.

## API examples

```http
GET http://81.26.181.62/api/search?name=ArrowBarDown
GET http://81.26.181.62/api/search?name=LikeFill
GET http://81.26.181.62/api/search?description=arrow+bar+down
GET http://81.26.181.62/api/search?description=like
GET http://81.26.181.62/api/search?description=heart+outline
GET http://81.26.181.62/api/search?description=exclamation+inside+circle
GET http://81.26.181.62/api/icons/24/Arrows/ArrowBarDown/svg
GET http://81.26.181.62/api/icons/24/Toggle/LikeFill/svg
GET http://81.26.181.62/api/icons?category=Arrows&size=24&q=arrow
GET http://81.26.181.62/api/health
```

## Search response

```json
{
  "query": "like",
  "mode": "description",
  "results": [
    {
      "id": "24/Toggle/LikeFill",
      "name": "LikeFill",
      "category": "Toggle",
      "variant": "Fill",
      "sizesAvailable": [16, 24, 36],
      "description": "A filled icon depicting a hand with the thumb raised, commonly recognized as a 'like' gesture.",
      "tags": ["like", "thumbs up", "agree", "approve"],
      "score": 1,
      "svgUrl": "http://81.26.181.62/api/icons/24/Toggle/LikeFill/svg",
      "previewUrl": "http://81.26.181.62/?description=like&selected=24%2FToggle%2FLikeFill"
    }
  ]
}
```

- `id` = `{size}/{Category}/{Name}` — use for SVG fetch
- `previewUrl` = main UI page with the search already opened and this icon selected
- `svgUrl` = raw SVG endpoint
- `description` / `tags` = generated metadata used for semantic ranking
- `score` = 0–1, higher is better
- one result per logical icon; check `sizesAvailable` for other sizes

## Naming

- PascalCase: `ArrowBarDown`, `AttentionCircleFill`, `CameraVideoOutline`
- Suffixes: `Fill`, `Outline`, or none
- Categories: `Arrows`, `Media`, `Status`, `Commerce`, `Navigation`, `Devices`, `Communication`, `Operation`, `User`, `Travel`, `Weather`, and others

## Rules

- Do **not** call `/api/admin/*`
- Not every icon exists at every size — check `sizesAvailable`
- SVGs are white — use on dark backgrounds
- Icon examples must be real names from search results, not invented

## Examples

### Arrow bar down

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

### Like icon

**User:** "Icon for like / thumbs up"

```http
GET http://81.26.181.62/api/search?description=like
```

**Answer:**
- Name: `LikeFill` or `LikeOutline` (top results, score `1.0`)
- Category: `Toggle`
- SVG: http://81.26.181.62/api/icons/24/Toggle/LikeFill/svg
- Do not pick `DislikeFill` or unrelated icons with incidental `like` in description text

### Heart outline

**User:** "Heart outline icon"

```http
GET http://81.26.181.62/api/search?description=heart+outline
```

**Answer:**
- Name: `HeartOutline` (score `1.0`)
- Other strong matches: `HeartCircleOutline`, `HeartBoxOutline`, etc.
- `HeartFill` is filtered out because it only partially matches the query
