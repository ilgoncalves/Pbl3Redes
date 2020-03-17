# MI - CONECTIVIDADE E CONCORÊNCIA - PROBLEMA 3
Solução para sincronia de relógios em redes em node.js. Usando P2P com STUN e o Algoritmo de Cristian para a sincronização
# INSTRUÇÕES
- Para rodar o código, primeiro você precisará de mais de uma máquina;
- Deverá rodar o STUN como o comando: node STUN.js
- Depois deverá alterar a constante *IP_STUN* em index.js e colocar o ip da máquina em que você rodou o STUN;
- Logo em seguida poderá rodar os relógios em outras máquinas;
- Para rodar os relógios deve rodar o comando: node index.js
- Pelo menos um rélogio deve ser o coordenador para ver a sincronização funcionando
- Para transformar um relógio em coordernador basta rodar o seguinte comando antes de instancia-lo: COORD=true node index.js
- Para mudar o intervalo de clock basta mudar a constante *CLOCK_INTERVAL* . Lembrando que o valor é mensurado em Milissegundo(ms)
# EM EXECUÇÃO :

- Para listar todos os peers conectados basta digitar o seguinte comando no terminal: listPeers
- Para adicionar um drift ao relógio basta digitar o seguinte comando no terminal: addDrift
