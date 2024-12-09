document.addEventListener("DOMContentLoaded", function () {
    console.log("Página carregada, iniciando a função de carregar funcionários.");
    carregarFuncionarios();
});

function carregarFuncionarios() {
    fetch("https://dbpop-tkqc.onrender.com/users")
        .then(response => {
            console.log("Resposta recebida:", response);
            return response.json();
        })
        .then(funcionarios => {
            console.log("Funcionários recebidos:", funcionarios);
            const container = document.getElementById("funcionarios");
            container.innerHTML = "";
            if (Array.isArray(funcionarios)) {
                funcionarios.forEach(funcionario => {
                    console.log("Adicionando funcionário:", funcionario);
                    const card = `
                      <div class="col-md-3 mb-4">
                          <div class="card text-center">
                              <div class="card-body">
                                  <i class="fas fa-user fa-3x" style="color: rgba(221,98,26,1);"></i>
                                  <h5 class="card-title mt-3">${funcionario.username}</h5>
                                  <p class="card-text">Cargo: ${funcionario.role}</p>
                                  <button class="btn btn-secondary" onclick="editarFuncionario(${funcionario.id})">Editar</button>
                                  <button class="btn btn-danger" onclick="confirmarDeletar(${funcionario.id})">Deletar</button>
                              </div>
                          </div>
                      </div>`;
                    container.innerHTML += card;
                });
            } else {
                console.error("Erro: A resposta não é um array válido de funcionários.");
            }
        })
        .catch(error => {
            console.error("Erro ao carregar funcionários:", error);
        });
}
document.getElementById("employeeForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const id = document.getElementById("employeeId").value;
    const username = document.getElementById("employeeName").value;
    const role = document.getElementById("employeeRole").value;
    const password = document.getElementById("employeePassword").value;
    const user = { username, role, password };

    const url = id ? `https://dbpop-tkqc.onrender.com/users/${id}` : "https://dbpop-tkqc.onrender.com/users/register";
    const method = id ? "PUT" : "POST";

    console.log("Enviando requisição para:", url);
    
    // Substitua o trecho abaixo com o novo código sugerido
    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    })
        .then(response => {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return response.json();
            } else {
                return response.text();  // Se não for JSON, processa como texto
            }
        })
        .then(data => {
            console.log("Resposta da requisição:", data);
            alert(data.message || data || "Operação realizada com sucesso.");
            window.location.reload();  // Recarrega a página após sucesso
        })
        .catch(error => {
            console.error("Erro ao salvar ou atualizar funcionário:", error);
        });
});


function editarFuncionario(id) {
    console.log("Editando funcionário com ID:", id);
    fetch(`https://dbpop-tkqc.onrender.com/users/${id}`)
        .then(response => response.json())
        .then(funcionario => {
            console.log("Funcionário encontrado:", funcionario);
            document.getElementById("employeeId").value = funcionario.id;
            document.getElementById("employeeName").value = funcionario.username;
            document.getElementById("employeeRole").value = funcionario.role;
            document.getElementById("employeePassword").value = ""; // Deixe o campo de senha vazio para o usuário editar se necessário
            new bootstrap.Modal(document.getElementById("modalFuncionario")).show();
        })
        .catch(error => {
            console.error("Erro ao editar funcionário:", error);
        });
}

function confirmarDeletar(id) {
    // Confirmação antes de deletar
    if (confirm("Tem certeza que deseja deletar?")) {
        deletarFuncionario(id);
    }
}

function deletarFuncionario(id) {
    console.log("Deletando funcionário com ID:", id);
    fetch(`https://dbpop-tkqc.onrender.com/users/${id}`, {
        method: "DELETE"
    })
        .then(response => response.text())
        .then(data => {
            console.log("Resposta ao deletar funcionário:", data);
            alert(data || "Funcionário deletado com sucesso.");
            // Recarrega a página após a exclusão do usuário
            window.location.reload();
        })
        .catch(error => {
            console.error("Erro ao deletar funcionário:", error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    var modal = new bootstrap.Modal(document.getElementById('modalFuncionario'));
    var closeModalButton = document.querySelector('.btn-close');

    closeModalButton.addEventListener('click', function () {
        modal.hide();
    });
});
