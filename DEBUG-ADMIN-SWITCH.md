# DEBUG - AdminSwitch

## Checklist de Prueba

### 1. Acceder como CLIENTE (sin admin)
- [ ] Ir a http://localhost:4325/
- [ ] NO debe haber botón "Admin" (porque no es admin)
- [ ] Si hay botón, es un error

### 2. Acceder como ADMIN
- [ ] Ir a http://localhost:4325/
- [ ] Login como admin
- [ ] Debe haber botón "Admin" en header derecha
- [ ] Click en "Admin" → debe ir a /admin

### 3. En /admin como ADMIN
- [ ] Ver panel de admin
- [ ] Debe haber botón "Tienda" en header derecha (NO "Ver tienda" duplicado)
- [ ] Click en "Tienda" → debe ir a /

### 4. Redirecciones
- [ ] Admin intenta /checkout → redirige a /
- [ ] Admin intenta /cuenta → redirige a /admin

## Problema Reportado

"Se queda en bucle" - probablemente significa:
1. Refresh infinito
2. Redirección infinita
3. Error en componente que lo hace no renderizar correctamente

## Soluciones Aplicadas

1. ✅ Removido botón "Ver tienda" duplicado de AdminLayout.astro
2. ✅ Mejorado error handling en AdminSwitch.astro
3. ✅ Simplificadas condiciones de renderización

## Próximas Pruebas

Ir a navegador y ver si:
- El botón aparece cuando debe
- El botón no aparece cuando no debe
- Los links funcionan
