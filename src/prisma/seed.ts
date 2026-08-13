import { prisma } from "@/config/lib/prisma";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { logger } from "@modules/observability/logger";

dotenv.config();

async function main() {
  logger.info("Iniciando el sembrado de datos (seed)...");

  const adminEmail = process.env.ADMIN_EMAIL || "AdministradorClinico@gmail.com";
  const defaultPassword = process.env.ADMIN_PASSWORD || "Admin20051030";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    await prisma.user.create({
      data: {
        nombre: "Administrador del Sistema",
        email: adminEmail,
        password: hashedPassword,
        rol: "ADMIN",
        activo: true,
      },
    });
    logger.info(`Usuario administrador creado exitosamente: ${adminEmail}`);
    logger.info(`Contraseña por defecto: ${defaultPassword}`);
  } else {
    logger.info(`El usuario administrador ya existe: ${adminEmail}`);
  }

  const systemPromptContent = `Eres un asistente clínico para médicos.
Tu función es analizar síntomas, antecedentes y hallazgos clínicos del paciente.

Debes responder estructurando la información en un formato JSON válido con el siguiente esquema:
{
  "diagnosticos": [
    {
      "enfermedad": "Nombre de la enfermedad sugerida",
      "probabilidad": 85,
      "nivelRiesgo": "Alto" | "Medio" | "Bajo",
      "explicacion": "Explicación textual detallada de qué síntomas o antecedentes influyeron en esta sugerencia"
    }
  ],
  "recomendaciones": "Texto con estudios complementarios sugeridos, medicamentos o pasos a seguir",
  "signosAlarma": ["Signo 1", "Signo 2", "Signo 3"],
  "nivelUrgencia": "Alta" | "Media" | "Baja"
}

Restricciones clínicas importantes:
- Genera diagnósticos diferenciales ordenados de mayor a menor probabilidad.
- Explica los factores a favor y en contra.
- Identifica claramente los signos de alarma.
- Indica siempre que no son diagnósticos definitivos y que el criterio médico final es el único válido.
Responde estrictamente en formato JSON sin Markdown adicional.`;

  const defaultVersion = "v1.0.0";
  const existingPrompt = await prisma.promptVersion.findFirst({
    where: { version: defaultVersion },
  });

  if (!existingPrompt) {
    await prisma.promptVersion.create({
      data: {
        version: defaultVersion,
        contenido: systemPromptContent,
        activo: true,
      },
    });
    logger.info(`Versión de prompt inicial ${defaultVersion} creada y activada.`);
  } else {
    logger.info(`La versión de prompt ${defaultVersion} ya existe.`);
  }

  const existingConfig = await prisma.config.findUnique({
    where: { id: 1 },
  });

  if (!existingConfig) {
    await prisma.config.create({
      data: {
        id: 1,
        modelName: "gemini-3.6-flash",
        maxTokens: 4000,
        temperatura: 0.1,
        systemPrompt: systemPromptContent,
      },
    });
    logger.info("Configuración global de Gemini (Singleton) creada con id: 1.");
  } else {
    logger.info("La configuración global de Gemini ya existe.");
  }

  logger.info("Sembrado de datos finalizado con éxito.");
}

main()
  .catch((e) => {
    logger.error({ e }, "Error durante el sembrado de datos (seed)");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
