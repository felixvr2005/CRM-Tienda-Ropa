#!/bin/bash
# Script para instalar dependencias necesarias para el sistema de correos

echo "📦 Instalando dependencias para sistema de correos..."

# Instalar nodemailer (para envío de emails)
npm install nodemailer
npm install -D @types/nodemailer

# (Opcional) Instalar exceljs para exportación a Excel
npm install exceljs
npm install -D @types/exceljs

# (Opcional) Instalar node-cron para automatización
npm install node-cron
npm install -D @types/node-cron

echo "✓ Dependencias instaladas correctamente"
echo ""
echo "Próximos pasos:"
echo "1. Configura las variables de entorno en .env.local"
echo "2. Actualiza tu package.json con las nuevas dependencias"
echo "3. Reinicia tu servidor de desarrollo"
echo "4. Accede a /admin/reports para probar el sistema"
