# Image Converter API

REST API for converting images between formats, built with NestJS and Sharp.

## Supported Formats

| Input                                    | Output                    |
| ---------------------------------------- | ------------------------- |
| JPEG, PNG, WebP, GIF, TIFF, BMP, AVIF, SVG | JPEG, PNG, WebP, AVIF, TIFF |

Max file size: 20MB

## Setup

```bash
npm install
npm run start:dev
```

## API

API documentation available at `http://localhost:3000/api` (Swagger UI).

### `GET /formats`

Returns supported input/output formats.

### `POST /convert`

Converts an image to the specified format.

- Content-Type: `multipart/form-data`
- `file` — image file
- `targetFormat` — `jpeg`, `png`, `webp`, `avif`, or `tiff`
- `quality` (optional) — `1-100`, only for JPEG, WebP, AVIF

Examples:
```bash
# Basic conversion
curl -X POST http://localhost:3000/convert \
  -F "file=@image.png" \
  -F "targetFormat=webp" \
  --output converted.webp

# With quality
curl -X POST http://localhost:3000/convert \
  -F "file=@photo.jpg" \
  -F "targetFormat=avif" \
  -F "quality=80" \
  --output compressed.avif
```

## Tech Stack

- NestJS + TypeScript
- Sharp (image processing)
- Swagger (API docs)
