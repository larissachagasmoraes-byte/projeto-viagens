-- CreateTable
CREATE TABLE "TiktokDados" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usuario" TEXT,
    "seguidores" INTEGER NOT NULL DEFAULT 0,
    "ultimoVideoData" TIMESTAMP(3),
    "ultimoVideoVisualizacoes" INTEGER NOT NULL DEFAULT 0,
    "ultimoVideoEngajamento" INTEGER NOT NULL DEFAULT 0,
    "nicho" TEXT,
    "taxaPostagem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TiktokDados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TiktokDados_userId_key" ON "TiktokDados"("userId");

-- AddForeignKey
ALTER TABLE "TiktokDados" ADD CONSTRAINT "TiktokDados_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
