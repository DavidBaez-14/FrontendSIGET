# 🏗️ Refactorización del Dashboard - Documentación

## 📁 Estructura de Archivos

```
src/vistas/
├── DashboardUnificado.jsx          (Archivo original - NO MODIFICAR AÚN)
├── DashboardUnificadoRefactored.jsx (Contenedor principal refactorizado)
├── DashboardAdmin.jsx               (Vista para Admins/Coordinadores)
├── DashboardDirector.jsx            (Vista para Directores)
└── DashboardEstudiante.jsx          (Vista para Estudiantes)
```

## 🎯 Arquitectura de la Refactorización

### **Antes: God Component (1124 líneas)**
Un solo archivo manejaba:
- Lógica de 3 roles diferentes
- Estados locales de cada rol
- Modales específicos por rol
- Renderizado condicional complejo

### **Después: Arquitectura Container/Presenter**

#### 1️⃣ **DashboardUnificadoRefactored** (Contenedor - ~450 líneas)
**Responsabilidades:**
- ✅ Detectar rol del usuario (`esAdmin`, `esDirector`, `esEstudiante`)
- ✅ Cargar datos según rol (useEffect)
- ✅ Calcular estadísticas comunes
- ✅ Manejar modales compartidos (Historial, Cambio de Estado)
- ✅ Delegar renderizado a componentes hijos
- ✅ **Toggle de vistas** para testing (prop `vistaForzada`)

**Props que recibe:**
```jsx
<DashboardUnificado 
  vistaForzada="admin" // Opcional: "admin" | "director" | "estudiante"
/>
```

**Switch de renderizado:**
```jsx
switch (vistaActual) {
  case 'admin':    return <DashboardAdmin {...props} />
  case 'director': return <DashboardDirector {...props} />
  case 'estudiante': return <DashboardEstudiante {...props} />
}
```

---

#### 2️⃣ **DashboardAdmin** (Presentacional - ~160 líneas)
**Casos internos:**
- **Super Admin**: Ve TODOS los proyectos del sistema
  - Badge: `👑 Super Administrador`
  - Título: "Todos los Proyectos del Sistema"
  
- **Coordinador**: Ve solo proyectos de su programa
  - Badge: `📋 Coordinador de Comité`
  - Badge adicional: `🎓 Ingeniería de Sistemas` (ejemplo)
  - Título: "Proyectos del Programa"

**Props que recibe:**
```jsx
{
  usuario,           // Objeto con info del usuario
  adminInfo,         // { programaCodigo, esAdminGeneral }
  proyectos,         // Array de proyectos
  loading,           // Boolean
  error,             // String | null
  stats,             // { total, enDesarrollo, enRevision, completados }
  onCambiarEstado,   // Callback
  onVerHistorial,    // Callback
  onAgendarReunion,  // Callback
  onVerDetalle       // Callback
}
```

**Renderiza:**
- Header con badges dinámicos
- StatsCards (4 tarjetas)
- TablaProyectos

---

#### 3️⃣ **DashboardDirector** (Presentacional - ~110 líneas)
**Caso simple:** Un solo flujo para directores

**Props que recibe:**
```jsx
{
  usuario,
  proyectos,         // Solo proyectos donde él es director
  loading,
  error,
  stats,
  onCambiarEstado,
  onVerHistorial,
  onAgendarReunion,
  onVerDetalle
}
```

**Renderiza:**
- Header simple
- StatsCards
- TablaProyectos o Empty State

---

#### 4️⃣ **DashboardEstudiante** (Presentacional - ~410 líneas)
**Estados internos:**

**A) Sin Proyecto (Empty State):**
- Icono grande 📚
- Mensaje de bienvenida
- Botón "✨ Crear Mi Proyecto"
- Modal `FormularioProyectoSimple`

**B) Con Proyecto (Vista completa):**
- ProyectoCard expandido
- Sección Director con 3 estados:
  1. Sin director: Botón "📨 Solicitar Director"
  2. Invitación pendiente: Card amarillo con "✕ Cancelar"
  3. Director asignado: Card con info del director
- Sección Equipo (1-3 integrantes)
- Botón "➕ Agregar Compañero" (si < 3)

**Modales internos:**
- `ModalSolicitarDirector`
- `ModalAgregarCompanero`
- `FormularioProyectoSimple`

**Props que recibe:**
```jsx
{
  usuario,
  proyecto,                          // Objeto | null
  loading,
  error,
  invitacionDirectorPendiente,       // Objeto | null
  onProyectoCreado,                  // Callback
  onDirectorInvitado,                // Callback
  onCancelarInvitacionDirector,      // Callback
  onAgendarReunion,
  onVerHistorial,
  onVerDetalle,
  onRecargarDatos                    // Callback para refrescar
}
```

---

## 🧪 Cómo Probar la Refactorización

### Paso 1: Backup del Original
```bash
# El archivo original está intacto en DashboardUnificado.jsx
# La versión refactorizada está en DashboardUnificadoRefactored.jsx
```

### Paso 2: Cambiar el Import en App.jsx
```jsx
// ANTES:
import DashboardUnificado from './vistas/DashboardUnificado';

// DESPUÉS (para probar refactorización):
import DashboardUnificado from './vistas/DashboardUnificadoRefactored';
```

### Paso 3: Testing con Vista Forzada
```jsx
// En MainLayout.jsx o donde uses el Dashboard:

// Probar vista Admin
<DashboardUnificado vistaForzada="admin" />

// Probar vista Director
<DashboardUnificado vistaForzada="director" />

// Probar vista Estudiante
<DashboardUnificado vistaForzada="estudiante" />

// Modo normal (automático según rol)
<DashboardUnificado />
```

---

## ✅ Beneficios de la Refactorización

### 1. **Mantenibilidad**
- ✅ Cada componente tiene UNA responsabilidad
- ✅ Fácil encontrar código específico de cada rol
- ✅ Cambios en un rol NO afectan otros

### 2. **Testabilidad**
- ✅ Componentes más pequeños = más fáciles de testear
- ✅ Props claras y predecibles
- ✅ Vista forzada para testing manual

### 3. **Escalabilidad**
- ✅ Agregar features a un rol específico es directo
- ✅ No hay riesgo de "tocar código de otros roles"
- ✅ Fácil agregar nuevos roles

### 4. **Performance**
- ✅ Solo se renderiza el componente necesario
- ✅ No hay condicionales gigantes
- ✅ Menos re-renders innecesarios

### 5. **Developer Experience**
- ✅ Archivos de ~100-400 líneas vs 1124
- ✅ Imports específicos por componente
- ✅ Menos scroll para encontrar código

---

## 🚀 Plan de Migración

### Fase 1: Testing Paralelo ✅ (ACTUAL)
- [x] Crear componentes refactorizados
- [x] Mantener original intacto
- [ ] Probar cada vista manualmente
- [ ] Verificar todos los flujos

### Fase 2: Validación
- [ ] Testing con usuarios reales
- [ ] Verificar que NO hay regresiones
- [ ] Comparar con versión original

### Fase 3: Migración
```bash
# Cuando todo esté validado:
mv DashboardUnificado.jsx DashboardUnificado.old.jsx
mv DashboardUnificadoRefactored.jsx DashboardUnificado.jsx
```

### Fase 4: Limpieza
- [ ] Eliminar archivo .old después de 2 semanas
- [ ] Actualizar imports si es necesario
- [ ] Celebrar 🎉

---

## 📋 Checklist de Validación

### Admin/Coordinador
- [ ] Super Admin ve todos los proyectos
- [ ] Coordinador ve solo su programa
- [ ] Badges correctos según tipo
- [ ] Stats calculan bien
- [ ] Tabla se renderiza correctamente
- [ ] Modal de cambio de estado funciona
- [ ] Modal de historial funciona

### Director
- [ ] Ve solo sus proyectos dirigidos
- [ ] Stats correctas
- [ ] Empty state si no tiene proyectos
- [ ] Tabla funciona
- [ ] Modales compartidos funcionan

### Estudiante
- [ ] Empty state cuando no tiene proyecto
- [ ] Puede crear proyecto
- [ ] Proyecto se muestra correctamente
- [ ] 3 estados de director funcionan:
  - [ ] Sin director (botón solicitar)
  - [ ] Invitación pendiente (card amarillo + cancelar)
  - [ ] Director asignado (card con info)
- [ ] Modal solicitar director funciona
- [ ] Modal agregar compañero funciona
- [ ] Límite de 3 integrantes respetado
- [ ] Acciones del proyecto funcionan

---

## 🐛 Troubleshooting

### Problema: "No se muestra nada"
```jsx
// Verificar que el rol está correctamente definido:
console.log('Rol:', { esAdmin, esDirector, esEstudiante });
console.log('Vista actual:', vistaActual);
```

### Problema: "Props undefined"
```jsx
// Asegúrate de pasar TODAS las props necesarias:
<DashboardAdmin 
  usuario={usuario}        // ✅
  adminInfo={adminInfo}    // ✅
  proyectos={proyectos}    // ✅
  // ... etc
/>
```

### Problema: "Modales no funcionan"
```jsx
// Los modales compartidos están en el contenedor principal
// Verifica que renderModalesCompartidos() se llama en cada case del switch
```

---

## 📞 Contacto

Si encuentras bugs o tienes dudas sobre la refactorización:
1. Revisa esta documentación
2. Compara con el código original
3. Usa `vistaForzada` para aislar el problema
4. Verifica las props en DevTools

---

## 🎓 Lecciones Aprendidas

1. **Separar concerns**: Un componente = Una responsabilidad
2. **Props sobre estado global**: Más predecible y testeable
3. **Composición sobre condicionales**: Switch es más claro que if/else anidados
4. **Flexibilidad de testing**: `vistaForzada` es invaluable para desarrollo
5. **Documentar mientras refactorizas**: Este doc se escribió durante el proceso

---

**Fecha de Refactorización:** Diciembre 9, 2025  
**Autor:** GitHub Copilot (Claude Sonnet 4.5)  
**Archivos Involucrados:** 5 archivos nuevos, 0 modificados del original  
**Líneas de Código:** ~1100 distribuidas vs ~1124 en un solo archivo
