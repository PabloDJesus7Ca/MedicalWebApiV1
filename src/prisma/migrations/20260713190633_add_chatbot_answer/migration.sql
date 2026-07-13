-- CreateTable
CREATE TABLE "ChatbotAnswer" (
    "id" SERIAL NOT NULL,
    "consultaId" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatbotAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatbotAnswer_consultaId_idx" ON "ChatbotAnswer"("consultaId");

-- AddForeignKey
ALTER TABLE "ChatbotAnswer" ADD CONSTRAINT "ChatbotAnswer_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
