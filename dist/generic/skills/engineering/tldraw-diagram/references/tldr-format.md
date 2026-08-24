# .tldr record skeleton (fallback template)

Use this only when no real export is available. It targets the tldraw v3-era
format. Always prefer copying the `schema` block and record shapes from an
actual file the user exported, because props are version-sensitive and a
mismatch fails the load silently.

## File envelope

```json
{
  "tldrawFileFormatVersion": 1,
  "schema": { "schemaVersion": 2, "sequences": { "com.tldraw.store": 4 } },
  "records": []
}
```

The real `schema.sequences` map is long and version-specific. Copy it verbatim
from an exported file rather than hand-writing it — the block above is a
placeholder that will not match a current SDK.

## Records that make up a document

The `records` array mixes these `typeName`s. Only these are needed for a file;
omit `camera`, `instance`, and `instance_page_state` (session state).

### document (exactly one)

```json
{ "id": "document:document", "typeName": "document", "gridSize": 10, "name": "", "meta": {} }
```

### page (one or more)

```json
{ "id": "page:page", "typeName": "page", "name": "Page 1", "index": "a1", "meta": {} }
```

### shape — geo box (rectangle, ellipse, diamond, …)

```json
{
  "id": "shape:box1", "typeName": "shape", "type": "geo",
  "parentId": "page:page", "index": "a1",
  "x": 100, "y": 100, "rotation": 0, "isLocked": false, "opacity": 1,
  "props": {
    "geo": "rectangle", "w": 200, "h": 100,
    "color": "black", "labelColor": "black", "fill": "none",
    "dash": "draw", "size": "m", "font": "draw",
    "text": "Service A", "align": "middle", "verticalAlign": "middle",
    "growY": 0, "url": ""
  },
  "meta": {}
}
```

### shape — text (free-floating label)

```json
{
  "id": "shape:label1", "typeName": "shape", "type": "text",
  "parentId": "page:page", "index": "a2",
  "x": 120, "y": 60, "rotation": 0, "isLocked": false, "opacity": 1,
  "props": {
    "color": "black", "size": "m", "font": "draw",
    "text": "Title", "align": "start", "autoSize": true, "scale": 1, "w": 8
  },
  "meta": {}
}
```

### shape — frame (a titled container/section)

```json
{
  "id": "shape:frame1", "typeName": "shape", "type": "frame",
  "parentId": "page:page", "index": "a0",
  "x": 40, "y": 40, "rotation": 0, "isLocked": false, "opacity": 1,
  "props": { "w": 600, "h": 400, "name": "Backend" },
  "meta": {}
}
```

Child shapes placed inside a frame use the frame's id as their `parentId`, and
their `x`/`y` are relative to the frame's origin.

### shape — arrow (with endpoint bindings)

The arrow shape carries geometry; each attached endpoint is a **separate**
`binding` record.

```json
{
  "id": "shape:arrow1", "typeName": "shape", "type": "arrow",
  "parentId": "page:page", "index": "a3",
  "x": 0, "y": 0, "rotation": 0, "isLocked": false, "opacity": 1,
  "props": {
    "dash": "draw", "size": "m", "color": "black", "fill": "none",
    "arrowheadStart": "none", "arrowheadEnd": "arrow", "font": "draw",
    "start": { "x": 0, "y": 0 }, "end": { "x": 100, "y": 0 },
    "bend": 0, "text": "", "labelPosition": 0.5, "labelColor": "black"
  },
  "meta": {}
}
```

```json
{
  "id": "binding:b1", "typeName": "binding", "type": "arrow",
  "fromId": "shape:arrow1", "toId": "shape:box1",
  "props": { "terminal": "start", "normalizedAnchor": { "x": 0.5, "y": 0.5 }, "isExact": false, "isPrecise": false },
  "meta": {}
}
```

Add a second `binding` with `terminal: "end"` pointing at the destination
shape. An arrow with no bindings still renders using its `start`/`end` points
but will not follow its endpoints when they move.

## Index ordering

`index` is a fractional-index string (`"a1"`, `"a2"`, `"a1V"`) controlling
z-order and sibling order, not a number. Keep them ascending as strings; when
in doubt, copy the pattern from an exported file.

## Validate

- `parseTldrawJsonFile({ json, schema })` in `@tldraw/tldraw` validates and
  migrates a file; a thrown error names the offending record.
- Or load it: `loadSnapshot(editor.store, snapshot)` after `getSnapshot` shape.
- Cheapest check without the SDK: every `parentId`, `fromId`, and `toId`
  resolves to an `id` present in `records`.
