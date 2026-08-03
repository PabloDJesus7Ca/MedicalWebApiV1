# 🚀 Guía de Migración Frontend (Backend v2.0)

Este documento detalla los cambios estructurales, de seguridad y de comportamiento implementados en la **Versión 2.0 del Backend**. Varias rutas (URLs) han sido renombradas y el comportamiento interno ha cambiado drásticamente para cumplir con normativas médicas.

---

## 1. 🗺️ Mapeo de Rutas (Endpoints Renombrados)

Debido a la eliminación del "Spanglish" en el backend y la migración a la nueva Arquitectura Modular (DDD), algunos endpoints cambiaron de URL. Actualiza tus llamadas en Axios/Fetch basándote en esta tabla:

### ⚙️ Módulo de Administración (`/api/admin`)

| Acción                     | Ruta Anterior (v1.0)    | Nueva Ruta (v2.0)            | Estado       |
| :------------------------- | :---------------------- | :--------------------------- | :----------- |
| **Configuración IA**       | `/api/admin/ia-config`  | 🟢 `/api/admin/configSystem` | **¡CAMBIÓ!** |
| **Registros de Auditoría** | `/api/admin/admin-logs` | 🟢 `/api/admin/logs`         | **¡CAMBIÓ!** |
| **Gestión de Usuarios**    | `/api/admin/usuarios`   | 🟡 `/api/admin/usuarios`     | Sin cambios  |

> **Acción Requerida:** Reemplaza cualquier llamada a `/ia-config` por `/configSystem`.

### 🤖 Módulo del Agente / IA Core

| Acción                     | Ruta Anterior (v1.0)         | Nueva Ruta (v2.0) | Estado       |
| :------------------------- | :--------------------------- | :---------------- | :----------- |
| **Interacción con Agente** | `/api/agent` (o `/api/chat`) | 🟢 `/api/model`   | **¡CAMBIÓ!** |
| **Chatbot Clínico**        | `/api/chatbot`               | 🟡 `/api/chatbot` | Sin cambios  |

### 🏥 Módulos Clínicos (Rutas base mantenidas)

Para no romper todo tu frontend, las rutas base de la clínica se mantuvieron en español.

| Acción                | Ruta Anterior (v1.0)            | Nueva Ruta (v2.0)                  | Estado             |
| :-------------------- | :------------------------------ | :--------------------------------- | :----------------- |
| **Gestión Pacientes** | `/api/pacientes`                | 🟡 `/api/pacientes`                | Sin cambios en URL |
| **Expedientes**       | `/api/pacientes/:id/expediente` | 🟡 `/api/pacientes/:id/expediente` | Sin cambios en URL |
| **Consultas IA**      | `/api/consulta`                 | 🟡 `/api/consulta`                 | Sin cambios en URL |

---

## 2. 🗑️ Fin del Hard-Delete (Manejo de Pacientes y Propiedad `activo`)

> [!WARNING]
> **Endpoint Afectado:** `DELETE /api/pacientes/:id` y `GET /api/pacientes`

**Antes (v1.0):**
El botón de borrar paciente hacía un **Hard-Delete** (borraba permanentemente la fila de la base de datos). Esto es ilegal según las normativas de retención de datos médicos (HIPAA/GDPR).

**Ahora (v2.0):**
Se implementó **Soft-Delete (Borrado Lógico)**.

- Al llamar a `DELETE /api/pacientes/:id`, el backend responde con éxito (200), pero internamente solo cambia la propiedad `activo: false`. **No se destruyen los datos clínicos.**
- Al llamar a `GET /api/pacientes`, el servidor filtra automáticamente y **solo devuelve a los pacientes con `activo: true`**. El frontend no necesita hacer ningún filtrado extra; el paciente simplemente "desaparecerá" mágicamente de las listas.

---

## 3. 👥 Fusión de Doctor y User (Cambio en Autenticación)

> [!NOTE]
> **Endpoint Afectado:** `/api/auth/login` y `/api/admin/usuarios`

**Antes (v1.0):**
Existía una tabla separada de `Doctor` y otra de `User`, lo que hacía que el payload de respuesta al iniciar sesión fuera redundante y complejo.

**Ahora (v2.0):**
La tabla `Doctor` **fue eliminada por completo**. Todo fue unificado en la tabla `User`.

- Al hacer Login, el objeto de respuesta será mucho más limpio. Simplemente verifica la propiedad `rol` (que ahora será `ADMIN` o `DOCTOR`) para decidir qué pantallas mostrarle al usuario.

---

## 4. 🔐 Privacidad (Vulnerabilidad IDOR resuelta)

> [!IMPORTANT]
> **Endpoints Afectados:** `GET /api/consulta/:id`

**Antes (v1.0):**
Un doctor podía ver el historial de un paciente que le pertenecía a otro doctor con solo adivinar y cambiar el ID en la URL de su navegador.

**Ahora (v2.0):**
El backend tiene una regla de propiedad (`doctorId: user.id`).

- Si envías un `GET` a una consulta ajena, el backend **te devolverá un 404 (Not Found)** para aislar la privacidad del paciente. El Frontend debe estar preparado para mostrar una pantalla de "Registro no encontrado". (Los ADMIN sí pueden ver todo).

---

## 5. 🛑 Estandarización de Errores (Zod y Global Error Handler)

> [!WARNING]
> **Impacto en todo el sistema.**

**Antes (v1.0):** Errores inconsistentes, el servidor se caía o devolvía HTML.

**Ahora (v2.0):** Todo error es un JSON.

- **Validación (400):** Si envías datos incompletos, Zod devuelve un JSON detallado:
  ```json
  {
    "message": "Error de validación",
    "errors": [{ "field": "edad", "message": "El campo edad es obligatorio" }]
  }
  ```
- **Error Crítico del Servidor (500):** Como medida de seguridad, la API **ya no enviará volcados de Prisma ni trazas de código (`class`, `code`)**. El frontend *siempre* recibirá un payload genérico seguro. Tu código debe interceptarlo y mostrar un mensaje amistoso al usuario indicando que intente más tarde.
  ```json
  {
    "message": "Error interno del servidor. Por favor, contacta al administrador."
  }
  ```
- **Límite IA (429):** El endpoint `POST /api/consulta` tirará Error `429 Too Many Requests` si un doctor hace más de 100 consultas por hora. **El Frontend debe mostrar una alerta interceptando este status.**

---

## 6. 📂 Resumen Interno (Carpetas en Inglés)

Si tienes que entrar al repositorio del Backend, ten en cuenta que el Spanglish fue eliminado de las carpetas bajo la arquitectura DDD:

- ❌ `src/modules/pacientes` ➡️ ✅ `src/modules/patient`
- ❌ `src/modules/consulta` ➡️ ✅ `src/modules/consultation`
- ❌ `src/modules/usuarios` ➡️ ✅ `src/modules/user`
- ❌ `src/modules/admin/admin-logs` ➡️ ✅ `src/modules/admin/audit`

---

## 7. 🔄 Sincronizar la Base de Datos Local (Para evitar errores)

Para que el backend v2.0 funcione correctamente en tu máquina local y no te arroje errores de columnas faltantes o tablas inexistentes (como el campo `activo` de Pacientes), debes sincronizar tu base de datos local con el último esquema de Prisma. Sigue estos pasos paso por paso:

1. **Asegura tus variables de entorno:**
   Verifica que tienes un archivo `.env` en la raíz del proyecto backend (puedes copiarlo desde `.env.example`).
   Debe contener tu URL de base de datos, por ejemplo:
   `DATABASE_URL="postgresql://mi_usuario:mi_password@localhost:5432/medreason_ai?schema=public"`

2. **Levanta tu Base de Datos:**
   Si usas Docker, levanta el contenedor de PostgreSQL con:
   ```bash
   docker-compose up -d
   ```

3. **Instala las dependencias más recientes:**
   Asegúrate de tener instalados los nuevos paquetes (como Zod 4).
   ```bash
   npm install
   ```

4. **Sincroniza el esquema de Prisma (Paso Crítico):**
   Ejecuta el siguiente comando para forzar a tu base de datos local a adoptar las nuevas tablas y columnas sin necesidad de correr migraciones complejas:
   ```bash
   npm run db:push
   ```
   *(Este comando también autogenerará el cliente de Prisma actualizado en la carpeta `src/generated/prisma`).*

5. **(Opcional) Carga los datos semilla:**
   Si tu base de datos quedó vacía o necesitas un usuario Administrador por defecto, ejecuta el seeder:
   ```bash
   npm run db:seed
   ```

¡Con esto tendrás la base de datos 100% alineada a la última versión y lista para desarrollo!
