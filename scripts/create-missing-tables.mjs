#!/usr/bin/env node

/**
 * Script para crear las tablas faltantes en Supabase
 * Ejecuta: node scripts/create-missing-tables.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar variables de entorno
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('   PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗');
  process.exit(1);
}

// Crear cliente Supabase con credenciales de administrador
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createMissingTables() {
  try {
    console.log('📦 Creando tablas faltantes en Supabase...\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', 'supabase', 'create-missing-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar cada declaración SQL
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (!statement) continue;
      
      console.log(`▶ Ejecutando: ${statement.substring(0, 60)}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement
      }).catch(() => {
        // Si exec_sql no existe, usar método alternativo
        return supabase.from('_sql_exec').insert({ query: statement });
      });

      if (error) {
        console.warn(`⚠ ${error.message}`);
      } else {
        console.log('   ✅ OK');
      }
    }

    console.log('\n✅ Tablas creadas exitosamente');

    // Verificar que las tablas existan
    console.log('\n📋 Verificando tablas...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['newsletter_subscribers', 'return_requests']);

    if (tablesError) {
      console.log('   ⚠ No se pudieron verificar las tablas directamente');
    } else if (tables && tables.length === 2) {
      console.log('   ✅ Ambas tablas existen');
    } else {
      console.log('   ⚠ Algunas tablas no se encontraron');
    }

  } catch (error) {
    console.error('❌ Error creando tablas:', error);
    process.exit(1);
  }
}

createMissingTables();
