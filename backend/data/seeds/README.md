# Seed data (database-agnostic)

These JSON files are the single source of truth for initial data. The app loads them at startup when the database is empty (current backend: MongoDB). The same files can be used to seed any other database (PostgreSQL, SQLite, etc.) by writing a loader that reads these files and inserts into your store.

## Files

| File | Description | Shape |
|------|-------------|--------|
| `glossary.json` | Glossary entries (source → target terms) | Array of `{"source": string, "target": string, "target_language": string}` (e.g. `"es"`) |
| `dictionary.json` | Dictionary entries (term → definition) | Array of `{"term": string, "definition": string, "target_language": string}` |
| `translation_memories.json` | Demo TM (matches videogame demo docs) | Array of `{"tm_id": string, "source_language": string, "target_language": string, "pairs": [{"source": string, "target": string}]}` |

The default TM **videogame-demo** is seeded when the database is empty so fuzzy matching returns real data for the demo documents.

## Overriding the path

Set the `SEEDS_DIR` environment variable to the absolute or relative path of the directory containing these JSON files (e.g. for a different environment or copy of the seeds).
