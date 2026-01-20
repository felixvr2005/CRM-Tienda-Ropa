# ============================================
# QUICK START - Sistema de Tipos de Producto
# ============================================
# Para Windows PowerShell
# Uso: .\init-product-types.ps1

Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  INIT: Sistema de Tipos de Producto   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if files exist
$files = @(
    "supabase\product-types-migration.sql",
    "src\components\islands\VariantImagesUploader.tsx",
    "src\pages\admin\productos\create-edit.astro",
    "src\pages\api\admin\products\save.ts"
)

$allExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file NO ENCONTRADO" -ForegroundColor Red
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Host "`nError: Faltan archivos." -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ Todos los archivos encontrados" -ForegroundColor Green

# Show what to do next
Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PROXIMOS PASOS                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  EJECUTAR SQL EN SUPABASE" -ForegroundColor Yellow
Write-Host "   • Abre: https://app.supabase.com/project/[tu-proyecto]/sql/new" -ForegroundColor Gray
Write-Host "   • Abre: supabase\product-types-migration.sql" -ForegroundColor Gray
Write-Host "   • Copia TODOS los comandos" -ForegroundColor Gray
Write-Host "   • Pega en SQL Editor" -ForegroundColor Gray
Write-Host "   • Click en botón RUN" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  VERIFICAR SQL EJECUTADO" -ForegroundColor Yellow
Write-Host "   Ejecuta en SQL Editor:" -ForegroundColor Gray
Write-Host "   SELECT COUNT(*) FROM product_types;" -ForegroundColor White
Write-Host "   → Debería retornar: 9" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  ASIGNAR TIPOS A PRODUCTOS" -ForegroundColor Yellow
Write-Host "   Opción A (Manual):" -ForegroundColor Gray
Write-Host "   UPDATE products SET product_type_id = (" -ForegroundColor White
Write-Host "     SELECT id FROM product_types WHERE slug = 'accesorios'" -ForegroundColor White
Write-Host "   ) WHERE product_type_id IS NULL;" -ForegroundColor White
Write-Host ""
Write-Host "   Opción B (Específico por nombre):" -ForegroundColor Gray
Write-Host "   UPDATE products SET product_type_id = (" -ForegroundColor White
Write-Host "     SELECT id FROM product_types WHERE slug = 'camiseta'" -ForegroundColor White
Write-Host "   ) WHERE name ILIKE '%camiseta%' AND product_type_id IS NULL;" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣  ACTUALIZAR ADMIN (Opcional)" -ForegroundColor Yellow
Write-Host "   • Abre: src\pages\admin\productos\nuevo.astro" -ForegroundColor Gray
Write-Host "   • Importa: VariantImagesUploader" -ForegroundColor Gray
Write-Host "   • O reemplaza con: create-edit.astro" -ForegroundColor Gray
Write-Host ""

Write-Host "5️⃣  PROBAR" -ForegroundColor Yellow
Write-Host "   • npm run dev" -ForegroundColor Gray
Write-Host "   • Navega: http://localhost:4321/admin/productos" -ForegroundColor Gray
Write-Host "   • Click: Nuevo Producto" -ForegroundColor Gray
Write-Host "   • Verifica: Selector de tipo aparece ✓" -ForegroundColor Gray
Write-Host ""

Write-Host "6️⃣  LEER DOCUMENTACION" -ForegroundColor Yellow
Write-Host "   • GUIA-TIPOS-PRODUCTO.md - Guía completa" -ForegroundColor Gray
Write-Host "   • CHECKLIST-TIPOS-PRODUCTO.md - Lista de verificación" -ForegroundColor Gray
Write-Host "   • ESTADO-PROYECTO-FINAL.md - Estado general" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 ARCHIVOS CREADOS:" -ForegroundColor Green
Write-Host ""
Write-Host "✓ supabase/product-types-migration.sql (150+ líneas SQL)" -ForegroundColor Green
Write-Host "✓ src/components/islands/VariantImagesUploader.tsx (350 líneas React)" -ForegroundColor Green
Write-Host "✓ src/pages/admin/productos/create-edit.astro (300 líneas Astro)" -ForegroundColor Green
Write-Host "✓ src/pages/api/admin/products/save.ts (50 líneas API)" -ForegroundColor Green
Write-Host "✓ src/pages/api/admin/products/variants.ts (60 líneas API)" -ForegroundColor Green
Write-Host "✓ src/pages/api/admin/product-types/sizes.ts (40 líneas API)" -ForegroundColor Green
Write-Host "✓ GUIA-TIPOS-PRODUCTO.md (Guía completa)" -ForegroundColor Green
Write-Host "✓ CHECKLIST-TIPOS-PRODUCTO.md (Checklist)" -ForegroundColor Green
Write-Host "✓ ESTADO-PROYECTO-FINAL.md (Estado proyecto)" -ForegroundColor Green
Write-Host ""

Write-Host "⏱️  TIEMPO ESTIMADO: 2-2.5 horas" -ForegroundColor Yellow
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host ""
$input = Read-Host "¿Deseas abrir GUIA-TIPOS-PRODUCTO.md? (s/n)"

if ($input -eq "s" -or $input -eq "S") {
    if (Test-Path "GUIA-TIPOS-PRODUCTO.md") {
        notepad GUIA-TIPOS-PRODUCTO.md
    } else {
        Write-Host "Archivo no encontrado" -ForegroundColor Red
    }
}

Write-Host ""
