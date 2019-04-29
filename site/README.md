# Docs site

Uses mkdocs

## Running locally

```bash
./build-site
docker run -p 8000:8000 http4t/mkdocs mkdocs serve --dev-addr=0.0.0.0:8000
```
