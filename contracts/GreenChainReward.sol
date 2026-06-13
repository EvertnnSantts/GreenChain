// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GreenChainReward
 * @dev Contrato de distribuição de recompensas para reciclagem na rede CELO.
 * Permite que a empresa gestora (Owner) autorize lixeiras inteligentes (Operators) 
 * a enviarem recompensas diretamente aos usuários em tokens CELO (moeda nativa).
 */
contract GreenChainReward {
    
    // Endereço do administrador do contrato (empresa gestora)
    address public owner;
    
    // Mapeamento de lixeiras inteligentes ou servidores autorizados (operadores)
    mapping(address => bool) public authorizedOperators;
    
    // Evento disparado quando um descarte é recompensado
    event RecycledReward(
        address indexed user,
        uint256 amount,
        string material,
        uint256 weightGrams,
        uint256 timestamp
    );
    
    // Evento disparado quando um operador é adicionado ou removido
    event OperatorStatusChanged(address indexed operator, bool authorized);
    
    // Modificador para garantir que apenas o proprietário chame a função
    modifier onlyOwner() {
        require(msg.sender == owner, "Apenas o proprietario pode executar esta funcao");
        _;
    }
    
    // Modificador para garantir que apenas operadores autorizados ou o proprietário chamem a função
    modifier onlyOperator() {
        require(authorizedOperators[msg.sender] || msg.sender == owner, "Operador nao autorizado");
        _;
    }
    
    /**
     * @dev Construtor define o criador do contrato como proprietário e primeiro operador.
     */
    constructor() {
        owner = msg.sender;
        authorizedOperators[msg.sender] = true;
        emit OperatorStatusChanged(msg.sender, true);
    }
    
    /**
     * @dev Permite ao proprietário autorizar ou desautorizar uma lixeira inteligente / operador.
     * @param _operator Endereço da lixeira ou do servidor backend.
     * @param _status True para autorizar, False para desautorizar.
     */
    function setOperator(address _operator, bool _status) external onlyOwner {
        require(_operator != address(0), "Endereco invalido");
        authorizedOperators[_operator] = _status;
        emit OperatorStatusChanged(_operator, _status);
    }
    
    /**
     * @dev Envia a recompensa em CELO diretamente para o usuário reciclador.
     * Chamado pela lixeira inteligente (Operator) após pesar e validar os materiais.
     * @param _user Endereço da carteira do usuário.
     * @param _amount Valor em Wei de CELO a ser enviado (ex: 1 CELO = 10^18 Wei).
     * @param _material Tipo do material descartado (ex: "plastico", "vidro").
     * @param _weightGrams Peso em gramas do material descartado.
     */
    function rewardUser(
        address payable _user, 
        uint256 _amount, 
        string calldata _material, 
        uint256 _weightGrams
    ) external onlyOperator {
        require(_user != address(0), "Nao e possivel recompensar o endereco zero");
        require(_amount > 0, "O valor da recompensa deve ser maior que zero");
        require(address(this).balance >= _amount, "Saldo do contrato insuficiente para a recompensa");
        
        // Envia o CELO para o usuário usando a chamada de baixo nível segura
        (bool success, ) = _user.call{value: _amount}("");
        require(success, "Falha ao enviar CELO para o usuario");
        
        emit RecycledReward(_user, _amount, _material, _weightGrams, block.timestamp);
    }
    
    /**
     * @dev Função para receber depósitos de CELO diretamente no contrato.
     * Permite que a empresa gestora abasteça o saldo de recompensas do contrato.
     */
    receive() external payable {}
    
    /**
     * @dev Permite ao proprietário retirar fundos do contrato se necessário (resgate/emergência).
     * @param _amount Quantidade em Wei de CELO para retirar.
     */
    function withdraw(uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Saldo insuficiente para saque");
        payable(owner).transfer(_amount);
    }
    
    /**
     * @dev Retorna o saldo total de CELO depositado neste contrato de recompensas.
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Transfere a propriedade do contrato para um novo endereço.
     * @param _newOwner Endereço do novo proprietário.
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Novo proprietario nao pode ser o endereco zero");
        owner = _newOwner;
    }
}
