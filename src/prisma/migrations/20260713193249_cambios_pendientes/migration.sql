/*
  Warnings:

  - Added the required column `question` to the `ChatbotAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatbotAnswer" ADD COLUMN     "question" TEXT NOT NULL;
