$(document).ready(function () {
  console.log("Documento pronto.");

  let procedimentos = [];

  // Função para buscar todos os procedimentos e armazená-los
  function carregarProcedimentos() {
      return fetch('https://dbpop-tkqc.onrender.com/procedimentos')
          .then(response => response.json())
          .then(data => {
              procedimentos = data; // Armazenar todos os procedimentos
              console.log("Procedimentos carregados:", procedimentos);
          })
          .catch(error => {
              console.error("Erro ao carregar os procedimentos:", error);
          });
  }

  // Chamar a função para carregar os procedimentos ao iniciar a página
  carregarProcedimentos();

  // Função para encontrar o ID do procedimento pelo nome
  function getProcedimentoIdByName(nomeProcedimento) {
      const normalizedProcedimento = nomeProcedimento.trim().toLowerCase();

      if (procedimentos.length === 0) {
          console.error("Nenhum procedimento carregado.");
          return null;
      }

      let procedimentoEncontrado = procedimentos.find(proc => {
          if (proc && proc.nomeProcedimento) {
              return proc.nomeProcedimento.trim().toLowerCase() === normalizedProcedimento;
          } else {
              console.warn("Objeto de procedimento inválido:", proc);
              return false;
          }
      });

      if (procedimentoEncontrado) {
          return procedimentoEncontrado.id;
      } else {
          console.error("Procedimento não encontrado:", nomeProcedimento);
          return null;
      }
  }

  // Função para registrar o pagamento
  $('#paymentForm').on('submit', function (e) {
      e.preventDefault();
      console.log("Formulário de pagamento enviado.");

      let nomeCliente = $('#clientNamePayment').val().trim();
      let nomeProcedimento = $('#procedurePayment').val().trim();
      let valorPagamento = $('#paymentAmount').val().trim();
      let metodoPagamento = $('#paymentMethod').val().trim();

      let procedimentoId = getProcedimentoIdByName(nomeProcedimento);
      console.log("Nome do procedimento buscado:", nomeProcedimento);

      if (!procedimentoId) {
          alert("Procedimento não encontrado!");
          return;
      }

      let pagamento = {
          nomeCliente: nomeCliente,
          procedimentoId: procedimentoId,
          valor: valorPagamento,
          metodoPagamento: metodoPagamento
      };

      console.log("Dados do pagamento a ser enviado:", pagamento);

      fetch('https://dbpop-tkqc.onrender.com/pagamentos', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(pagamento)
      })
      .then(response => {
          if (response.ok) {
              return response.json().then(data => {
                  console.log("Pagamento registrado com sucesso:", data);
                  alert("Pagamento registrado com sucesso!");
              });
          } else {
              return response.json().then(err => {
                  console.error("Erro ao registrar o pagamento:", err);
                  alert(`Erro ao registrar o pagamento: ${err.message}`);
                  throw new Error(err.message);
              });
          }
      })
      .catch(error => {
          console.error("Erro ao registrar o pagamento:", error);
          alert("Erro ao registrar o pagamento!");
      });
  });
});
