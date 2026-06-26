import { Client } from 'pg';
import fs from 'fs';

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Missing DATABASE_URL");
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false } // Required for remote Supabase
  });

  try {
    await client.connect();
    console.log("Connected to remote Supabase database.");

    console.log("Running base schema 0000_schema.sql...");
    let schemaSql = fs.readFileSync('c:/NexusLearn AI/supabase/migrations/0000_schema.sql', 'utf-8');
    
    schemaSql = schemaSql
      .replace(/CREATE SCHEMA IF NOT EXISTS auth;/g, "")
      .replace(/CREATE TABLE IF NOT EXISTS auth\.users [\s\S]*?\);/g, "")
      .replace(/CREATE OR REPLACE FUNCTION auth\.uid[\s\S]*?LANGUAGE SQL STABLE;/g, "");
    
    // Check if vector extension is available in pg_available_extensions
    const extCheck = await client.query("SELECT * FROM pg_available_extensions WHERE name = 'vector'");
    if (extCheck.rows.length === 0) {
      console.warn("WARNING: 'vector' extension (pgvector) is NOT installed. Modifying schema for local fallback...");
      schemaSql = schemaSql
        .replace(/CREATE EXTENSION IF NOT EXISTS vector;/g, "-- CREATE EXTENSION IF NOT EXISTS vector;")
        .replace(/vector\(1536\)/g, "double precision[]")
        .replace(/1 - \(notes\.embedding <=> query_embedding\)/g, "1.0")
        .replace(/notes\.embedding <=> query_embedding/g, "1.0")
        .replace(/ORDER BY notes\.embedding <=> query_embedding/g, "-- ORDER BY embedding");
    }
    
    await client.query(schemaSql);
    console.log("Base schema 0000_schema.sql applied successfully.");

    console.log("Running migration 0001_missing_tables.sql...");
    const migrationSql = fs.readFileSync('c:/NexusLearn AI/supabase/migrations/0001_missing_tables.sql', 'utf-8');
    await client.query(migrationSql);
    console.log("Migration 0001_missing_tables.sql completed successfully.");

    console.log("All tables created successfully!");

  } catch (err) {
    console.error("Migration execution failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
