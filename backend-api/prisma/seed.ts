import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n')

  // Limpar dados existentes
  console.log('🧹 Limpando dados existentes...')
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.product.deleteMany()
  await prisma.nfeImport.deleteMany()
  await prisma.caixaMovimentacao.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.establishment.deleteMany()

  // Criar estabelecimento de teste
  console.log('🏪 Criando estabelecimento...')
  const establishment = await prisma.establishment.create({
    data: {
      nome: 'Mercado Exemplo LTDA',
      cnpj: '12345678000190',
      email: 'contato@mercadoexemplo.com',
      telefone: '11999999999',
      endereco: 'Rua Exemplo, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234567',
    },
  })
  console.log(`✅ Estabelecimento criado: ${establishment.nome}`)

  // Criar usuários
  console.log('\n👥 Criando usuários...')
  const hashedPassword = await bcrypt.hash('senha123', 10)

  const admin = await prisma.user.create({
    data: {
      establishmentId: establishment.id,
      nome: 'Admin Sistema',
      email: 'admin@mercadoexemplo.com',
      senha: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin criado: ${admin.email}`)

  const operador = await prisma.user.create({
    data: {
      establishmentId: establishment.id,
      nome: 'João Operador',
      email: 'operador@mercadoexemplo.com',
      senha: hashedPassword,
      role: 'OPERADOR',
    },
  })
  console.log(`✅ Operador criado: ${operador.email}`)

  // Criar produtos de exemplo
  console.log('\n📦 Criando produtos...')

  const produtos = [
    {
      codigo: '001',
      ean: '7891234567890',
      nome: 'Arroz Branco 5kg',
      descricao: 'Arroz branco tipo 1',
      categoria: 'Alimentos',
      unidade: 'UN',
      precoCusto: 12.50,
      precoVenda: 18.90,
      estoque: 50,
      estoqueMinimo: 10,
      ncm: '10063021',
      cfop: '5102',
    },
    {
      codigo: '002',
      ean: '7891234567891',
      nome: 'Feijão Preto 1kg',
      descricao: 'Feijão preto tipo 1',
      categoria: 'Alimentos',
      unidade: 'UN',
      precoCusto: 4.50,
      precoVenda: 7.90,
      estoque: 80,
      estoqueMinimo: 15,
      ncm: '07133390',
      cfop: '5102',
    },
    {
      codigo: '003',
      ean: '7891234567892',
      nome: 'Óleo de Soja 900ml',
      descricao: 'Óleo de soja refinado',
      categoria: 'Alimentos',
      unidade: 'UN',
      precoCusto: 5.00,
      precoVenda: 8.50,
      estoque: 60,
      estoqueMinimo: 12,
      ncm: '15079010',
      cfop: '5102',
    },
    {
      codigo: '004',
      ean: '7891234567893',
      nome: 'Açúcar Cristal 1kg',
      descricao: 'Açúcar cristal',
      categoria: 'Alimentos',
      unidade: 'UN',
      precoCusto: 2.80,
      precoVenda: 4.90,
      estoque: 100,
      estoqueMinimo: 20,
      ncm: '17011100',
      cfop: '5102',
    },
    {
      codigo: '005',
      ean: '7891234567894',
      nome: 'Café Torrado 500g',
      descricao: 'Café torrado e moído',
      categoria: 'Alimentos',
      unidade: 'UN',
      precoCusto: 8.50,
      precoVenda: 14.90,
      estoque: 40,
      estoqueMinimo: 8,
      ncm: '09012100',
      cfop: '5102',
    },
    {
      codigo: '006',
      ean: '7891234567895',
      nome: 'Refrigerante Cola 2L',
      descricao: 'Refrigerante sabor cola',
      categoria: 'Bebidas',
      unidade: 'UN',
      precoCusto: 4.00,
      precoVenda: 7.50,
      estoque: 70,
      estoqueMinimo: 15,
      ncm: '22021000',
      cfop: '5102',
    },
    {
      codigo: '007',
      ean: '7891234567896',
      nome: 'Água Mineral 1.5L',
      descricao: 'Água mineral sem gás',
      categoria: 'Bebidas',
      unidade: 'UN',
      precoCusto: 1.20,
      precoVenda: 2.50,
      estoque: 120,
      estoqueMinimo: 30,
      ncm: '22011000',
      cfop: '5102',
    },
    {
      codigo: '008',
      ean: '7891234567897',
      nome: 'Sabão em Pó 1kg',
      descricao: 'Sabão em pó para roupas',
      categoria: 'Limpeza',
      unidade: 'UN',
      precoCusto: 6.00,
      precoVenda: 10.90,
      estoque: 35,
      estoqueMinimo: 8,
      ncm: '34022000',
      cfop: '5102',
    },
    {
      codigo: '009',
      ean: '7891234567898',
      nome: 'Detergente Líquido 500ml',
      descricao: 'Detergente líquido neutro',
      categoria: 'Limpeza',
      unidade: 'UN',
      precoCusto: 1.50,
      precoVenda: 2.90,
      estoque: 90,
      estoqueMinimo: 20,
      ncm: '34022000',
      cfop: '5102',
    },
    {
      codigo: '010',
      ean: '7891234567899',
      nome: 'Papel Higiênico 12 rolos',
      descricao: 'Papel higiênico folha dupla',
      categoria: 'Higiene',
      unidade: 'PCT',
      precoCusto: 8.50,
      precoVenda: 14.90,
      estoque: 45,
      estoqueMinimo: 10,
      ncm: '48181000',
      cfop: '5102',
    },
  ]

  for (const produto of produtos) {
    const created = await prisma.product.create({
      data: {
        ...produto,
        establishmentId: establishment.id,
      },
    })
    console.log(`✅ Produto criado: ${created.nome}`)
  }

  // Criar exemplo de NF-e importada
  console.log('\n📄 Criando registro de NF-e...')
  const nfe = await prisma.nfeImport.create({
    data: {
      establishmentId: establishment.id,
      chaveAcesso: '35210812345678000190550010000000011234567890',
      numero: '000000001',
      serie: '001',
      modelo: '55',
      fornecedorCnpj: '98765432000100',
      fornecedorNome: 'Distribuidora ABC LTDA',
      dataEmissao: new Date('2024-01-15'),
      valorTotal: 1250.50,
      xmlContent: '<nfeProc><!-- XML exemplo --></nfeProc>',
      produtosCount: 5,
    },
  })
  console.log(`✅ NF-e registrada: ${nfe.numero}`)

  console.log('\n✨ Seed concluído com sucesso!')
  console.log('\n📝 Credenciais de teste:')
  console.log('   Admin: admin@mercadoexemplo.com / senha123')
  console.log('   Operador: operador@mercadoexemplo.com / senha123')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
