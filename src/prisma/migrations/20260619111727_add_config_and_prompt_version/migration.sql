/*
  Warnings:

  - The values [admin,doctor] on the enum `Rol` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `codigoError` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `mensaje` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `nivel` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `dni` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `fechaNacimiento` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the `Agenda` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Doctor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HistorialPaciente` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[documento]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accion` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `detalle` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entidad` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `AuditLog` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `creadoPorId` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documento` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `edad` to the `Paciente` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Rol_new" AS ENUM ('ADMIN', 'DOCTOR');
ALTER TABLE "User" ALTER COLUMN "rol" TYPE "Rol_new" USING ("rol"::text::"Rol_new");
ALTER TYPE "Rol" RENAME TO "Rol_old";
ALTER TYPE "Rol_new" RENAME TO "Rol";
DROP TYPE "public"."Rol_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_userId_fkey";

-- DropForeignKey
ALTER TABLE "HistorialPaciente" DROP CONSTRAINT "HistorialPaciente_agendaId_fkey";

-- DropForeignKey
ALTER TABLE "HistorialPaciente" DROP CONSTRAINT "HistorialPaciente_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "HistorialPaciente" DROP CONSTRAINT "HistorialPaciente_pacienteId_fkey";

-- DropIndex
DROP INDEX "AuditLog_creadoEn_idx";

-- DropIndex
DROP INDEX "Paciente_dni_key";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "codigoError",
DROP COLUMN "creadoEn",
DROP COLUMN "mensaje",
DROP COLUMN "nivel",
ADD COLUMN     "accion" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "detalle" TEXT NOT NULL,
ADD COLUMN     "entidad" TEXT NOT NULL,
ADD COLUMN     "entidadId" INTEGER,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Paciente" DROP COLUMN "creadoEn",
DROP COLUMN "dni",
DROP COLUMN "fechaNacimiento",
ADD COLUMN     "creadoPorId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "documento" TEXT NOT NULL,
ADD COLUMN     "edad" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Agenda";

-- DropTable
DROP TABLE "Doctor";

-- DropTable
DROP TABLE "HistorialPaciente";

-- DropEnum
DROP TYPE "StatusAgenda";

-- CreateTable
CREATE TABLE "Consulta" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "nivelRiesgo" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laboratorio" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "resultado" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Laboratorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "modelName" TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
    "maxTokens" INTEGER NOT NULL DEFAULT 4000,
    "temperatura" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "systemPrompt" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptVersion" (
    "id" SERIAL NOT NULL,
    "version" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Consulta_doctorId_idx" ON "Consulta"("doctorId");

-- CreateIndex
CREATE INDEX "Consulta_pacienteId_idx" ON "Consulta"("pacienteId");

-- CreateIndex
CREATE INDEX "Consulta_createdAt_idx" ON "Consulta"("createdAt");

-- CreateIndex
CREATE INDEX "Laboratorio_pacienteId_idx" ON "Laboratorio"("pacienteId");

-- CreateIndex
CREATE INDEX "Laboratorio_fecha_idx" ON "Laboratorio"("fecha");

-- CreateIndex
CREATE INDEX "PromptVersion_version_idx" ON "PromptVersion"("version");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_documento_key" ON "Paciente"("documento");

-- CreateIndex
CREATE INDEX "Paciente_documento_idx" ON "Paciente"("documento");

-- CreateIndex
CREATE INDEX "Paciente_nombre_idx" ON "Paciente"("nombre");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laboratorio" ADD CONSTRAINT "Laboratorio_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
