document.addEventListener("DOMContentLoaded", function () {
    const calendarDays = document.querySelector('.days');
    const monthLabel = document.querySelector('.month .date');
    const todayBtn = document.querySelector('.today-btn');
    const eventsDiv = document.querySelector('.events');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let selectedDayElement = null;
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
  
    // Função fetchConsultas no escopo global
    window.fetchConsultas = function(date) {
      console.log("fetchConsultas chamada com a data:", date);
      fetch(`https://dbpop-tkqc.onrender.com/consultas/data/${date}`)
          .then(response => {
              console.log("Resposta recebida de fetchConsultas:", response);
              return response.json();
          })
          .then(data => {
              console.log("Dados de consulta recebidos:", data);
              data.sort((a, b) => a.horario.localeCompare(b.horario));
              showConsultasDetails(data);
          })
          .catch(error => console.error('Erro ao buscar consultas:', error));
    }
  
    function updateCalendar(month, year) {
        console.log("Atualizando calendário para o mês:", month, "e ano:", year);
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
  
        calendarDays.innerHTML = '';
  
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const day = new Date(year, month, i);
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.innerText = i;
            dayElement.dataset.date = day.toISOString().split('T')[0];
  
            dayElement.addEventListener('click', () => {
                console.log("Dia clicado:", dayElement.dataset.date);
                highlightDay(dayElement);
                fetchConsultas(dayElement.dataset.date);
            });
  
            calendarDays.appendChild(dayElement);
        }
  
        monthLabel.innerText = `${firstDayOfMonth.toLocaleString('default', { month: 'long' })} ${year}`;
    }
  
    function showConsultasDetails(consultas) {
        console.log("Exibindo detalhes das consultas:", consultas);
        eventsDiv.innerHTML = '';
  
        if (consultas.length > 0) {
            consultas.forEach(consulta => {
                const consultaCard = document.createElement('div');
                consultaCard.classList.add('consulta-card');
  
                consultaCard.innerHTML = `
                    <div class="consulta-body">
                        <h3>${formatarHorario(consulta.horario)}</h3>
                        <p><strong>Cliente:</strong> ${consulta.cliente}</p>
                        <p><strong>Profissional:</strong> ${consulta.profissional}</p>
                        <p><strong>Procedimento:</strong> ${consulta.procedimento.nomeProcedimento}</p>
                        <p>${consulta.status}</p>
                        <button class="btn-alterar-status" onclick="alterarStatusConsulta(${consulta.id})">Alterar Status</button>
                    </div>
                `;
  
                eventsDiv.appendChild(consultaCard);
            });
        } else {
            console.log("Nenhuma consulta encontrada para esta data.");
            eventsDiv.innerHTML = '<p>Não há consultas para esta data.</p>';
        }
    }
  
    function formatarHorario(horario) {
        const [hora, minutos] = horario.split(':');
        return `${hora}:${minutos}`;
    }
  
    function highlightDay(dayElement) {
        if (selectedDayElement) {
            selectedDayElement.classList.remove('selected');
        }
        dayElement.classList.add('selected');
        selectedDayElement = dayElement;
        console.log("Dia destacado:", dayElement.dataset.date);
    }
  
    todayBtn.addEventListener('click', () => {
        const today = new Date();
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        updateCalendar(currentMonth, currentYear);
  
        const todayDate = today.toISOString().split('T')[0];
        console.log("Botão hoje clicado, data:", todayDate);
        fetchConsultas(todayDate);
  
        const todayElement = document.querySelector(`.day[data-date='${todayDate}']`);
        if (todayElement) {
            highlightDay(todayElement);
        }
    });
  
    prevBtn.addEventListener('click', () => {
        console.log("Botão anterior clicado.");
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        updateCalendar(currentMonth, currentYear);
    });
  
    nextBtn.addEventListener('click', () => {
        console.log("Botão próximo clicado.");
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        updateCalendar(currentMonth, currentYear);
    });
  
    updateCalendar(currentMonth, currentYear);
  });
  
  function alterarStatusConsulta(consultaId) {
      console.log("Função alterarStatusConsulta chamada para consultaId:", consultaId);
      const novoStatus = prompt("Digite o novo status: REALIZADA, PENDENTE, CANCELADA, REMARCADA");
      if (novoStatus) {
          console.log("Status a ser atualizado para:", novoStatus);
          fetch(`https://dbpop-tkqc.onrender.com/consultas/update-status/${consultaId}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id: consultaId, status: novoStatus })
          })
          .then(response => {
              console.log("Resposta recebida de alterarStatusConsulta:", response);
              if (!response.ok) throw new Error('Erro ao atualizar o status');
              return response.json();
          })
          .then(data => {
              console.log("Status atualizado com sucesso:", data);
              alert('Status atualizado com sucesso!');
              const selectedDate = document.querySelector('.selected').dataset.date;
              console.log("Atualizando consultas para a data selecionada:", selectedDate);
              fetchConsultas(selectedDate);
          })
          .catch(error => console.error('Erro ao atualizar o status:', error));
      }
  }
  