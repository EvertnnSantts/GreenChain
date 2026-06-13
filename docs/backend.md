# Módulo do Backend — GreenChain

O backend do GreenChain atua como o orquestrador seguro do ecossistema, processando a comunicação com as lixeiras inteligentes, autenticando sessões e intermediando interações com o banco de dados e a blockchain.

## Stack Tecnológica Utilizada

*   **Next.js Route Handlers (App Router):** Endpoints de API assíncronos (`/api/...`) que rodam no lado do servidor (Server-Side) para receber solicitações do frontend e de dispositivos externos.
*   **NextAuth.js:** Gerencia as sessões de autenticação dos usuários de forma segura através de tokens JWT (JSON Web Tokens).
*   **SIWE (Sign-In with Ethereum):** Protocolo criptográfico padrão para autenticar usuários diretamente através de suas carteiras Web3 (como MetaMask).
*   **Zod:** Biblioteca de validação de schemas que assegura a integridade de todas as cargas de dados recebidas de inputs do usuário ou de payloads das lixeiras.
*   **Prisma ORM:** Abstração e manipulação do banco de dados relacional com tipagem estática e suporte a migrações.
*   **Redis:** Armazenamento chave-valor de baixíssima latência na nuvem, utilizado para:
    *   Registrar os *nonces* temporários criados pelo SIWE (para evitar ataques de repetição).
    *   Armazenar e validar limites de chamadas (rate-limiting) para autenticação por OTP.
*   **Ethers.js:** Biblioteca criptográfica complementar que provê os algoritmos necessários para a validação de assinaturas SIWE.

## Fluxo de Autenticação e Segurança
Quando um usuário conecta sua carteira:
1. O frontend solicita um número aleatório de uso único (*nonce*) gerado pelo backend (armazenado no Redis).
2. O usuário assina uma mensagem padronizada contendo esse *nonce* usando sua chave privada da MetaMask.
3. O backend recebe a assinatura, valida a autenticidade usando a biblioteca `siwe` e inicia a sessão segura do `NextAuth.js`.
