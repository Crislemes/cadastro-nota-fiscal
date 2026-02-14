# 📋 Cadastro de Nota Fiscal

Sistema web para cadastro e geração de notas fiscais de serviços mecânicos. Desenvolvido para o A&C Centro Automotivo, permite registrar dados de clientes, peças utilizadas, mão de obra e gerar PDFs profissionais das notas fiscais.

## 🚀 Tecnologias

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- jsPDF

## 💻 Como Executar Localmente

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou pnpm

### Instalação e Execução

```bash
# Instalar dependências
npm i

# Iniciar servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

## 📦 Funcionalidades

- ✅ Cadastro de dados do cliente (nome, CPF/CNPJ, telefone, endereço)
- ✅ Gerenciamento de peças utilizadas (nome, quantidade, valor unitário)
- ✅ Registro de valor de mão de obra
- ✅ Cálculo automático de totais
- ✅ Validação de formulários
- ✅ Geração de PDF da nota fiscal
- ✅ Interface responsiva

## 🎨 Design

Design original disponível no Figma: https://www.figma.com/design/5YKqQdOR5BcPuq81vbNSzJ/Cadastro-de-Nota-Fiscal