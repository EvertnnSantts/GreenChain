# GreenChain

## Visão Geral

O GreenChain é uma plataforma inovadora de **Recycle-to-Earn (R2E)** que conecta cidadãos a lixeiras inteligentes e os recompensa com tokens $GREEN por suas contribuições para a reciclagem. O objetivo principal é incentivar a sustentabilidade e a economia circular, utilizando a tecnologia blockchain para garantir transparência e recompensas justas. A aplicação inclui um painel de usuário para acompanhamento de reciclagem, um dashboard para empresas monitorarem o impacto e um simulador IoT para lixeiras inteligentes.

### Principais Funcionalidades

*   **Painel do Usuário:** Acompanhamento de peso reciclado, CO2 evitado, árvores salvas e histórico de descartes.
*   **Dashboard da Empresa:** Monitoramento de receita, lixeiras ativas, volume coletado e tokens emitidos.
*   **Simulador IoT:** Simulação de lixeiras inteligentes para autenticação de usuários, registro de materiais e pesos, e processamento de transações.
*   **Integração Web3:** Conexão com carteiras e transações na blockchain Celo.
*   **Internacionalização (i18n):** Suporte para múltiplos idiomas (Português e Inglês).

## Tecnologias Utilizadas

*   **Frontend:** Next.js, React, TypeScript, Tailwind CSS
*   **Backend:** Next.js API Routes
*   **Banco de Dados:** Não especificado no projeto atual (mock de dados em `lib/app-context.tsx`)
*   **Ferramentas e Bibliotecas:** Hardhat, Ethers.js, RainbowKit, Zustand, Lucide React, Vercel Analytics

## Instalação

Para executar o projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd GreenChain
    ```
2.  **Instale as dependências:**
    ```bash
    npm install --legacy-peer-deps
    ```
    *Nota: O `--legacy-peer-deps` é usado para resolver conflitos de dependência de pares.* 

3.  **Compile os contratos (se necessário):**
    ```bash
    npx hardhat compile
    ```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis (exemplo):

```env
NEXT_PUBLIC_PROJECT_NAME="GreenChain"
NEXT_PUBLIC_ALCHEMY_ID="your_alchemy_id"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_walletconnect_project_id"
```

## Execução

Para iniciar o frontend e o backend (Next.js): 

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`.

## Estrutura do Projeto

```
GreenChain/
├── app/                      # Rotas da aplicação Next.js (páginas e API routes)
│   ├── api/                  # Endpoints da API (autenticação, bins, company, discard, otp, users)
│   ├── globals.css           # Estilos globais
│   ├── layout.tsx            # Layout principal da aplicação
│   └── page.tsx              # Página inicial
├── components/               # Componentes React reutilizáveis
│   ├── auth/                 # Componentes de autenticação
│   ├── ui/                   # Componentes de UI (shadcn/ui)
│   └── ...                   # Outros componentes (user-dashboard, company-dashboard, bin-simulator)
├── contracts/                # Contratos inteligentes Solidity
├── docs/                     # Documentação do projeto
├── lib/                      # Funções utilitárias e contextos (app-context, lang-context, web3-config)
├── messages/                 # Arquivos de internacionalização (en.json, pt.json)
├── public/                   # Ativos estáticos (imagens, ícones)
├── package.json              # Metadados do projeto e dependências
├── tsconfig.json             # Configuração TypeScript
└── ...                       # Outros arquivos de configuração (next.config.mjs, postcss.config.mjs)
```

## Deploy

Este projeto pode ser facilmente implantado em plataformas como Vercel, Netlify ou qualquer outro provedor de hospedagem que suporte Next.js. 

1.  **Build da aplicação:**
    ```bash
    npm run build
    ```
2.  **Inicie a aplicação em produção:**
    ```bash
    npm run start
    ```

Siga a documentação do seu provedor de hospedagem para configurar as variáveis de ambiente e o processo de deploy.
