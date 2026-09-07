import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL no está definida. Ejecuta con: node --env-file=.env scripts/migrate.mjs');
  process.exit(1);
}

const schemaPath = fileURLToPath(new URL('../sql/schema.sql', import.meta.url));
const schema = readFileSync(schemaPath, 'utf8');
const statements = schema
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

const sql = neon(process.env.DATABASE_URL);

for (const statement of statements) {
  await sql.query(statement);
}

console.log(`Migración aplicada: ${statements.length} sentencias ejecutadas.`);
