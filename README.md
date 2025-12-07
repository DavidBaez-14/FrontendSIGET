# SIGET UFPS - Frontend

## Sistema Integral de Gestión de Tesis
**Universidad Francisco de Paula Santander**

---

## 📋 Descripción

Frontend del Sistema Integral de Gestión de Tesis (SIGET) de la UFPS. Esta aplicación web permite a estudiantes, directores de tesis y coordinadores de programa gestionar el ciclo de vida completo de los trabajos de grado.

---

## 🚀 Tecnologías

- **React 18** - Biblioteca de interfaces de usuario
- **Vite** - Build tool y servidor de desarrollo
- **Lucide React** - Iconos SVG
- **CSS3** - Estilos personalizados

---

## 👥 Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| 👨‍🎓 **Estudiante** | Visualiza su proyecto, equipo de trabajo y documentos |
| 👨‍🏫 **Director** | Gestiona los proyectos bajo su dirección |
| 📋 **Coordinador** | Administra proyectos de su programa académico |
| 👑 **Admin General** | Acceso global a todos los proyectos |

---

## ⚙️ Instalación

### Requisitos previos
- Node.js 18 o superior
- npm o yarn

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/DavidBaez-14/FrontendSIGET.git

# Entrar a la carpeta
cd FrontendSIGET

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 🔗 Backend

Este frontend requiere el backend de SIGET para funcionar completamente.

**Repositorio Backend:** [BackendSIGET](https://github.com/DavidBaez-14/BackendSIGET)

---

## 📁 Estructura del Proyecto

```
src/
├── compartidos/       # Componentes reutilizables
├── context/           # Contexto de autenticación
├── proyectos/         # Módulo de proyectos
├── services/          # Conexión con API
├── vistas/            # Vistas principales
└── App.jsx            # Componente raíz
```

---

## 🧪 Usuarios de Prueba

El sistema incluye un selector de usuarios para testing:

- 👑 Admin General
- 📋 Admin Sistemas  
- 👨‍🏫 Director
- 👨‍🎓 Estudiante

---

## 📄 Licencia

Proyecto académico - Universidad Francisco de Paula Santander

---

**Desarrollado por:** David Báez  
**Programa:** Ingeniería de Sistemas  
**Año:** 2024
