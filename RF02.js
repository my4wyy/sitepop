$(document).ready(function () {

    console.log("Documento pronto.");

    // Aplicar máscara de moeda para o campo de preço
    $('#preco-procedimento').maskMoney({
        prefix: 'R$ ',
        allowNegative: false,
        thousands: '.',
        decimal: ',',
        affixesStay: true
    });

    console.log("Máscara de preço aplicada.");

    // Validação de horas e minutos
    $('#duracao-horas').on('input', function () {
        let value = parseInt($(this).val(), 10);
        console.log("Horas inseridas:", value);
        if (value > 24) {
            $(this).val(24);
        } else if (value < 0 || isNaN(value)) {
            $(this).val(0);
        }
    });

    $('#duracao-minutos').on('input', function () {
        let value = parseInt($(this).val(), 10);
        console.log("Minutos inseridos:", value);
        if (value > 59) {
            $(this).val(59);
        } else if (value < 0 || isNaN(value)) {
            $(this).val(0);
        }
    });

    function loadProcedimentos() {
        console.log("Carregando procedimentos...");
        fetch('https://dbpop-tkqc.onrender.com/procedimentos')
            .then(response => response.json())
            .then(data => {
                console.log("Procedimentos carregados:", data);
                $('#procedimentos').empty(); // Limpa a lista de procedimentos
                data.forEach(procedimento => {
                    // Remover possíveis objetos JSON antes da observação
                    let observacaoLimpa = procedimento.observacoes;
                    if (observacaoLimpa && observacaoLimpa.startsWith('{"observacoes":')) {
                        try {
                            observacaoLimpa = JSON.parse(observacaoLimpa).observacoes;
                        } catch (e) {
                            console.error('Erro ao parsear observação:', e);
                            observacaoLimpa = 'Formato inválido';
                        }
                    }
    
                    let procedimentoHtml = `
                        <div class="col-md-4 mb-4">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">${procedimento.nomeProcedimento || 'Nome não definido'}</h5>
                                    <p class="card-text">Duração: ${procedimento.duracaoHoras || 0} horas e ${procedimento.duracaoMinutos || 0} minutos</p>
                                    <p class="card-text">Preço: R$ ${procedimento.preco ? parseFloat(procedimento.preco).toFixed(2) : '0,00'}</p>
                                    <p class="card-text">Materiais: ${procedimento.materiaisNecessarios || 'Não especificado'}</p>
                                    <p class="card-text">Obs. do Administrador: ${observacaoLimpa || 'Não especificado'}</p>
                                    <button class="btn btn-secondary btn-editar" data-id="${procedimento.id}" data-bs-toggle="modal" data-bs-target="#modalProcedimento">Editar</button>
                                    <button class="btn btn-danger btn-deletar" data-id="${procedimento.id}" data-bs-toggle="modal" data-bs-target="#modalConfirmarDeletar">Deletar</button>
                                </div>
                            </div>
                        </div>`;
                    $('#procedimentos').append(procedimentoHtml);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar os procedimentos:', error);
            });
    }
    
    

    // Carregar procedimentos na inicialização
    loadProcedimentos();

    // Função para cadastrar ou atualizar um procedimento
    $('#modalProcedimento form').on('submit', function (e) {
        e.preventDefault();
        console.log("Formulário enviado.");

        let nome = $('#nome-procedimento').val();
        let duracaoHoras = $('#duracao-horas').val();
        let duracaoMinutos = $('#duracao-minutos').val();
        let preco = $('#preco-procedimento').val().replace('R$', '').trim().replace('.', '').replace(',', '.');
        let materiais = $('#materiais-procedimento').val();

        console.log("Dados do procedimento:", { nome, duracaoHoras, duracaoMinutos, preco, materiais });

        let procedimentoData = {
            nomeProcedimento: nome,
            duracaoHoras: duracaoHoras,
            duracaoMinutos: duracaoMinutos,
            preco: preco,
            materiaisNecessarios: materiais
        };

        let id = $(this).data('id');
        if (id) {
            console.log("Atualizando procedimento com ID:", id);
            // Atualizar procedimento (PUT)
            procedimentoData.id = id;
            fetch(`https://dbpop-tkqc.onrender.com/procedimentos/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(procedimentoData)
            }).then(() => {
                console.log("Procedimento atualizado com sucesso.");
                $('#modalProcedimento').modal('hide');
                loadProcedimentos();
            }).catch(error => {
                console.error('Erro ao atualizar o procedimento:', error);
            });
        } else {
            console.log("Criando novo procedimento.");
            // Criar novo procedimento (POST)
            fetch('https://dbpop-tkqc.onrender.com/procedimentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(procedimentoData)
            }).then(() => {
                console.log("Novo procedimento criado com sucesso.");
                $('#modalProcedimento').modal('hide');
                loadProcedimentos();
            }).catch(error => {
                console.error('Erro ao cadastrar o procedimento:', error);
            });
        }
    });

    // Função para carregar procedimento no modal para edição
    $('#procedimentos').on('click', '.btn-editar', function () {
        let id = $(this).data('id');
        console.log("Carregando procedimento para edição, ID:", id);
        fetch(`https://dbpop-tkqc.onrender.com/procedimentos/${id}`)
            .then(response => response.json())
            .then(data => {
                console.log("Dados carregados para edição:", data);
                $('#nome-procedimento').val(data.nomeProcedimento);
                $('#duracao-horas').val(data.duracaoHoras);
                $('#duracao-minutos').val(data.duracaoMinutos);
                $('#preco-procedimento').val('R$ ' + parseFloat(data.preco).toFixed(2));
                $('#materiais-procedimento').val(data.materiaisNecessarios);
                $('#modalProcedimento form').data('id', data.id); // Salvar o ID para edição
            })
            .catch(error => {
                console.error('Erro ao carregar o procedimento para edição:', error);
            });
    });

    // Limpar modal ao fechar
    $('#modalProcedimento').on('hidden.bs.modal', function () {
        console.log("Modal fechado, limpando formulário.");
        $('#modalProcedimento form')[0].reset();
        $('#modalProcedimento form').data('id', null);
    });

    // Definir ID para exclusão
    $('#procedimentos').on('click', '.btn-deletar', function () {
        let id = $(this).data('id');
        console.log("Exclusão solicitada, ID:", id);
        $('#confirmar-deletar').data('id', id);
    });

    // Excluir procedimento ao confirmar
    $('#confirmar-deletar').on('click', function () {
        let id = $(this).data('id');
        console.log("Confirmando exclusão para ID:", id);
        fetch(`https://dbpop-tkqc.onrender.com/procedimentos/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
        }).then(() => {
            console.log("Procedimento excluído com sucesso.");
            $('#modalConfirmarDeletar').modal('hide');
            loadProcedimentos();
        }).catch(error => {
            console.error('Erro ao deletar o procedimento:', error);
        });
    });

});
