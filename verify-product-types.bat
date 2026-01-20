@echo off
REM ============================================
REM VERIFICADOR - Sistema de Tipos de Producto
REM ============================================
REM Para Windows PowerShell
REM Uso: .\verify-product-types.bat

setlocal enabledelayedexpansion

echo.
echo ================================================
echo VERIFICADOR: Sistema de Tipos de Producto
echo ================================================
echo.

set /a total=0
set /a passed=0
set /a failed=0

REM Función para checar si archivo existe
:checkFile
set /a total+=1
if exist "%~1" (
    echo [OK] %~2
    set /a passed+=1
) else (
    echo [FAIL] %~2 - NO ENCONTRADO: %~1
    set /a failed+=1
)
goto :eof

REM ============================================
REM 1. ARCHIVOS CREADOS
REM ============================================
echo.
echo [1] VERIFICANDO ARCHIVOS CREADOS
echo ------------------------------------
call :checkFile "supabase\product-types-migration.sql" "SQL Migration"
call :checkFile "src\components\islands\VariantImagesUploader.tsx" "React Component"
call :checkFile "src\pages\admin\productos\create-edit.astro" "Admin Form"
call :checkFile "src\pages\api\admin\products\save.ts" "API save"
call :checkFile "src\pages\api\admin\products\variants.ts" "API variants"
call :checkFile "src\pages\api\admin\product-types\sizes.ts" "API sizes"
call :checkFile "GUIA-TIPOS-PRODUCTO.md" "Guía"
call :checkFile "CHECKLIST-TIPOS-PRODUCTO.md" "Checklist"
call :checkFile "ESTADO-PROYECTO-FINAL.md" "Estado Proyecto"

REM ============================================
REM 2. ARCHIVOS IMPORTANTES
REM ============================================
echo.
echo [2] VERIFICANDO ARCHIVOS IMPORTANTES
echo ------------------------------------
call :checkFile "package.json" "package.json"
call :checkFile ".env" ".env (configuración)"
call :checkFile "src\lib\supabase.ts" "Supabase client"
call :checkFile "src\pages\admin\login.astro" "Admin login"

REM ============================================
REM 3. RESUMEN
REM ============================================
echo.
echo ================================================
echo RESUMEN
echo ================================================
echo Total checks: %total%
echo Passed: %passed%
echo Failed: %failed%
echo.

if %failed% equ 0 (
    echo ✓ TODOS LOS ARCHIVOS ESTAN LISTOS
    echo.
    echo SIGUIENTES PASOS:
    echo.
    echo 1. Lee: GUIA-TIPOS-PRODUCTO.md
    echo.
    echo 2. Ejecuta SQL en Supabase:
    echo    - Abre Supabase Dashboard
    echo    - Ve a SQL Editor
    echo    - Copia TODOS los comandos de: supabase\product-types-migration.sql
    echo    - Pega y ejecuta
    echo.
    echo 3. Asigna tipos a productos existentes:
    echo    UPDATE products SET product_type_id = ^(
    echo      SELECT id FROM product_types WHERE slug = 'camiseta'
    echo    ^) WHERE name ILIKE '%%camiseta%%' AND product_type_id IS NULL;
    echo.
    echo 4. Sigue: CHECKLIST-TIPOS-PRODUCTO.md
    echo.
    echo Para más info, revisa: ESTADO-PROYECTO-FINAL.md
) else (
    echo X FALTAN ARCHIVOS O CONFIGURACION
    echo.
    echo Por favor verifica los errores arriba.
)

echo.
echo ================================================
pause
