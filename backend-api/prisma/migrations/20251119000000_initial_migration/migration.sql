-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERADOR');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('ABERTURA', 'FECHAMENTO', 'SANGRIA', 'REFORCO');

-- CreateTable
CREATE TABLE "establishments" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "establishments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERADOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "ean" TEXT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT,
    "unidade" TEXT NOT NULL DEFAULT 'UN',
    "precoCusto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "precoVenda" DECIMAL(10,2) NOT NULL,
    "estoque" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "estoqueMinimo" DECIMAL(10,3),
    "ncm" TEXT,
    "cest" TEXT,
    "cfop" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "desconto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'CONCLUIDA',
    "formaPagamento" TEXT NOT NULL,
    "sincronizado" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "precoUnitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "desconto" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfe_imports" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "chaveAcesso" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "modelo" TEXT NOT NULL DEFAULT '55',
    "fornecedorCnpj" TEXT NOT NULL,
    "fornecedorNome" TEXT NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "valorTotal" DECIMAL(10,2) NOT NULL,
    "xmlContent" TEXT NOT NULL,
    "produtosCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nfe_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caixa_movimentacoes" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "saldoAnterior" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "saldoAtual" DECIMAL(10,2) NOT NULL,
    "observacoes" TEXT,
    "aberto" BOOLEAN NOT NULL DEFAULT false,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "caixa_movimentacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "establishments_cnpj_key" ON "establishments"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "establishments_email_key" ON "establishments"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "products_establishmentId_ean_idx" ON "products"("establishmentId", "ean");

-- CreateIndex
CREATE INDEX "products_establishmentId_nome_idx" ON "products"("establishmentId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "products_establishmentId_codigo_key" ON "products"("establishmentId", "codigo");

-- CreateIndex
CREATE INDEX "sales_establishmentId_data_idx" ON "sales"("establishmentId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "sales_establishmentId_numero_key" ON "sales"("establishmentId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "nfe_imports_chaveAcesso_key" ON "nfe_imports"("chaveAcesso");

-- CreateIndex
CREATE INDEX "nfe_imports_establishmentId_dataEmissao_idx" ON "nfe_imports"("establishmentId", "dataEmissao");

-- CreateIndex
CREATE INDEX "caixa_movimentacoes_establishmentId_dataHora_idx" ON "caixa_movimentacoes"("establishmentId", "dataHora");

-- CreateIndex
CREATE INDEX "caixa_movimentacoes_establishmentId_aberto_idx" ON "caixa_movimentacoes"("establishmentId", "aberto");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_imports" ADD CONSTRAINT "nfe_imports_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caixa_movimentacoes" ADD CONSTRAINT "caixa_movimentacoes_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caixa_movimentacoes" ADD CONSTRAINT "caixa_movimentacoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON UPDATE CASCADE;
