Backend API for the Medical AI platform developed as a final project.

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

Formatea el proyecto utilizando Prettier.`

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
