# 📧 MAPA VISUAL - EMAILS POR CADA CAMBIO DE ESTADO

---

## 🔄 FLUJO COMPLETO DEL PEDIDO CON EMAILS

```
┌─────────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DEL PEDIDO                    │
└─────────────────────────────────────────────────────────────────┘

    1️⃣ PENDIENTE (⏳ Esperando)
         ↓ Admin confirma
         └──→ EMAIL: Tu pedido ahora está CONFIRMADO ✅
                    
    2️⃣ CONFIRMADO (✅ Listo)
         ↓ Admin comienza preparación
         └──→ EMAIL: Tu pedido está EN PROCESAMIENTO 🔄
                    
    3️⃣ PROCESANDO (🔄 Preparando)
         ↓ Admin marca como enviado
         └──→ EMAIL: Tu pedido está ENVIADO 📦
                    
    4️⃣ ENVIADO (📦 En camino)
         ↓ Transportista lo entrega
         └──→ EMAIL: ¡Tu pedido ha sido ENTREGADO! 🎉
                    
    5️⃣ ENTREGADO (🎉 Completado)
         └──→ PEDIDO EXITOSO ✨
```

---

## 📧 TABLA DE EMAILS POR ESTADO

```
╔════════════════════════════════════════════════════════════════════╗
║                    ESTADOS Y SUS NOTIFICACIONES                   ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  1. PENDIENTE ⏳                                                   ║
║     └─→ A: CONFIRMADO ✅                                          ║
║         Asunto: Tu pedido #11550 ahora está Confirmado ✅         ║
║         Emoji: ✅                                                 ║
║         Mensaje: "Tu pedido ha sido confirmado"                   ║
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  2. CONFIRMADO ✅                                                 ║
║     └─→ A: PROCESANDO 🔄                                          ║
║         Asunto: Tu pedido #11550 ahora está En procesamiento 🔄   ║
║         Emoji: 🔄                                                 ║
║         Mensaje: "Tu pedido se está preparando"                   ║
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  3. PROCESANDO 🔄                                                 ║
║     └─→ A: ENVIADO 📦                                             ║
║         Asunto: Tu pedido #11550 ahora está Enviado 📦            ║
║         Emoji: 📦                                                 ║
║         Mensaje: "Tu pedido está en camino"                       ║
║         Incluye: Número de seguimiento (si hay)                   ║
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  4. ENVIADO 📦                                                    ║
║     └─→ A: ENTREGADO 🎉                                           ║
║         Asunto: ¡Tu pedido #11550 ha sido Entregado! 🎉           ║
║         Emoji: 🎉                                                 ║
║         Mensaje: "¡Tu pedido ha llegado!"                         ║
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  5. CANCELADO ❌                                                  ║
║     └─→ Desde: CUALQUIER ESTADO                                   ║
║         Asunto: Tu pedido #11550 ha sido Cancelado ❌             ║
║         Emoji: ❌                                                 ║
║         Mensaje: "Tu pedido ha sido cancelado"                    ║
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  6. REEMBOLSADO 💰                                                ║
║     └─→ Desde: CUALQUIER ESTADO                                   ║
║         Asunto: Tu pedido #11550 ha sido Reembolsado 💰           ║
║         Emoji: 💰                                                 ║
║         Mensaje: "Tu pedido ha sido reembolsado"                  ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## 🎯 MATRIZ DE TRANSICIONES

```
           ┌─ CONFIRMADO ✅
           │   ↓
PENDIENTE ⏳│   PROCESANDO 🔄
           │   ↓
           └─ ENVIADO 📦
               ↓
           ENTREGADO 🎉


CANCELADO ❌ ←─ Desde cualquier estado
REEMBOLSADO 💰 ←─ Desde cualquier estado
```

---

## 📨 ESTRUCTURA DE CADA EMAIL

```
╔═══════════════════════════════════════════════════════════════╗
║              HEADER - ASUNTO DEL EMAIL                       ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  De: felixvr2005@gmail.com                                   ║
║  Para: cliente@email.com                                     ║
║  Asunto: [EMOJI] Tu pedido #XXXXX ahora está [ESTADO]        ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║              CUERPO DEL EMAIL                                ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ¡Hola [Nombre del Cliente]!                                 ║
║                                                               ║
║  Tu pedido ha sido actualizado. Aquí te mostramos los       ║
║  cambios:                                                    ║
║                                                               ║
║  Estado anterior: [ANTERIOR]                                ║
║  ⬇️ CAMBIO A                                                 ║
║  ✅ [NUEVO]                                                  ║
║                                                               ║
║  Detalles del Pedido                                         ║
║  ────────────────────                                        ║
║  Número de Pedido: #XXXXX                                    ║
║  Fecha del Pedido: DD/MM/YYYY                                ║
║  Total: $XXX.XX                                              ║
║                                                               ║
║  [BOTÓN: Ver Detalles del Pedido]                            ║
║                                                               ║
║  Si tienes preguntas, no dudes en contactarnos.              ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                      FOOTER                                  ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  © 2026 Tienda de Moda Premium                               ║
║  Este es un email automático, no responder                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 🧪 FLUJO DE TESTING

```
Admin Panel
   ↓
Seleccionar Pedido
   ↓
Cambiar Estado (ej: PENDIENTE → CONFIRMADO)
   ↓
Hacer Clic: "Actualizar estado"
   ↓
┌─────────────────────────────────────┐
│ BACKEND PROCESA                     │
│ 1. Obtiene estado anterior          │
│ 2. Actualiza a nuevo estado         │
│ 3. Verifica que cambió              │
│ 4. Envía email automático           │
│ 5. Log en consola: "✅ Email enviado"│
└─────────────────────────────────────┘
   ↓
Gmail Recibe Email (2-5 segundos)
   ↓
✅ SISTEMA FUNCIONANDO CORRECTAMENTE
```

---

## 📊 RESUMEN RÁPIDO

| Estado | Email | Emoji | Automático |
|--------|-------|-------|-----------|
| ✅ Confirmado | Sí | ✅ | Auto |
| 🔄 Procesando | Sí | 🔄 | Auto |
| 📦 Enviado | Sí | 📦 | Auto |
| 🎉 Entregado | Sí | 🎉 | Auto |
| ❌ Cancelado | Sí | ❌ | Auto |
| 💰 Reembolsado | Sí | 💰 | Auto |

**Total de estados:** 6  
**Total de emails:** 6  
**Tipo de envío:** AUTOMÁTICO (sin intervención)  
**Tiempo de envío:** 2-5 segundos después de cambiar

---

## ✨ CARACTERÍSTICAS

✅ Email automático cada cambio de estado  
✅ Emojis personalizados por estado  
✅ Asunto dinámico  
✅ Contenido personalizado  
✅ Link de rastreo incluido  
✅ HTML profesional  
✅ No bloquea actualización si falla email  
✅ Logs detallados en consola  
✅ Compatible con todos los estados  

---

*Mapa visual: 19 de enero de 2026*  
*Sistema: 100% automático y funcional*
