# File Upload Router

## Upload Router

| Content-Type | Action |
|---|---|
| image/* | optimize-and-store |
| application/pdf | extract-text |
| text/csv | csv-import-pipeline |
| application/json | validate-and-ingest |
| */* | quarantine-and-scan |

> Router matches on Content-Type. First match wins. Fallback is quarantine.
