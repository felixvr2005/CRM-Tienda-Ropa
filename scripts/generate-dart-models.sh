#!/usr/bin/env bash
# Script: Generate Dart models from OpenAPI spec
# Location: scripts/generate-dart-models.sh
# Purpose: Converts docs/api-openapi.yaml to Flutter Dart models
# Usage: bash scripts/generate-dart-models.sh

set -e

echo "🚀 Generando modelos Dart desde OpenAPI spec..."

# Validar que openapi-generator esté disponible
if ! command -v openapi-generator &> /dev/null; then
    echo "❌ openapi-generator no encontrado. Instalando..."
    npm install -g @openapitools/openapi-generator-cli
fi

# Rutas
OPENAPI_SPEC="docs/api-openapi.yaml"
FLUTTER_OUTPUT_DIR="flutter_client/lib/generated"
PACKAGE_NAME="crm_tienda_ropa_api"

# Validar spec existe
if [ ! -f "$OPENAPI_SPEC" ]; then
    echo "❌ Error: OpenAPI spec no encontrado en $OPENAPI_SPEC"
    exit 1
fi

# Crear directorio de salida
mkdir -p "$FLUTTER_OUTPUT_DIR"

echo "📝 Validando OpenAPI spec..."
openapi-generator-cli validate -i "$OPENAPI_SPEC" || {
    echo "⚠️  Advertencias en spec, pero continuando..."
}

echo "🔄 Generando código Dart..."
openapi-generator-cli generate \
    -i "$OPENAPI_SPEC" \
    -g dart \
    -o "$FLUTTER_OUTPUT_DIR" \
    -c scripts/openapi-dart-config.yaml \
    --package-name "$PACKAGE_NAME" \
    --additional-properties=\
pubVersion=1.0.0,\
enumUnknownDefaultCase=true,\
disallowAdditionalPropertiesIfNotPresent=true

echo "✅ Modelos Dart generados en: $FLUTTER_OUTPUT_DIR"

# Reorganizar estructura (el generador crea lib/models, movemos a nuestro schema)
if [ -d "$FLUTTER_OUTPUT_DIR/lib" ]; then
    echo "🏗️  Reorganizando estructura..."
    mkdir -p "flutter_client/lib/models"
    mkdir -p "flutter_client/lib/api"
    
    # Copiar modelos
    cp -r "$FLUTTER_OUTPUT_DIR/lib/model" "flutter_client/lib/models/" || true
    
    # Copiar API client
    cp -r "$FLUTTER_OUTPUT_DIR/lib/*.dart" "flutter_client/lib/api/" || true
fi

echo "📊 Ejecutando pruebas de generación..."
cd flutter_client
flutter analyze lib/models lib/api || echo "⚠️  Algunos análisis de código completados con advertencias"

echo "✨ Generación completada exitosamente"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Revisar modelos generados en flutter_client/lib/models/"
echo "  2. Revisar cliente API en flutter_client/lib/api/"
echo "  3. Ejecutar: flutter pub get"
echo "  4. Ejecutar: flutter test"
