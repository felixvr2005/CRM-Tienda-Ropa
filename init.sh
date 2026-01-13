#!/bin/bash
# fashionmarket-init.sh
# Script de inicialización rápida para FashionMarket

echo "🎨 ═══════════════════════════════════════════════════════════════════════════════"
echo "🎨 FASHIONMARKET - Inicializador de Proyecto"
echo "🎨 ═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instálalo desde https://nodejs.org"
    exit 1
fi

echo "✅ Node.js instalado: $(node --version)"
echo "✅ npm instalado: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas correctamente"
echo ""

# Create .env.local if not exists
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    cp .env.example .env.local
    echo "⚠️  IMPORTANTE: Edita .env.local con tus credenciales de Supabase"
    echo "   PUBLIC_SUPABASE_URL=tu_url"
    echo "   PUBLIC_SUPABASE_ANON_KEY=tu_clave"
else
    echo "✅ .env.local ya existe"
fi

echo ""
echo "🎉 ═══════════════════════════════════════════════════════════════════════════════"
echo "✅ Inicialización completada"
echo ""
echo "📚 PRÓXIMOS PASOS:"
echo ""
echo "   1. Editar .env.local con credenciales de Supabase"
echo "   2. Ejecutar SQL en Supabase Dashboard:"
echo "      cat database-schema.sql | copiar al SQL Editor"
echo "   3. Iniciar servidor de desarrollo:"
echo "      npm run dev"
echo "   4. Abrir http://localhost:3000"
echo ""
echo "📖 DOCUMENTACIÓN:"
echo "   - README.md          → Guía técnica completa"
echo "   - SETUP.md           → Pasos de configuración"
echo "   - ENTREGABLES.md     → Resumen de entregables"
echo "   - EJEMPLOS.md        → Ejemplos de código"
echo "   - FAQ.md             → Preguntas frecuentes"
echo ""
echo "🎨 ═══════════════════════════════════════════════════════════════════════════════"
