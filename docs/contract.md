# Módulo do Contrato Inteligente — GreenChain

Este módulo detalha a arquitetura de execução do contrato inteligente do GreenChain na blockchain, explicando sua lógica operacional sem exibir o código fonte, com o objetivo de validar a viabilidade do protótipo.

## Stack Tecnológica Utilizada

*   **Solidity v0.8.20:** Linguagem utilizada para desenvolver a lógica de execução e segurança na EVM.
*   **Rede Celo (Alfajores Testnet / Mainnet):** Blockchain focada em mobilidade e finanças regenerativas (ReFi). Escolhida pela compatibilidade completa com a EVM (Ethereum Virtual Machine), confirmações rápidas (cerca de 5 segundos) e taxas de transação extremamente baratas.

---

## Lógica de Funcionamento do Contrato

Abaixo está o detalhamento conceitual de como o contrato opera, gerencia acessos e distribui bônus.

### 1. Papéis de Acesso (Controle de Permissão)
O contrato opera em um modelo de permissão em duas camadas:
*   **Owner (Proprietário):** É a entidade centralizadora (a empresa gestora do GreenChain). É a única conta autorizada a cadastrar ou remover os endereços das lixeiras inteligentes, e possui o poder de retirar os fundos depositados no contrato em caso de migração ou encerramento do sistema.
*   **Operator (Operador/Lixeira):** São endereços autorizados a enviar comandos de pagamento para os usuários. Representam os hardwares físicos das lixeiras instaladas ou servidores backend seguros que intermedeiam a pesagem.

### 2. Fluxo Operacional (Passo a Passo)

1.  **Carregamento de Saldo:**
    O contrato inteligente atua como uma "banca pagadora". Para pagar os usuários, ele precisa ter fundos. O Owner deposita moedas nativas (CELO) no contrato. Esse saldo fica reservado e bloqueado exclusivamente para o pagamento das recompensas.
2.  **Medição e Pesagem (Off-chain):**
    O usuário vai até a lixeira inteligente física, escaneia seu QR Code no leitor da máquina para se identificar, e insere os materiais recicláveis. O hardware da lixeira calcula o peso e detecta o tipo de material (plástico, metal, vidro ou papel).
3.  **Processamento da Recompensa:**
    O operador (lixeira ou servidor backend) calcula o valor em moedas CELO equivalente àquele descarte com base nas tabelas estabelecidas e aciona a função de pagamento do contrato na rede Celo, informando:
    *   O endereço de destino do usuário.
    *   O valor total da recompensa.
    *   O tipo do material descartado.
    *   O peso do descarte (em gramas).
4.  **Validação Automática (On-chain):**
    O contrato inteligente processa as seguintes validações lógicas na blockchain:
    *   *Quem está pedindo o pagamento é um operador cadastrado e autorizado?* (Impede que hackers ou usuários comuns invoquem a liberação de moedas para si mesmos).
    *   *O endereço do usuário é válido e o valor da recompensa é maior que zero?* (Evita desperdício ou travamentos de fundos).
    *   *O contrato possui saldo em moedas CELO depositadas para cobrir este envio?* (Garante que a transação não falhe a meio caminho).
5.  **Execução do Pagamento:**
    Caso as validações passem, o contrato deduz a quantia correspondente do seu caixa interno e realiza a transferência instantânea de moedas CELO para a carteira criptográfica do cidadão.
6.  **Emissão de Recibo Digital (Logs):**
    No exato momento da transferência, o contrato grava um log público e imutável de transação contendo quem recebeu, quanto ganhou, o peso, o tipo de material e a data/hora. Esse recibo é lido pelo frontend do GreenChain para atualizar as telas do cidadão em tempo real.
7.  **Manutenção e Saque:**
    Se necessário, o proprietário (Owner) pode sacar as moedas de volta para sua própria carteira criptográfica ou transferir a posse administrativa completa do contrato para um novo endereço corporativo.
