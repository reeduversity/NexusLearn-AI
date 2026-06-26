const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const dbUrl = "postgresql://postgres:Ram%40%23%2a2003@localhost:5432/nexuslearn_ai";
  
  // 1. Connect to default 'postgres' database to ensure 'nexuslearn_ai' database exists
  const pgClient = new Client({
    connectionString: "postgresql://postgres:Ram%40%23%2a2003@localhost:5432/postgres"
  });
  
  try {
    await pgClient.connect();
    console.log("Connected to default postgres database.");
    
    const dbCheck = await pgClient.query("SELECT 1 FROM pg_database WHERE datname = 'nexuslearn_ai'");
    if (dbCheck.rows.length === 0) {
      console.log("Database 'nexuslearn_ai' does not exist. Creating database...");
      await pgClient.query("CREATE DATABASE nexuslearn_ai");
      console.log("Database 'nexuslearn_ai' created successfully.");
    } else {
      console.log("Database 'nexuslearn_ai' already exists.");
    }
  } catch (err) {
    console.error("Error checking/creating database:", err.message);
  } finally {
    await pgClient.end();
  }

  // 2. Connect directly to 'nexuslearn_ai' database
  const client = new Client({
    connectionString: dbUrl
  });

  try {
    await client.connect();
    console.log("Connected to 'nexuslearn_ai' database.");

    // Ensure the auth schema and auth.users exist for Supabase compatibility
    console.log("Setting up mock auth schema for Supabase compatibility...");
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE,
        raw_user_meta_data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("Mock auth schema configured.");

    // Ensure the base schema is applied first if profiles table is missing
    const tableCheck = await client.query("SELECT to_regclass('public.profiles')");
    if (!tableCheck.rows[0].to_regclass) {
      console.log("Profiles table is missing. Running base schema 0000_schema.sql first...");
      let schemaSql = fs.readFileSync('c:/NexusLearn AI/supabase/migrations/0000_schema.sql', 'utf-8');
      
      // Check if vector extension is available in pg_available_extensions
      const extCheck = await client.query("SELECT * FROM pg_available_extensions WHERE name = 'vector'");
      if (extCheck.rows.length === 0) {
        console.warn("WARNING: 'vector' extension (pgvector) is NOT installed on this PostgreSQL instance.");
        console.warn("Preprocessing schema to map pgvector types to standard double precision arrays for local fallback...");
        
        schemaSql = schemaSql
          .replace(/CREATE EXTENSION IF NOT EXISTS vector;/g, "-- CREATE EXTENSION IF NOT EXISTS vector;")
          .replace(/vector\(1536\)/g, "double precision[]")
          .replace(/1 - \(notes\.embedding <=> query_embedding\)/g, "1.0")
          .replace(/notes\.embedding <=> query_embedding/g, "1.0")
          .replace(/ORDER BY notes\.embedding <=> query_embedding/g, "-- ORDER BY embedding");
      }
      
      await client.query(schemaSql);
      console.log("Base schema 0000_schema.sql applied successfully.");
    }

    // Read and run the new migration 0001_missing_tables.sql
    console.log("Running migration 0001_missing_tables.sql...");
    const migrationSql = fs.readFileSync('c:/NexusLearn AI/supabase/migrations/0001_missing_tables.sql', 'utf-8');
    await client.query(migrationSql);
    console.log("Migration 0001_missing_tables.sql completed successfully.");

    // VERIFICATION STEPS
    console.log("\n=== VERIFICATION REPORT ===");

    // Table exist check
    const tables = ['quizzes', 'chat_sessions', 'savings_goals'];
    console.log("\n1. Table Existence:");
    for (const table of tables) {
      const res = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${table}'
        )
      `);
      const exists = res.rows[0].exists;
      console.log(`  - Table '${table}' exists: ${exists ? "Yes" : "No"}`);
    }

    // RLS check
    console.log("\n2. Row Level Security (RLS) Status:");
    for (const table of tables) {
      const res = await client.query(`
        SELECT relrowsecurity FROM pg_class 
        WHERE oid = 'public.${table}'::regclass
      `);
      const rlsEnabled = res.rows[0].relrowsecurity;
      console.log(`  - Table '${table}' RLS Enabled: ${rlsEnabled ? "Yes" : "No"}`);
    }

    // Policies check
    console.log("\n3. Active Policies:");
    for (const table of tables) {
      const res = await client.query(`
        SELECT policyname, definition FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = '${table}'
      `);
      console.log(`  - Table '${table}':`);
      if (res.rows.length === 0) {
        console.log("    None");
      }
      res.rows.forEach(policy => {
        console.log(`    * Policy Name: ${policy.policyname}`);
        console.log(`      Definition: ${policy.definition}`);
      });
    }

    // Indexes check
    console.log("\n4. Active Indexes:");
    for (const table of tables) {
      const res = await client.query(`
        SELECT indexname, indexdef FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = '${table}'
      `);
      console.log(`  - Table '${table}':`);
      res.rows.forEach(idx => {
        console.log(`    * Index Name: ${idx.indexname}`);
        console.log(`      Definition: ${idx.indexdef}`);
      });
    }

  } catch (err) {
    console.error("Migration execution failed:", err.message);
  } finally {
    await client.end();
  }
}

run();
