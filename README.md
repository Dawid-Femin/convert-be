# Image Converter API

REST API for converting images between formats, built with NestJS and Sharp.

## Supported Formats

| Input                          | Output          |
| ------------------------------ | --------------- |
| JPEG, PNG, WebP, GIF, TIFF, BMP | JPEG, PNG, WebP |

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
- `targetFormat` — `jpeg`, `png`, or `webp`

Example:
```bash
curl -X POST http://localhost:3000/convert \
  -F "file=@image.png" \
  -F "targetFormat=webp" \
  --output converted.webp
```

## Tech Stack

- NestJS + TypeScript
- Sharp (image processing)
- Swagger (API docs)
