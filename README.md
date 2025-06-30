# Gestión de Configuración

## Descripción

Este proyecto contiene el código fuente de la aplicación web Gestión de Configuración.
La aplicación está diseñada para gestionar entornos que requieren organización, principalmente en procesos de orden y actualización de recursos.

Permite visualizar y administrar "Componentes" registrados en la base de datos. Los usuarios con privilegios pueden crear, actualizar y eliminar componentes.

## Funcionalidades clave

* Gestión completa de componentes, incluyendo sus configuraciones y especificaciones.
* Creación y administración de atributos genéricos para cualquier componente.
* Registro y control jerárquico de dependencias entre componentes.
* Registro detallado de cambios mediante historial.
* Control de acceso mediante autenticación meadiante credenciales y Google (Google Firebase)

## Requisitos para su correcto funcionamiento

La aplicación funciona con google firebase como autenticación secundaria.
Es necesario configurar una cuenta Firebase para administrar dominios y restricciones de dominios de correo electónicos. 

A continuación, se describen los pasos de configuración.

1. Dirigirse al [sitio web oficial de Google Firebase](https://firebase.google.com/).
2. Acceder con una cuenta de Google.
3. Entrar a consola pulsando el botón "Go to console".
4. Crear el proyecto o seleccionar uno existente.
5. Añadir una aplicación web y registrar el proyecto.
   Esto generará un archivo que debe copiar y agregar al .env del proyecto.
   
  ![Registrar App en Firebase](https://github.com/user-attachments/assets/8ef50250-b208-4419-8ce1-ccc83628d65e)
  
7. Configurar la autenticación desde la sección "Authentication".
8. En la pestaña "Usuarios" puede visualizar los usuarios registrados.
9. En la pestaña "Métodos de acceso" puede administrar los métodos de autenticación de la app (En versiones iniciales solo soporta Google)
10. En la pestaña "Configuración" - "Dominios autorizados" agergar la URL de producción de la app.
11. Al completar estos pasos, la autenticación con Google funcionará correctamente.

También es necesario crear un archivo .env con las variables de configuración de Firebase, URL del backend y el puerto de despliegue

### Para mayor información consulte la [documentación oficia de Firebasel](https://firebase.google.com/docs/web/setup)

## Estructura del Proyecto

Esta sección describe la estructura de carpetas y su propósito en este proyecto.

- **src/**: Código fuente de la aplicación
- **public/**: Archivos estáticos y recursos públicos
- **src/auth/**: Componentes para vista de inicio de sesión/registro
- **src/components/**: Componentes reutilizables de UI
- **src/firebase/**: Configuración de firebase
- **src/test/**: Testing unitario de componentes personalizados
- **src/utils/**: Funciones y utilidades generales
- **src/views/**: Vistas principales de la aplicación
- **src/AppRouter.js: Administración de rutas y permisos para acceder a estas

## Inicialización del proyecto
* Instalar dependencias
  ```bash npm install```
* Iniciar la aplicación en modo desarrollo
```bash npm run start```
### Por defecto, la aplicación estará disponible en `http://localhost:3000`
