# 🧪 Guía de Testing - Dashboard Refactorizado

## ✅ Estado de la Migración

- ✅ Dashboard antiguo movido a: `src/compartidos/backup/DashboardUnificado.old.jsx`
- ✅ Dashboard refactorizado activado en: `src/vistas/DashboardUnificado.jsx`
- ✅ App.jsx actualizado con selector mejorado
- ✅ 3 componentes nuevos creados (Admin, Director, Estudiante)

---

## 🎯 Plan de Testing

### 1️⃣ Testing Visual Rápido

**Objetivo:** Verificar que cada vista se renderiza sin errores

#### A) Super Administrador (👑 Admin)
1. Click en botón **"👑 Admin"**
2. ✅ Debe mostrar:
   - Badge: "👑 Super Administrador"
   - Título: "Todos los Proyectos del Sistema"
   - 4 StatsCards con números
   - Tabla con TODOS los proyectos

#### B) Coordinador (📋 Coord)
1. Click en botón **"📋 Coord"**
2. ✅ Debe mostrar:
   - Badge: "📋 Coordinador de Comité"
   - Badge adicional: "🎓 Ingeniería de Sistemas"
   - Título: "Proyectos del Programa"
   - 4 StatsCards
   - Tabla con proyectos filtrados por programa

#### C) Director (👨‍🏫 Director)
1. Click en botón **"👨‍🏫 Director"**
2. ✅ Debe mostrar:
   - Header: "Panel de Director"
   - 4 StatsCards
   - Título: "Mis Proyectos Dirigidos"
   - Tabla con proyectos donde él es director
   - Si no tiene proyectos: Empty State con 📋

#### D) Estudiante con Proyecto (👨‍🎓 Est1)
1. Click en botón **"👨‍🎓 Est1"**
2. ✅ Debe mostrar:
   - Header: "Mi Dashboard"
   - ProyectoCard grande con info del proyecto
   - Sección "👨‍🏫 Director del Proyecto"
   - Sección "👥 Equipo de Trabajo"
   - 3 botones: Agendar Reunión, Ver Historial, Ver Detalle

**Probar flujos de director:**
- Si tiene director: Ver card con nombre y tipo
- Si no tiene director: Ver botón "📨 Solicitar Director"
- Si tiene invitación pendiente: Ver card amarillo + botón cancelar

#### E) Estudiante sin Proyecto (👩‍🎓 Est2)
1. Click en botón **"👩‍🎓 Est2"**
2. ✅ Debe mostrar:
   - Header: "Mi Dashboard"
   - Empty State con icono 📚
   - Mensaje: "Aún no tienes un proyecto registrado"
   - Botón: "✨ Crear Mi Proyecto"

**Probar crear proyecto:**
3. Click en "✨ Crear Mi Proyecto"
4. ✅ Debe abrir modal `FormularioProyectoSimple`
5. Llenar campos y crear
6. ✅ Debe recargar y mostrar vista "Con Proyecto"

#### F) Estudiante 3 (🧑‍🎓 Est3)
1. Click en botón **"🧑‍🎓 Est3"**
2. Similar a Est2, para crear otro proyecto de prueba

---

### 2️⃣ Testing de Funcionalidades

#### **Modales Compartidos:**

**A) Ver Historial**
1. En cualquier vista con tabla de proyectos
2. Click en "📋 Ver Historial" de un proyecto
3. ✅ Debe abrir modal con timeline de eventos

**B) Cambiar Estado** (Solo Admin/Director)
1. Click en botón de cambio de estado
2. ✅ Debe abrir modal con selector de eventos
3. Seleccionar evento y descripción
4. ✅ Debe actualizar y refrescar vista

**C) Próximamente**
1. Click en "📅 Agendar Reunión" o "👁️ Ver Detalle"
2. ✅ Debe mostrar modal "🚧 Funcionalidad en Desarrollo"

#### **Modales Específicos de Estudiante:**

**A) Solicitar Director**
1. Estar en vista estudiante sin director
2. Click en "📨 Solicitar Director"
3. ✅ Debe abrir `ModalSolicitarDirector`
4. Buscar director por nombre o especialidad
5. Seleccionar y enviar invitación
6. ✅ Debe aparecer card amarillo de invitación pendiente

**B) Cancelar Invitación Director**
1. Con invitación pendiente visible
2. Click en "✕ Cancelar Invitación"
3. Confirmar
4. ✅ Debe desaparecer card amarillo
5. ✅ Debe volver a mostrar botón "Solicitar Director"

**C) Agregar Compañero**
1. Estar en vista estudiante con proyecto
2. Si tiene < 3 integrantes, ver botón "➕ Agregar Compañero"
3. Click en el botón
4. ✅ Debe abrir modal de búsqueda
5. Buscar por cédula o código
6. Enviar invitación
7. ✅ Debe actualizar lista de equipo

---

### 3️⃣ Testing de Navegación

**Objetivo:** Verificar que cambiar de usuario recarga datos correctos

1. Iniciar en **👑 Admin** → Ver todos los proyectos
2. Cambiar a **👨‍🏫 Director** → Ver solo sus proyectos
3. Cambiar a **👨‍🎓 Est1** → Ver su proyecto individual
4. Cambiar a **👩‍🎓 Est2** → Ver empty state

✅ **Cada cambio debe:**
- Mostrar spinner de carga
- Renderizar componente correcto
- Cargar datos específicos del rol
- No mostrar errores en consola

---

### 4️⃣ Testing de Estadísticas

**Verificar que Stats calculan correctamente:**

1. En **👑 Admin**:
   - Total = Todos los proyectos
   - En Desarrollo = Estados: EN_DESARROLLO, APROBADO_INICIO
   - En Revisión = Estados: EN_REVISION_*, CON_CORRECCIONES_*
   - Completados = Estado: FINALIZADO

2. En **👨‍🏫 Director**:
   - Stats solo cuentan proyectos donde él es director

3. En **👨‍🎓 Estudiante**:
   - No muestra StatsCards (usa ProyectoCard)

---

### 5️⃣ Testing de Responsive

**Probar en diferentes tamaños de pantalla:**

1. **Desktop (>1200px):**
   - ✅ Selector de usuarios en una línea
   - ✅ Stats en grid de 4 columnas
   - ✅ Tabla ancha y legible

2. **Tablet (768px - 1200px):**
   - ✅ Stats en grid de 2x2
   - ✅ Tabla con scroll horizontal si necesario

3. **Mobile (<768px):**
   - ✅ Selector de usuarios wrappeable
   - ✅ Stats en columna (4 filas)
   - ✅ Tabla con scroll horizontal

---

## 🐛 Checklist de Bugs Comunes

### ❌ Error: "Cannot read property 'map' of undefined"
**Causa:** `proyectos` es null/undefined  
**Solución:** Verificar que `cargarDatos()` está retornando array

### ❌ Error: "usuario.esAdminGeneral is undefined"
**Causa:** Prop `usuario` no está llegando  
**Solución:** Verificar que AuthContext está proveyendo el campo

### ❌ Vista no cambia al hacer click en selector
**Causa:** Estado `vistaActual` no se actualiza  
**Solución:** Verificar que `useAuth()` retorna roles correctos

### ❌ Modal no se cierra
**Causa:** Overlay onClick no está propagando  
**Solución:** Verificar `e.target === e.currentTarget` en overlay

### ❌ Stats muestran NaN
**Causa:** `proyectos.filter()` recibe array vacío o null  
**Solución:** Agregar validación: `(proyectos || []).filter(...)`

---

## 📊 Comparación Antes/Después

| Aspecto | Antes (Old) | Después (Refactored) |
|---------|-------------|----------------------|
| **Líneas totales** | 1124 | ~1100 (distribuidas) |
| **Archivos** | 1 | 5 |
| **Complejidad** | Alta (God Component) | Baja (SRP) |
| **Testeable** | ❌ Difícil | ✅ Fácil |
| **Mantenible** | ❌ Complejo | ✅ Simple |
| **Escalable** | ❌ Rígido | ✅ Flexible |

---

## ✅ Criterios de Aprobación

Para considerar la refactorización exitosa:

- [ ] Todas las vistas renderizan sin errores
- [ ] Selector de usuarios funciona correctamente
- [ ] Modales compartidos funcionan en todas las vistas
- [ ] Modales de estudiante funcionan correctamente
- [ ] Stats calculan números correctos
- [ ] Navegación entre roles recarga datos
- [ ] No hay errores en consola del navegador
- [ ] Performance similar o mejor que versión anterior
- [ ] Todos los callbacks funcionan (onVerHistorial, etc.)
- [ ] Responsive funciona en mobile/tablet/desktop

---

## 🚀 Próximos Pasos Después del Testing

1. ✅ Validar todos los checks anteriores
2. 📝 Documentar bugs encontrados (si hay)
3. 🔧 Arreglar bugs críticos
4. 🎉 Marcar refactorización como completa
5. 🗑️ Eliminar backup después de 2 semanas de estabilidad
6. 📤 **Subir cambios a GitHub** (Backend + Frontend)

---

## 📞 Debugging Tips

### Ver props en componentes:
```jsx
console.log('DashboardAdmin Props:', { usuario, proyectos, stats });
```

### Ver vista actual:
```jsx
console.log('Vista Actual:', vistaActual);
console.log('Roles:', { esAdmin, esDirector, esEstudiante });
```

### Ver datos cargados:
```jsx
useEffect(() => {
  console.log('Proyectos cargados:', proyectos);
}, [proyectos]);
```

---

**Fecha de Testing:** Diciembre 9, 2025  
**Versión:** Dashboard Refactorizado v1.0  
**Estado:** ✅ Listo para testing manual
