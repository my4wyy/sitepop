document.addEventListener('DOMContentLoaded', function () {
    const clienteInput = document.getElementById('cliente');
    const dataInput = document.getElementById('data');
    const procedimentoSelect = document.getElementById('procedimento');
    const formConsulta = document.getElementById('form-consulta');

    // Função para restringir a entrada do nome do cliente
    function restrictInput(e) {
        const regex = /^[A-Za-zÀ-ÖØ-ÿ\s]*$/;
        if (!regex.test(e.target.value)) {
            e.target.value = e.target.value.replace(/[^A-Za-zÀ-ÖØ-ÿ\s]/g, '');
            console.log("Caractere inválido removido do nome do cliente.");
        }
    }

    // Função para validar o nome do cliente
    function validateNome(nome) {
        const regex = /^[A-Za-zÀ-ÖØ-ÿ\s]+$/;
        const isValid = regex.test(nome);
        console.log(`Validação do nome: ${isValid ? "válido" : "inválido"}`);
        return isValid;
    }

    // Função para definir a data mínima
    function setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        dataInput.setAttribute('min', today);
        console.log(`Data mínima definida: ${today}`);
    }

    // Função para carregar os procedimentos do backend e preencher a lista de seleção
    function loadProcedimentos() {
        console.log("Iniciando carregamento dos procedimentos...");
        fetch('https://dbpop-tkqc.onrender.com/procedimento')
            .then(response => response.json())
            .then(data => {
                console.log("Procedimentos recebidos:", data);

                // Limpa o campo de seleção
                procedimentoSelect.innerHTML = '<option value="" disabled selected>Selecione um procedimento</option>';

                // Preenche o campo de seleção com os procedimentos retornados
                data.forEach(procedimento => {
                    let option = document.createElement('option');
                    option.value = procedimento.id; // ID do procedimento
                    option.textContent = `${procedimento.nomeProcedimento} - R$ ${procedimento.preco.toFixed(2)}`;
                    procedimentoSelect.appendChild(option);
                });
                console.log("Procedimentos carregados com sucesso.");
            })
            .catch(error => {
                console.error('Erro ao carregar os procedimentos:', error);
            });
    }

    // Inicializações
    setMinDate();
    loadProcedimentos();
    clienteInput.addEventListener('input', restrictInput);

    // Validação do formulário e submissão
    formConsulta.addEventListener('submit', function (event) {
        const nomeCliente = clienteInput.value;
        const profissional = document.getElementById('profissional').value;
        const procedimento = procedimentoSelect.value;
        const dataConsulta = dataInput.value;
        const horaConsulta = document.getElementById('hora').value;

        // Verifica se o nome é válido
        if (!validateNome(nomeCliente)) {
            alert('Por favor, insira um nome válido (somente letras e espaços).');
            event.preventDefault();
            return;
        }

        console.log("Formulário enviado. Dados da consulta:");
        console.log({
            cliente: nomeCliente,
            profissional: profissional,
            procedimento: procedimento,
            data: dataConsulta,
            hora: horaConsulta
        });

        // Envia os dados para o backend
        event.preventDefault();  // Impede o envio real
        fetch('https://dbpop-tkqc.onrender.com/consultas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cliente: nomeCliente,
                profissional: profissional,
                procedimentoId: procedimento,
                data: dataConsulta,
                horario: horaConsulta
            })
        })
        .then(response => {
            console.log("Resposta do servidor recebida:", response);
            // Verifica se a resposta foi bem-sucedida
            if (response.ok) {
                return response.text(); // Usa text() em vez de json() para ver o conteúdo da resposta
            } else {
                throw new Error('Erro na resposta do servidor.');
            }
        })
        .then(result => {
            console.log('Resultado da resposta do servidor:', result);
            try {
                // Tenta converter o resultado para JSON
                const jsonResult = JSON.parse(result);
                console.log('Consulta agendada com sucesso:', jsonResult);
                alert('Consulta registrada.');
            } catch (error) {
                console.warn('A resposta não é JSON válida:', result);
                alert('Consulta registrada.');
            }
        })
        .catch(error => {
            console.error('Erro ao agendar a consulta:', error);
            alert('Erro ao registrar.');
        });

        // Chama a função para listar os agendamentos após o envio
        loadAgendamentos();
    });

    // Função para carregar os agendamentos após o envio
    function loadAgendamentos() {
        console.log("Carregando agendamentos...");
        fetch('https://dbpop-tkqc.onrender.com/consultas/get-all')
            .then(response => response.json())
            .then(agendamentos => {
                console.log("Agendamentos recebidos:", agendamentos);
            })
            .catch(error => {
                console.error('Erro ao carregar agendamentos:', error);
            });
    }
});
