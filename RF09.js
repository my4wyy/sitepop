
    document.getElementById('gerarRelatorio').addEventListener('click', function() {
        const mesRelatorio = document.getElementById('mesRelatorio').value;
        const [ano, mes] = mesRelatorio.split('-');
        
        // Verifica se o mês e o ano foram selecionados
        if (!mes || !ano) {
            alert('Por favor, selecione um mês e um ano.');
            return;
        }

        fetch('http://localhost:8080/pagamentos') // Endpoint para listar todos os pagamentos
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar os pagamentos.');
                }
                return response.json();
            })
            .then(pagamentos => {
                // Filtra os pagamentos pelo mês e ano selecionados
                const pagamentosFiltrados = pagamentos.filter(pagamento => {
                    const data = new Date(pagamento.dataPagamento); // Certifique-se de que `dataPagamento` existe e está no formato correto
                    return data.getMonth() + 1 === parseInt(mes) && data.getFullYear() === parseInt(ano);
                });

                // Calcula os valores do relatório
                const faturamentoTotal = pagamentosFiltrados.reduce((total, pagamento) => total + pagamento.valor, 0);
                const numeroProcedimentos = pagamentosFiltrados.length;
                const mediaFaturamento = numeroProcedimentos > 0 ? (faturamentoTotal / numeroProcedimentos).toFixed(2) : 0;

                // Exibe o relatório financeiro
                const relatorioDiv = document.getElementById('relatorioFinanceiro');
                relatorioDiv.innerHTML = `
                    <h3>Relatório de Faturamento - ${mes}/${ano}</h3>
                    <p>Faturamento total: R$ ${faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p>Número de procedimentos realizados: ${numeroProcedimentos}</p>
                    <p>Média de faturamento por procedimento: R$ ${mediaFaturamento}</p>
                `;
            })
            .catch(error => {
                console.error(error);
                alert('Erro ao gerar o relatório financeiro.');
            });
    });

