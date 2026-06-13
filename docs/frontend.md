# Módulo do Frontend — GreenChain

O frontend do GreenChain oferece uma interface de usuário de alto padrão estético (estilo GreenTech), com relatórios gerenciais interativos em tempo real para cidadãos e empresas de reciclagem.

## Stack Tecnológica Utilizada

*   **Next.js & React 19:** Estrutura fundamental para a construção da aplicação cliente e interface reativa baseada em componentes reutilizáveis.
*   **Tailwind CSS v4:** Motor de estilos utilitários. Utiliza as novas sintaxes com variáveis CSS nativas (como cores baseadas em OKLCH) para desenhar o tema escuro dinâmico, layouts flexíveis, painéis com efeito de vidro (*glassmorphism*) e animações suaves (como pulsares e auras giratórias).
*   **Lucide React:** Coleção de ícones vetoriais modernos e leves utilizados para representar materiais e status.
*   **Wagmi & Viem:** A camada de comunicação Web3. O **Viem** gerencia as conexões HTTP/RPC com a blockchain Celo. O **Wagmi** fornece os React Hooks (como `useAccount` e `useBalance`) para que a interface reaja instantaneamente a mudanças na carteira conectada.
*   **RainbowKit:** Componente visual intuitivo e personalizável para a seleção e conexão de carteiras de criptomoedas, integrado ao cabeçalho principal da aplicação.
*   **TanStack React Query:** Mecanismo assíncrono para cachear, buscar e revalidar os dados obtidos da blockchain, minimizando requisições redundantes e otimizando a performance do app.
*   **React Context API (lib/app-context.tsx):** Sincronização e controle do fluxo do Simulador IoT compartilhando o estado de peso e material com os painéis principais em memória.
