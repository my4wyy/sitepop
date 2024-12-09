document.getElementById('gerarRelatorio').addEventListener('click', function() {
    const mesRelatorio = document.getElementById('mesRelatorio').value;
    const [ano, mes] = mesRelatorio.split('-');
    
    if (!mes || !ano) {
        alert('Por favor, selecione um mês e um ano.');
        return;
    }

    // Dados mock para teste
    const pagamentosMock = [
        { dataPagamento: '2024-11-14', descricao: 'Limpeza de Pele', tipo: 'Consulta', valor: 150.00 },
        { dataPagamento: '2024-11-14', descricao: 'Limpeza de Pele', tipo: 'Consulta', valor: 150.00 },
        { dataPagamento: '2024-12-03', descricao: 'Tratamento Capilar', tipo: 'Consulta', valor: 200.00 } // Novo procedimento em dezembro
    ];

    const pagamentosFiltrados = pagamentosMock.filter(pagamento => {
        const data = new Date(pagamento.dataPagamento);
        return data.getMonth() + 1 === parseInt(mes) && data.getFullYear() === parseInt(ano);
    });

    const tabelaRelatorio = document.getElementById('tabelaRelatorio');
    tabelaRelatorio.innerHTML = '';  // Limpa a tabela

    let faturamentoTotal = 0;

    pagamentosFiltrados.forEach(pagamento => {
        const data = new Date(pagamento.dataPagamento).toLocaleDateString('pt-BR');
        const descricao = pagamento.descricao || 'Procedimento';
        const tipo = pagamento.tipo || 'Serviço';
        const valor = pagamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        faturamentoTotal += pagamento.valor;

        const linha = `
            <tr>
                <td>${data}</td>
                <td>${descricao}</td>
                <td>${tipo}</td>
                <td>R$ ${valor}</td>
            </tr>
        `;
        tabelaRelatorio.insertAdjacentHTML('beforeend', linha);
    });

    const numeroProcedimentos = pagamentosFiltrados.length;
    const mediaFaturamento = numeroProcedimentos > 0 ? (faturamentoTotal / numeroProcedimentos).toFixed(2) : 0;

    const resumoRelatorio = document.getElementById('resumoRelatorio');
    
});
