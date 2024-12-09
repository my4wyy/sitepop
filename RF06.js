document.addEventListener("DOMContentLoaded", function() {
    const reportsTable = document.getElementById("reportsTable").getElementsByTagName('tbody')[0];
    
    console.log("Iniciando a busca de consultas...");

    fetch('https://dbpop-tkqc.onrender.com/consultas/get-all')
        .then(response => {
            console.log("Resposta recebida do servidor:", response);
            if (!response.ok) {
                console.error('Erro na resposta da rede:', response.statusText);
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log("Dados recebidos:", data);
            const today = new Date();
            console.log("Data atual:", today);

            const procedurePromises = data.map(consulta => {
                const consultaDate = new Date(consulta.data);
                console.log("Data da consulta:", consultaDate);

                if (consultaDate < today) {
                    console.log("Consulta é anterior a hoje:", consulta);
                    
                    return fetch(`https://dbpop-tkqc.onrender.com/procedimentos/${consulta.procedimento.id}`)
                        .then(procResponse => {
                            console.log("Resposta do procedimento:", procResponse);

                            if (!procResponse.ok) {
                                console.error('Erro na resposta do procedimento:', procResponse.statusText);
                                throw new Error('Network response was not ok: ' + procResponse.statusText);
                            }
                            return procResponse.json().then(procedimento => {
                                console.log("Procedimento obtido:", procedimento);
                                return {
                                    data: consulta.data,
                                    procedimentoNome: procedimento.nomeProcedimento,
                                    cliente: consulta.cliente,
                                    profissional: consulta.profissional,
                                    status: consulta.status,
                                    observacoes: consulta.observacoes // Inclua as observações aqui
                                };
                            });
                        });
                } else {
                    console.log("Consulta não é anterior a hoje, ignorando:", consulta);
                }
                return null;
            });

            return Promise.all(procedurePromises).then(results => {
                console.log("Resultados das promessas:", results);
                return results.filter(result => result !== null);
            });
        })
        .then(consultasFiltradas => {
            console.log("Consultas filtradas:", consultasFiltradas);
            consultasFiltradas.forEach(consulta => {
                const row = reportsTable.insertRow();
                const dateCell = row.insertCell(0);
                const procedimentoCell = row.insertCell(1);
                const clienteCell = row.insertCell(2);
                const profissionalCell = row.insertCell(3);
                const statusCell = row.insertCell(4);
                const observacoesCell = row.insertCell(5); // Nova célula para as observações

                dateCell.textContent = consulta.data;
                procedimentoCell.textContent = consulta.procedimentoNome;
                clienteCell.textContent = consulta.cliente;
                profissionalCell.textContent = consulta.profissional;
                statusCell.textContent = consulta.status;
                observacoesCell.textContent = consulta.observacoes || 'Sem observações'; // Exibe as observações ou um texto padrão
            });
        })
        .catch(error => console.error('Erro ao buscar dados:', error));
});
