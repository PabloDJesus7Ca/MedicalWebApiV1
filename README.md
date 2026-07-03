# Medical AI Backend

Backend desarrollado con TypeScript, Express y Prisma para proporcionar servicios de inteligencia artificial aplicada al ámbito médico.

## Tecnologías Utilizadas

- Node.js
- TypeScript
- Express 5
- Prisma ORM
- PostgreSQL
- Gemini AI (@google/genai)
- JWT (JSON Web Token)
- Bcrypt
- Helmet
- CORS
- Dotenv
- Swagger OpenAPI
- Swagger UI
- ESLint
- Prettier

---

## Características

- API REST desarrollada con Express.
- Integración con Google Gemini AI.
- Autenticación basada en JWT.
- Encriptación de contraseñas mediante Bcrypt.
- Persistencia de datos con Prisma ORM.
- Base de datos PostgreSQL.
- Middleware global de manejo de errores.
- Configuración de seguridad con Helmet.
- Configuración de CORS personalizada.
- Variables de entorno mediante Dotenv.
- Documentación interactiva de la API mediante Swagger.
- Pruebas de endpoints directamente desde Swagger UI.
- Formateo y análisis estático de código con Prettier y ESLint.

---

## Instalación

### Clonar el repositorio

```bash
git clone <repository-url>
cd medical-ai-backend
```

### Instalar dependencias

```bash
npm install
```

---

## Configuración

Crear un archivo `.env` en la raíz del proyecto.

Ejemplo:

```env
PORT=3000

DATABASE_URL="postgresql://postgres:12345@localhost:5432/medical_ai?schema=public"

GEMINI_API_KEY=your_api_key

JWT_SECRET=your_secret_key
```

---

## Base de Datos

Inicializar Prisma:

```bash
npx prisma init
```

Crear migraciones:

```bash
npx prisma migrate dev --name init
```

Generar cliente Prisma:

```bash
npx prisma generate
```

---

## Scripts Disponibles

### Desarrollo

```bash
npm run dev
```

Ejecuta el servidor en modo desarrollo utilizando TSX Watch.

### Compilar Proyecto

```bash
npm run build
```

Genera los archivos JavaScript compilados dentro de la carpeta `dist`.

### Producción

```bash
npm run start
```

Ejecuta la versión compilada del proyecto.

### Analizar Código

```bash
npm run lint
```

Ejecuta ESLint sobre el código fuente.

### Corregir Problemas de ESLint

```bash
npm run lint:fix
```

Corrige automáticamente problemas detectados por ESLint.

### Formatear Código

```bash
npm run format
```

Formatea el proyecto utilizando Prettier.

---

## Documentación de la API (Swagger)

La API incluye documentación interactiva mediante Swagger OpenAPI.

Swagger permite:

- Consultar todos los endpoints disponibles.
- Visualizar parámetros de entrada y salida.
- Ejecutar peticiones directamente desde el navegador.
- Facilitar la integración con aplicaciones frontend y servicios externos.

### Acceder a Swagger

Una vez iniciado el servidor:

```bash
npm run dev
```

Abrir en el navegador:

```text
http://localhost:3003/api-docs
```

> Si el puerto configurado en tu archivo `.env` es diferente, reemplaza `3003` por el puerto correspondiente.

### Cómo utilizar Swagger

1. Accede a `/api-docs`.
2. Selecciona el endpoint que deseas probar.
3. Haz clic en **Try it out**.
4. Completa los parámetros o el cuerpo de la solicitud.
5. Haz clic en **Execute**.
6. Revisa la respuesta generada por la API.

### Ejemplo 1: Consulta de IA

Endpoint:

```http
POST /api/chat
```

Request:

```json
{
  "message": "¿Cuáles son los síntomas de la diabetes?"
}
```

Response:

```json
{
  "response": "Los síntomas más comunes de la diabetes incluyen..."
}
```

### Ejemplo 2: Login de Usuario (Retorna ID y Token JWT)

Endpoint:

```http
POST /api/auth/login
```

Request:

```json
{
  "email": "doctor@hospital.com",
  "password": "MiPassword123"
}
```

Response:

```json
{
  "message": "Haz Iniciado Session Correctamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": 1
}
```

---

## Endpoint de Salud

Verificar estado del servidor:

```http
GET /health
```

Respuesta:

```json
{
  "message": "Server On ago"
}
```

---

## Seguridad

El proyecto utiliza:

- Helmet para protección de cabeceras HTTP.
- CORS configurable por dominios permitidos.
- JWT para autenticación.
- Bcrypt para almacenamiento seguro de contraseñas.

---

## Inteligencia Artificial

La aplicación integra Google Gemini mediante el paquete:

```bash
@google/genai
```

Permitiendo la generación de respuestas médicas asistidas por IA.

---

## Licencia

ISC License.
