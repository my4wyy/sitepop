document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("user").value;
    const password = document.getElementById("password").value;

    console.log("Tentando login com usuário:", username); // Log do usuário

    fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(response => {
        console.log("Resposta do servidor:", response); // Log da resposta do servidor
        if (response.ok) {
            return response.text();
        } else {
            throw new Error("Login failed: " + response.statusText);
        }
    })
    .then(token => {
        console.log("Token recebido:", token); // Log do token recebido
        localStorage.setItem("token", token);
        alert("Login successful!");
        window.location.href = "RF02.html";
    })
    .catch(error => {
        console.error("Erro ao fazer login:", error); // Log de erro
        alert(error.message);
    });
});
