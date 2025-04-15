const TOTAL_FILAS = 10;
const TOTAL_COLUMNAS = 5;
const numerosGenerados = new Set();
let ganadoresRegistrados = [];
let bolsaNumeros = [];

// Genera la tabla de cartones
function generarTabla() {
  const cuerpo = document.getElementById('cuerpo-tabla');
  cuerpo.innerHTML = '';
  for (let i = 0; i < TOTAL_FILAS; i++) {
    const fila = document.createElement('tr');
    // Primera celda con el número de fila y segunda editable para nombre
    fila.innerHTML = `<td>${i + 1}</td><td contenteditable="true"></td>`;
    for (let j = 0; j < TOTAL_COLUMNAS; j++) {
      const valor = i + 1 + j * TOTAL_FILAS;
      fila.innerHTML += `<td class="celda" data-num="${valor}">${valor}</td>`;
    }
    cuerpo.appendChild(fila);
  }
}

// Algoritmo Fisher-Yates para mezclar el arreglo
function fisherYatesShuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Inicializa la bolsa de números
function inicializarBolsa() {
  bolsaNumeros = Array.from({ length: 50 }, (_, i) => i + 1);
  fisherYatesShuffle(bolsaNumeros);
}

// Genera los campos de premios dinámicamente según el número máximo de ganadores
function generarCamposPremios() {
  const contenedor = document.querySelector('.configuracion-content');
  const max = parseInt(document.getElementById("max-ganadores").value);
  // Remueve campos adicionales, dejando los dos primeros
  contenedor.querySelectorAll('label').forEach((label, index) => {
    if (index > 1) label.remove();
  });
  // Agrega campos de premio según el número máximo
  for (let i = 0; i < max; i++) {
    if (!document.getElementById(`premio${i}`)) {
      const label = document.createElement('label');
      label.innerHTML = `🎁 Premio #${i + 1}: <input type="text" id="premio${i}" value="${(i + 1) * 10} Bs" onchange="actualizarResumen()">`;
      contenedor.appendChild(label);
    }
  }
  actualizarResumen();
}

// Genera un número con efecto de animación
function generarNumero() {
  if (bolsaNumeros.length === 0) {
    alert("Ya se han generado todos los números.");
    return;
  }
  let intentos = 0;
  let animacion = setInterval(() => {
    const random = Math.floor(Math.random() * 50) + 1;
    document.getElementById("numero-generado").textContent = random;
    intentos++;
    if (intentos >= 20) {
      clearInterval(animacion);
      const num = bolsaNumeros.shift();
      numerosGenerados.add(num);
      document.getElementById("numero-generado").textContent = num;
      
      // Muestra los números generados
      const bolas = Array.from(numerosGenerados)
        .sort((a, b) => a - b)
        .map(n => `<span class="bola">${n}</span>`).join('');
      document.getElementById("numeros-generados").innerHTML = bolas;
      
      
      // Resalta el número en la tabla
      document.querySelectorAll('.celda').forEach(celda => {
        if (parseInt(celda.dataset.num) === num) {
          celda.classList.add('highlight');
        }
      });
      
      // Verifica si alguna fila es ganadora
      verificarGanador();
    }
  }, 100);
}

// Verifica si alguna fila tiene todas las celdas resaltadas
function verificarGanador() {
  const maxGanadores = parseInt(document.getElementById("max-ganadores").value);
  const filas = document.querySelectorAll('#cuerpo-tabla tr');
  const nuevosGanadores = [];
  filas.forEach((fila, index) => {
    const celdas = fila.querySelectorAll('.celda');
    const completadas = Array.from(celdas).every(celda => celda.classList.contains('highlight'));
    const yaGanador = ganadoresRegistrados.includes(index);
    if (completadas && !yaGanador && nuevosGanadores.length + ganadoresRegistrados.length < maxGanadores) {
      fila.classList.add('ganador');
      nuevosGanadores.push(index);
    }
  });
  if (nuevosGanadores.length > 0) {
    ganadoresRegistrados.push(...nuevosGanadores);
    const contenedorGanador = document.getElementById("ganador");
    contenedorGanador.innerHTML = ganadoresRegistrados.map((i, idx) => {
      const fila = document.querySelectorAll('#cuerpo-tabla tr')[i];
      const nombre = fila.children[1].textContent.trim() || `Fila ${i + 1}`;
      const premio = document.getElementById(`premio${idx}`)?.value || '---';
      return `<p>🎉 ¡BINGO: ${nombre} — Premio: ${premio}! 🎉</p>`;
    }).join('');
    contenedorGanador.classList.remove('animado');
    void contenedorGanador.offsetWidth;
    contenedorGanador.classList.add('animado');
  }
}

// Reinicia el juego
function reiniciarJuego() {
  numerosGenerados.clear();
  ganadoresRegistrados = [];
  document.getElementById("numero-generado").textContent = "-";
  document.getElementById("numeros-generados").innerHTML = "Ninguno aún.";
  document.getElementById("ganador").innerHTML = "";
  document.querySelectorAll('.celda').forEach(celda => celda.classList.remove('highlight'));
  document.querySelectorAll('tr').forEach(row => row.classList.remove('ganador'));
  inicializarBolsa();
  generarCamposPremios();
  actualizarResumen();
}

// Actualiza el resumen de la configuración en pantalla
function actualizarResumen() {
  const precio = document.getElementById("precio").value;
  const ganadores = document.getElementById("max-ganadores").value;
  const premios = [];
  for (let i = 0; i < ganadores; i++) {
    const p = document.getElementById(`premio${i}`);
    if (p) premios.push(p.value);
  }
  document.getElementById("config-preview").textContent =
    `🎫 Cartón: ${precio} Bs · 🏆 Máx. Ganadores: ${ganadores} · 🎁 Premios: ${premios.join(', ')}`;
}

// Alterna la visibilidad del menú de configuración
function toggleMenu() {
  const menu = document.getElementById('menuConfig');
  const boton = document.querySelector('.sidebar-toggle');
  menu.classList.toggle('open');
  boton.classList.toggle('hide');
}

// Muestra el modal de confirmación para reiniciar el juego
function confirmarReinicio() {
  const modal = document.getElementById('modal-confirm');
  modal.style.display = 'flex';
}

// Asigna los eventos de confirmación y cancelación del modal
document.getElementById('confirm-btn').addEventListener('click', () => {
  reiniciarJuego();
  document.getElementById('modal-confirm').style.display = 'none';
});
document.getElementById('cancel-btn').addEventListener('click', () => {
  document.getElementById('modal-confirm').style.display = 'none';
});

// Cierra el menú de configuración si se hace click fuera de él
document.addEventListener('click', function (e) {
  const menu = document.getElementById('menuConfig');
  const boton = document.querySelector('.sidebar-toggle');
  if (!menu.contains(e.target) && !boton.contains(e.target) && menu.classList.contains('open')) {
    menu.classList.remove('open');
    boton.classList.remove('hide');
  }
});

// Inicializa la aplicación al cargar la ventana
window.onload = () => {
  generarTabla();
  generarCamposPremios();
  inicializarBolsa();
  actualizarResumen();
};

// Advertencia al refrescar o cerrar la página
window.addEventListener('beforeunload', function (e) {
  // Aquí podrías agregar una condición para mostrar la advertencia solamente si es necesario.
  // Por ejemplo, si existe un estado "juego en curso" o datos no guardados.
  const advertir = true; // Cambia a una condición real según tu lógica

  if (advertir) {
    const mensaje = 'Si recargas o cierras la página, se perderán los cambios.';
    e.preventDefault();
    e.returnValue = mensaje;
    return mensaje;
  }
});
