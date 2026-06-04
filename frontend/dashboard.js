const api = "http://localhost:3000/api";

function mostrarSecao(secao) {
  document.querySelectorAll(".secao").forEach(s => s.classList.add("hidden"));
  document.getElementById(secao).classList.remove("hidden");
}

async function carregarDashboard() {
  let r1 = await fetch(api + "/relatorios/participantes");
  let r2 = await fetch(api + "/relatorios/media-categoria");
  let r3 = await fetch(api + "/relatorios/engajados");

  let d1 = await r1.json();
  let d2 = await r2.json();
  let d3 = await r3.json();

  let elementoCard1 = document.getElementById("card1");
  elementoCard1.innerHTML = "<h3 class='font-bold text-lg mb-2'>Inscritos por Evento</h3>";
  d1.forEach(item => {
    elementoCard1.innerHTML += `<p class='text-sm text-gray-700'>${item.detalhes?.titulo || 'Evento'}: <strong>${item.totalInscritos}</strong></p>`;
  });

  let elementoCard2 = document.getElementById("card2");
  elementoCard2.innerHTML = "<h3 class='font-bold text-lg mb-2'>Média por Categoria</h3>";
  d2.forEach(item => {
    elementoCard2.innerHTML += `<p class='text-sm text-gray-700'>${item.categoriaDados?.nome || 'Categoria'}: <strong>${item.mediaNota.toFixed(1)} ⭐</strong></p>`;
  });

  let elementoCard3 = document.getElementById("card3");
  elementoCard3.innerHTML = "<h3 class='font-bold text-lg mb-2'>Mais Engajados</h3>";
  d3.forEach(item => {
    elementoCard3.innerHTML += `<p class='text-sm text-gray-700'>${item.eventoDados?.titulo || 'Evento'}: <strong>${item.totalComentarios} coment.</strong></p>`;
  });
}

async function criarUsuario() {
  let nome = document.getElementById("nomeUsuario").value;
  await fetch(api + "/usuarios", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ nome })
  });
  document.getElementById("nomeUsuario").value = "";
  listarUsuarios();
}

async function excluirUsuario(id) {
  await fetch(`${api}/usuarios/${id}`, { method: "DELETE" });
  listarUsuarios();
}

async function listarUsuarios() {
  let res = await fetch(api + "/usuarios");
  let dados = await res.json();
  let lista = document.getElementById("listaUsuarios");
  lista.innerHTML = "";
  dados.forEach(u => {
    let li = document.createElement("li");
    li.className = "flex justify-between items-center bg-white p-2 my-2 shadow rounded text-sm";
    li.innerHTML = `
      <span>${u.nome}</span>
      <button onclick="excluirUsuario('${u._id}')" class="bg-red-600 text-white px-2 py-1 text-xs rounded mt-0">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

async function criarEvento() {
  let titulo = document.getElementById("tituloEvento").value;
  await fetch(api + "/eventos", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ titulo })
  });
  document.getElementById("tituloEvento").value = "";
  listarEventos();
}

async function excluirEvento(id) {
  await fetch(`${api}/eventos/${id}`, { method: "DELETE" });
  listarEventos();
}

async function listarEventos() {
  let res = await fetch(api + "/eventos");
  let dados = await res.json();
  let lista = document.getElementById("listaEventos");
  lista.innerHTML = "";
  dados.forEach(e => {
    let li = document.createElement("li");
    li.className = "flex justify-between items-center bg-white p-2 my-2 shadow rounded text-sm";
    li.innerHTML = `
      <span>${e.titulo}</span>
      <button onclick="excluirEvento('${e._id}')" class="bg-red-600 text-white px-2 py-1 text-xs rounded mt-0">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

async function criarCategoria() {
  let nome = document.getElementById("nomeCategoria").value;
  await fetch(api + "/categorias", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ nome })
  });
  document.getElementById("nomeCategoria").value = "";
  listarCategorias();
}

async function excluirCategoria(id) {
  await fetch(`${api}/categorias/${id}`, { method: "DELETE" });
  listarCategorias();
}

async function listarCategorias() {
  let res = await fetch(api + "/categorias");
  let dados = await res.json();
  let lista = document.getElementById("listaCategorias");
  lista.innerHTML = "";
  dados.forEach(c => {
    let li = document.createElement("li");
    li.className = "flex justify-between items-center bg-white p-2 my-2 shadow rounded text-sm";
    li.innerHTML = `
      <span>${c.nome}</span>
      <button onclick="excluirCategoria('${c._id}')" class="bg-red-600 text-white px-2 py-1 text-xs rounded mt-0">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

async function criarLocal() {
  let nome = document.getElementById("nomeLocal").value;
  let cidade = document.getElementById("cidadeLocal").value;
  await fetch(api + "/locais", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      nome,
      endereco: { cidade }
    })
  });
  document.getElementById("nomeLocal").value = "";
  document.getElementById("cidadeLocal").value = "";
  listarLocais();
}

async function excluirLocal(id) {
  await fetch(`${api}/locais/${id}`, { method: "DELETE" });
  listarLocais();
}

async function listarLocais() {
  let res = await fetch(api + "/locais");
  let dados = await res.json();
  let lista = document.getElementById("listaLocais");
  lista.innerHTML = "";
  dados.forEach(l => {
    let li = document.createElement("li");
    li.className = "flex justify-between items-center bg-white p-2 my-2 shadow rounded text-sm";
    li.innerHTML = `
      <span>${l.nome} - ${l.endereco?.cidade || ''}</span>
      <button onclick="excluirLocal('${l._id}')" class="bg-red-600 text-white px-2 py-1 text-xs rounded mt-0">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

async function buscarPorCategoria() {
  let id = document.getElementById("categoriaId").value;
  let res = await fetch(api + "/consultas/categoria/" + id);
  mostrarResultado(await res.json());
}

async function buscarProximos() {
  let res = await fetch(api + "/consultas/proximos");
  mostrarResultado(await res.json());
}

async function buscarGrandes() {
  let res = await fetch(api + "/consultas/ativos-grandes");
  mostrarResultado(await res.json());
}

async function buscarCidade() {
  let cidade = document.getElementById("cidadeBusca").value;
  let res = await fetch(api + "/consultas/cidade/" + cidade);
  mostrarResultado(await res.json());
}

async function buscarTexto() {
  let texto = document.getElementById("buscaTexto").value;
  let res = await fetch(api + "/consultas/buscar?busca=" + texto);
  mostrarResultado(await res.json());
}

function mostrarResultado(dados) {
  let lista = document.getElementById("resultadoConsultas");
  lista.innerHTML = "";
  if (dados.length === 0) {
    lista.innerHTML = "<li class='text-sm text-gray-500 bg-white p-2 shadow rounded'>Nenhum resultado encontrado</li>";
    return;
  }
  dados.forEach(d => {
    let li = document.createElement("li");
    li.className = "bg-white p-2 my-2 shadow rounded text-sm text-gray-700 break-words";
    li.innerText = d.titulo || d.nome || JSON.stringify(d);
    lista.appendChild(li);
  });
}

carregarDashboard();
listarUsuarios();
listarEventos();
listarCategorias();
listarLocais();