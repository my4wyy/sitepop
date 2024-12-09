$(document).ready(function () {
    let editMode = false;
    let editId = null;
    let procedimentos = [];

    function carregarProcedimentos() {
        return fetch('https://dbpop-tkqc.onrender.com/procedimentos')
            .then(response => response.json())
            .then(data => {
                procedimentos = data;
                console.log("Procedimentos carregados:", procedimentos);
            })
            .catch(error => {
                console.error("Erro ao carregar os procedimentos:", error);
            });
    }

    carregarProcedimentos();
    fetchAllProntuarios();

    function fetchAllProntuarios() {
        fetch('https://dbpop-tkqc.onrender.com/prontuarios/get-all')
            .then(response => response.json())
            .then(data => {
                console.log("Prontuários carregados:", data);
                data.forEach(prontuario => {
                    console.log("Prontuário ID:", prontuario.id);
                    console.log("Nome do Cliente:", prontuario.nomeCliente);
                    console.log("Detalhes dos Procedimentos:", prontuario.detalhesProcedimentos);
                    prontuario.detalhesProcedimentos.forEach(detalhe => {
                        console.log("Detalhe do Procedimento:", detalhe);
                        console.log("Procedimento Nome:", detalhe.procedimento?.nomeProcedimento); // Verifique se procedimento e nomeProcedimento existem
                        console.log("Detalhes:", detalhe.detalhes); // Verifique se detalhes existe
                    });
                });
                displayProntuarios(data);
            })
            .catch(error => console.error("Erro ao carregar os prontuários:", error));
    }
    
    function displayProntuarios(prontuarios) {
        const recordsContainer = $('#recordsContainer');
        recordsContainer.empty();
    
        prontuarios.forEach((prontuario, index) => {
            console.log(`Exibindo prontuário ${index + 1}:`, prontuario); // Verifica se está iterando todos os prontuários
    
            const procedimentoNome = prontuario.detalhesProcedimentos?.[0]?.procedimento?.nomeProcedimento || 'Procedimento Indisponível';
            const detalhes = prontuario.detalhesProcedimentos?.[0]?.detalhes || 'Detalhes Indisponíveis';
    
            const prontuarioCard = `\
                <div class="col">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${prontuario.nomeCliente}</h5>
                            <p class="card-text">Procedimento: ${procedimentoNome}</p>
                            <p class="card-text">Detalhes: ${detalhes}</p>
                        </div>
                        <div class="card-footer text-center">
                            <button class="btn btn-secondary" onclick="editRecord(${prontuario.id})">Editar</button>
                            <button class="btn btn-danger" onclick="deleteRecord(${prontuario.id})">Excluir</button>
                        </div>
                    </div>
                </div>`;
    
            recordsContainer.append(prontuarioCard);
        });
    }

    function getProcedimentoIdByName(nomeProcedimento) {
        const normalizedProcedimento = nomeProcedimento.trim().toLowerCase();
        let procedimentoEncontrado = procedimentos.find(proc => proc.nomeProcedimento.trim().toLowerCase() === normalizedProcedimento);
        return procedimentoEncontrado ? procedimentoEncontrado.id : null;
    }

    $('#addRecordForm').on('submit', function (e) {
        e.preventDefault();

        const nomeCliente = $('#clientName').val().trim();
        const nomeProcedimento = $('#procedure').val().trim();
        const detalhesProcedimentos = $('#procedureDetails').val().trim();
        const procedimentoId = getProcedimentoIdByName(nomeProcedimento);

        if (!procedimentoId) {
            alert("Procedimento não encontrado!");
            return;
        }

        const prontuario = {
            id: editId,  // Adiciona o ID ao objeto para atualização
            nomeCliente,
            detalhesProcedimentos: [{ procedimentoId, detalhes: detalhesProcedimentos }]
        };

        const url = editMode ? `https://dbpop-tkqc.onrender.com/prontuarios/${editId}` : 'https://dbpop-tkqc.onrender.com/prontuarios';
        const method = editMode ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prontuario)
        })
        .then(response => {
            if (response.ok) {
                fetchAllProntuarios();
                $('#addRecordModal').modal('hide');
                editMode = false;
                editId = null;
                $('#addRecordForm')[0].reset();
            } else {
                alert("Erro ao salvar prontuário");
            }
        });
    });

    window.editRecord = function(id) {
        editMode = true;
        editId = id;

        fetch(`https://dbpop-tkqc.onrender.com/prontuarios/${id}`)
            .then(response => response.json())
            .then(data => {
                $('#clientName').val(data.nomeCliente);
                $('#procedure').val(data.detalhesProcedimentos[0]?.procedimento?.nomeProcedimento || '');
                $('#procedureDetails').val(data.detalhesProcedimentos.map(d => d.detalhes).join(", "));
                $('#addRecordModal').modal('show');
            });
    };

    window.deleteRecord = function(id) {
        if (confirm("Você tem certeza de que deseja excluir este prontuário?")) {
            fetch(`https://dbpop-tkqc.onrender.com/prontuarios/${id}`, {
                method: 'DELETE'
            }).then(response => {
                if (response.ok) {
                    fetchAllProntuarios();
                } else {
                    alert("Erro ao excluir prontuário");
                }
            });
        }
    };

    function searchProntuarios() {
        const query = $('#searchBar').val().trim();

        fetch(`https://dbpop-tkqc.onrender.com/prontuarios/search?nomeCliente=${query}`)
            .then(response => response.json())
            .then(data => {
                displayProntuarios(data);
            })
            .catch(error => console.error("Erro ao buscar prontuários:", error));
    }

    $('#searchIcon').click(searchProntuarios);
    $('#searchBar').on('keyup', searchProntuarios);
});
