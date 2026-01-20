#!/bin/bash

# ============================================
# SCRIPT DE VERIFICACIÓN - Sistema de Tipos
# ============================================
# Uso: bash verify-product-types.sh

echo "🔍 VERIFICADOR: Sistema de Tipos de Producto"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contador
total=0
passed=0
failed=0

check() {
  local name=$1
  local condition=$2
  
  ((total++))
  
  if eval "$condition"; then
    echo -e "${GREEN}✅ PASS${NC}: $name"
    ((passed++))
  else
    echo -e "${RED}❌ FAIL${NC}: $name"
    ((failed++))
  fi
}

# ============================================
# 1. Verificar archivos locales
# ============================================
echo -e "${BLUE}[1] VERIFICANDO ARCHIVOS CREADOS${NC}"
echo ""

check "SQL Migration existe" "[ -f 'supabase/product-types-migration.sql' ]"
check "React Component existe" "[ -f 'src/components/islands/VariantImagesUploader.tsx' ]"
check "Admin Form existe" "[ -f 'src/pages/admin/productos/create-edit.astro' ]"
check "API save existe" "[ -f 'src/pages/api/admin/products/save.ts' ]"
check "API variants existe" "[ -f 'src/pages/api/admin/products/variants.ts' ]"
check "API sizes existe" "[ -f 'src/pages/api/admin/product-types/sizes.ts' ]"
check "Guía existe" "[ -f 'GUIA-TIPOS-PRODUCTO.md' ]"
check "Checklist existe" "[ -f 'CHECKLIST-TIPOS-PRODUCTO.md' ]"

echo ""

# ============================================
# 2. Verificar contenidos de archivos
# ============================================
echo -e "${BLUE}[2] VERIFICANDO CONTENIDOS${NC}"
echo ""

check "SQL contiene CREATE TABLE product_types" \
  "grep -q 'CREATE TABLE.*product_types' supabase/product-types-migration.sql"

check "SQL contiene CREATE TABLE variant_images" \
  "grep -q 'CREATE TABLE.*variant_images' supabase/product-types-migration.sql"

check "SQL contiene INSERT INTO product_types" \
  "grep -q 'INSERT INTO product_types' supabase/product-types-migration.sql"

check "React Component es TypeScript" \
  "grep -q 'interface VariantImagesUploaderProps' src/components/islands/VariantImagesUploader.tsx"

check "Admin form tiene selector de tipo" \
  "grep -q 'product_type_id' src/pages/admin/productos/create-edit.astro"

check "API tiene manejo de errores" \
  "grep -q 'catch.*error' src/pages/api/admin/products/save.ts"

echo ""

# ============================================
# 3. Verificar dependencias
# ============================================
echo -e "${BLUE}[3] VERIFICANDO DEPENDENCIAS${NC}"
echo ""

# Verificar si package.json existe
if [ -f "package.json" ]; then
  echo -e "${GREEN}✅${NC} package.json existe"
  
  # Verificar dependencias key
  check "Astro está instalado" "grep -q '\"astro\"' package.json"
  check "Supabase client está" "grep -q 'supabase' package.json"
  check "React está instalado" "grep -q '\"react\"' package.json"
else
  echo -e "${RED}❌${NC} package.json NO existe"
fi

echo ""

# ============================================
# 4. Verificar .env
# ============================================
echo -e "${BLUE}[4] VERIFICANDO CONFIGURACIÓN${NC}"
echo ""

if [ -f ".env" ]; then
  check "SUPABASE_URL configurado" "grep -q 'SUPABASE_URL' .env"
  check "SUPABASE_ANON_KEY configurado" "grep -q 'SUPABASE_ANON_KEY' .env"
  check "SUPABASE_SERVICE_ROLE_KEY configurado" "grep -q 'SUPABASE_SERVICE_ROLE_KEY' .env"
else
  echo -e "${YELLOW}⚠️${NC} .env no existe"
fi

echo ""

# ============================================
# 5. Resumen
# ============================================
echo -e "${BLUE}[5] RESUMEN${NC}"
echo ""
echo "Total checks: $total"
echo -e "Passed: ${GREEN}$passed${NC}"
echo -e "Failed: ${RED}$failed${NC}"

if [ $failed -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ TODOS LOS ARCHIVOS ESTÁN LISTOS${NC}"
  echo ""
  echo "SIGUIENTES PASOS:"
  echo "1. Lee: GUIA-TIPOS-PRODUCTO.md"
  echo "2. Ejecuta SQL en Supabase:"
  echo "   - Abre Supabase Dashboard → SQL Editor"
  echo "   - Copia contenido de: supabase/product-types-migration.sql"
  echo "   - Ejecuta"
  echo "3. Asigna tipos a productos existentes"
  echo "4. Sigue el CHECKLIST-TIPOS-PRODUCTO.md"
else
  echo ""
  echo -e "${RED}⚠️ FALTAN ARCHIVOS O CONTENIDOS${NC}"
  echo "Por favor, verifica los archivos listados arriba."
fi

echo ""
echo "============================================"
