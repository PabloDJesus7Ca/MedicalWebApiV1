import { prisma } from "@/config/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("Iniciando el sembrado de datos (seed)...");

  // 1. Crear el primer usuario administrador por defecto
  const adminEmail = "admin@medreason.ai";
  const defaultPassword = "AdminPassword123!";

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
    console.log(`Usuario administrador creado exitosamente: ${adminEmail}`);
    console.log(`Contraseña por defecto: ${defaultPassword}`);
  } else {
    console.log(`El usuario administrador ya existe: ${adminEmail}`);
  }

  // 2. Definir el prompt base del sistema
  const systemPromptContent = `Eres un asistente clínico para médicos.
Tu función es analizar síntomas, antecedentes y hallazgos clínicos del paciente.

Debes responder estructurando la información en un formato JSON válido con el siguiente esquema:
{
  "diagnosticos": [
    {
      "enfermedad": "Nombre de la enfermedad sugerida",
      "probabilidad": 85, // Porcentaje de confianza estimado
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

  // 3. Crear o actualizar la versión de prompt inicial
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
    console.log(`Versión de prompt inicial ${defaultVersion} creada y activada.`);
  } else {
    console.log(`La versión de prompt ${defaultVersion} ya existe.`);
  }

  // 4. Crear la configuración global singleton para Gemini AI (id: 1)
  const existingConfig = await prisma.config.findUnique({
    where: { id: 1 },
  });

  if (!existingConfig) {
    await prisma.config.create({
      data: {
        id: 1,
        modelName: "gemini-2.5-flash",
        maxTokens: 4000,
        temperatura: 0.1,
        systemPrompt: systemPromptContent,
      },
    });
    console.log("Configuración global de Gemini (Singleton) creada con id: 1.");
  } else {
    console.log("La configuración global de Gemini ya existe.");
  }

  console.log("Sembrado de datos finalizado con éxito.");
}

main()
  .catch((e) => {
    console.error("Error durante el sembrado de datos (seed):", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
