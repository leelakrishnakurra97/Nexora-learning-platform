import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:12345@127.0.0.1:5433/lms_db";
const sqlFilePath = path.join(process.cwd(), 'prisma', 'schema.sql');

async function main() {
  console.log(`Connecting to database: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`);
  const client = new pg.Client({ connectionString: dbUrl });
  
  try {
    await client.connect();
    console.log("Connected successfully. Dropping public schema...");
    
    // Clear the schema
    await client.query("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
    console.log("Schema cleared. Reading SQL schema file...");
    
    let sql = fs.readFileSync(sqlFilePath, 'utf8');
    // Strip UTF-8 BOM if present
    sql = sql.replace(/^\uFEFF/, '');
    console.log("Applying SQL schema commands to create tables...");
    
    await client.query(sql);
    console.log("Tables created successfully from SQL file!");
    
  } catch (err) {
    console.error("Error executing SQL commands:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
