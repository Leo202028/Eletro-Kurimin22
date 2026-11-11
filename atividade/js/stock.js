/**
 * ============================================================================
 * Eletro Kurumin - Sistema de Controlo de Stock de Componentes Eletrónicos
 * Ficheiro: stock.js
 * Descrição: Lógica da página principal (CRUD, pesquisa, filtros e estatísticas)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Verifica autenticação (guarda de rota)
  Auth.protegerPagina();
  Auth.configurarInterface();

  // 2. Elementos do DOM
  const tabelaCorpo = document.getElementById('stock-table-body');
  const emptyState = document.getElementById('empty-state');
  const inputPesquisa = document.getElementById('input-pesquisa');
  const selectCategoriaFiltro = document.getElementById('filtro-categoria');
  const selectStockFiltro = document.getElementById('filtro-stock');

  // Elementos dos KPIs / Estatísticas
  const statTotalRef = document.getElementById('stat-total-ref');
  const statTotalPecas = document.getElementById('stat-total-pecas');
  const statValorTotal = document.getElementById('stat-valor-total');
  const statStockBaixo = document.getElementById('stat-stock-baixo');

  // Modal de Adicionar/Editar
  const modalComponente = document.getElementById('modal-componente');
  const modalTitulo = document.getElementById('modal-titulo');
  const formComponente = document.getElementById('form-componente');
  const btnAbrirAdicionar = document.getElementById('btn-novo-componente');
  const btnFecharModal = document.getElementById('btn-fechar-modal');
  const btnCancelarModal = document.getElementById('btn-cancelar-modal');

  // Campos do formulário
  const inputId = document.getElementById('comp-id');
  const inputCodigo = document.getElementById('comp-codigo');
  const inputNome = document.getElementById('comp-nome');
  const selectCategoria = document.getElementById('comp-categoria');
  const inputQuantidade = document.getElementById('comp-quantidade');
  const inputPreco = document.getElementById('comp-preco');
  const inputLocalizacao = document.getElementById('comp-localizacao');
  const textareaDescricao = document.getElementById('comp-descricao');

  // Modal de Confirmação de Eliminação
  const modalEliminar = document.getElementById('modal-eliminar');
  const eliminarNome = document.getElementById('eliminar-comp-nome');
  const eliminarCodigo = document.getElementById('eliminar-comp-codigo');
  const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
  const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
  const btnFecharModalEliminar = document.getElementById('btn-fechar-modal-eliminar');

  // Variável para armazenar o ID do item a eliminar
  let idParaEliminar = null;

  // Limite para aviso de stock baixo
  const LIMITE_STOCK_BAIXO = 15;

  /**
   * Apresenta uma notificação temporária (Toast) ao utilizador.
   */
  function mostrarToast(mensagem, tipo = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensagem;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /**
   * Atualiza os cartões de indicadores (KPIs).
   */
  function atualizarEstatisticas(componentes) {
    const totalRef = componentes.length;
    const totalPecas = componentes.reduce((acc, c) => acc + c.quantidade, 0);
    const valorTotal = componentes.reduce((acc, c) => acc + (c.quantidade * c.preco), 0);
    const qtdStockBaixo = componentes.filter(c => c.quantidade <= LIMITE_STOCK_BAIXO).length;

    if (statTotalRef) statTotalRef.textContent = Storage.formatarInteiro(totalRef);
    if (statTotalPecas) statTotalPecas.textContent = Storage.formatarInteiro(totalPecas);
    if (statValorTotal) statValorTotal.textContent = Storage.formatarMoeda(valorTotal);
    if (statStockBaixo) statStockBaixo.textContent = Storage.formatarInteiro(qtdStockBaixo);
  }

  /**
   * Preenche a lista de categorias disponíveis no seletor de filtros.
   */
  function carregarCategoriasFiltro(componentes) {
    if (!selectCategoriaFiltro) return;
    const valorAtual = selectCategoriaFiltro.value;
    const categorias = [...new Set(componentes.map(c => c.categoria))].sort();

    selectCategoriaFiltro.innerHTML = '<option value="">Todas as Categorias</option>';
    categorias.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      if (cat === valorAtual) opt.selected = true;
      selectCategoriaFiltro.appendChild(opt);
    });
  }

  /**
   * Renderiza a tabela de componentes aplicando filtros de pesquisa e categoria.
   */
  function renderizarTabela() {
    const todos = Storage.obterTodos();
    atualizarEstatisticas(todos);
    carregarCategoriasFiltro(todos);

    const termo = (inputPesquisa ? inputPesquisa.value.trim().toLowerCase() : '');
    const catFiltro = (selectCategoriaFiltro ? selectCategoriaFiltro.value : '');
    const statusFiltro = (selectStockFiltro ? selectStockFiltro.value : '');

    // Aplica os filtros
    const filtrados = todos.filter(c => {
      const correspondeTermo = !termo || 
        c.nome.toLowerCase().includes(termo) || 
        c.codigo.toLowerCase().includes(termo) ||
        c.localizacao.toLowerCase().includes(termo);

      const correspondeCat = !catFiltro || c.categoria === catFiltro;

      let correspondeStatus = true;
      if (statusFiltro === 'baixo') {
        correspondeStatus = c.quantidade <= LIMITE_STOCK_BAIXO;
      } else if (statusFiltro === 'normal') {
        correspondeStatus = c.quantidade > LIMITE_STOCK_BAIXO;
      }

      return correspondeTermo && correspondeCat && correspondeStatus;
    });

    tabelaCorpo.innerHTML = '';

    if (filtrados.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    filtrados.forEach(c => {
      const subtotal = c.quantidade * c.preco;
      const tr = document.createElement('tr');

      // Emblema de stock (normal, baixo ou esgotado)
      let stockBadgeClass = 'normal';
      let stockBadgeText = 'Normal';
      if (c.quantidade === 0) {
        stockBadgeClass = 'empty';
        stockBadgeText = 'Esgotado';
      } else if (c.quantidade <= LIMITE_STOCK_BAIXO) {
        stockBadgeClass = 'low';
        stockBadgeText = 'Baixo';
      }

      tr.innerHTML = `
        <td>
          <span class="code-badge">${escapeHtml(c.codigo)}</span>
        </td>
        <td>
          <strong>${escapeHtml(c.nome)}</strong>
          ${c.descricao ? `<div class="form-hint">${escapeHtml(c.descricao)}</div>` : ''}
        </td>
        <td>
          <span class="category-tag">${escapeHtml(c.categoria)}</span>
        </td>
        <td>
          <span class="stock-badge ${stockBadgeClass}">
            ${Storage.formatarInteiro(c.quantidade)} un. (${stockBadgeText})
          </span>
        </td>
        <td class="price-cell">${Storage.formatarMoeda(c.preco)}</td>
        <td class="total-cell">${Storage.formatarMoeda(subtotal)}</td>
        <td>
          <span class="location-cell">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${escapeHtml(c.localizacao)}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-secondary btn-sm btn-editar" data-id="${c.id}" title="Editar componente">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Editar
            </button>
            <button class="btn btn-danger btn-sm btn-eliminar" data-id="${c.id}" title="Eliminar componente">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Eliminar
            </button>
          </div>
        </td>
      `;

      tabelaCorpo.appendChild(tr);
    });

    // Associa eventos aos botões de ação gerados dinamicamente
    configurarAcoesTabela();
  }

  /**
   * Associa os eventos aos botões de editar e eliminar nas linhas da tabela.
   */
  function configurarAcoesTabela() {
    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        abrirModalEditar(id);
      });
    });

    document.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        abrirModalEliminar(id);
      });
    });
  }

  /**
   * Abre o modal para registar um novo componente.
   */
  function abrirModalNovo() {
    formComponente.reset();
    inputId.value = '';
    modalTitulo.textContent = 'Registar Novo Componente';
    limparErrosValidacao();
    modalComponente.classList.add('active');
    inputCodigo.focus();
  }

  /**
   * Abre o modal pré-preenchido para editar um componente existente.
   */
  function abrirModalEditar(id) {
    const componente = Storage.obterPorId(id);
    if (!componente) {
      mostrarToast('Componente não encontrado.', 'danger');
      return;
    }

    formComponente.reset();
    limparErrosValidacao();

    inputId.value = componente.id;
    inputCodigo.value = componente.codigo;
    inputNome.value = componente.nome;
    selectCategoria.value = componente.categoria;
    inputQuantidade.value = componente.quantidade;
    inputPreco.value = componente.preco;
    inputLocalizacao.value = componente.localizacao;
    textareaDescricao.value = componente.descricao || '';

    modalTitulo.textContent = `Editar: ${componente.codigo}`;
    modalComponente.classList.add('active');
    inputNome.focus();
  }

  /**
   * Fecha o modal de componente.
   */
  function fecharModalComponente() {
    modalComponente.classList.remove('active');
    formComponente.reset();
    limparErrosValidacao();
  }

  /**
   * Abre o modal de confirmação para eliminar um componente.
   */
  function abrirModalEliminar(id) {
    const componente = Storage.obterPorId(id);
    if (!componente) return;

    idParaEliminar = id;
    eliminarNome.textContent = componente.nome;
    eliminarCodigo.textContent = componente.codigo;
    modalEliminar.classList.add('active');
  }

  /**
   * Fecha o modal de confirmação de eliminação.
   */
  function fecharModalEliminar() {
    idParaEliminar = null;
    modalEliminar.classList.remove('active');
  }

  /**
   * Limpa as marcações de erro visual dos campos do formulário.
   */
  function limparErrosValidacao() {
    formComponente.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    formComponente.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
      el.classList.remove('visible');
    });
  }

  /**
   * Valida e submete o formulário de componente (Adicionar ou Editar).
   */
  formComponente.addEventListener('submit', (e) => {
    e.preventDefault();
    limparErrosValidacao();

    const id = inputId.value;
    const dados = {
      codigo: inputCodigo.value,
      nome: inputNome.value,
      categoria: selectCategoria.value,
      quantidade: inputQuantidade.value,
      preco: inputPreco.value,
      localizacao: inputLocalizacao.value,
      descricao: textareaDescricao.value
    };

    // Validação de negócio
    const validacao = Storage.validarComponente(dados);
    if (!validacao.valido) {
      mostrarToast(validacao.erro, 'danger');
      return;
    }

    let resultado;
    if (id) {
      // Edição
      resultado = Storage.atualizar(id, dados);
    } else {
      // Criação
      resultado = Storage.adicionar(dados);
    }

    if (resultado.sucesso) {
      mostrarToast(resultado.mensagem, 'success');
      fecharModalComponente();
      renderizarTabela();
    } else {
      mostrarToast(resultado.mensagem, 'danger');
    }
  });

  /**
   * Confirma a eliminação do componente selecionado.
   */
  btnConfirmarEliminar.addEventListener('click', () => {
    if (!idParaEliminar) return;

    const resultado = Storage.eliminar(idParaEliminar);
    if (resultado.sucesso) {
      mostrarToast(resultado.mensagem, 'success');
      fecharModalEliminar();
      renderizarTabela();
    } else {
      mostrarToast(resultado.mensagem, 'danger');
    }
  });

  // Eventos de abertura e fecho de modais
  if (btnAbrirAdicionar) btnAbrirAdicionar.addEventListener('click', abrirModalNovo);
  if (btnFecharModal) btnFecharModal.addEventListener('click', fecharModalComponente);
  if (btnCancelarModal) btnCancelarModal.addEventListener('click', fecharModalComponente);

  if (btnFecharModalEliminar) btnFecharModalEliminar.addEventListener('click', fecharModalEliminar);
  if (btnCancelarEliminar) btnCancelarEliminar.addEventListener('click', fecharModalEliminar);

  // Fecha modais com a tecla ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      fecharModalComponente();
      fecharModalEliminar();
    }
  });

  // Eventos de pesquisa e filtros dinâmicos
  if (inputPesquisa) inputPesquisa.addEventListener('input', renderizarTabela);
  if (selectCategoriaFiltro) selectCategoriaFiltro.addEventListener('change', renderizarTabela);
  if (selectStockFiltro) selectStockFiltro.addEventListener('change', renderizarTabela);

  // Botão para repor dados de demonstração (útil para testes da equipa)
  const btnRestaurarDemo = document.getElementById('btn-restaurar-demo');
  if (btnRestaurarDemo) {
    btnRestaurarDemo.addEventListener('click', () => {
      if (confirm('Deseja repor a lista inicial de componentes de demonstração? Quaisquer alterações locais serão substituídas.')) {
        Storage.restaurarDadosDemonstracao();
        mostrarToast('Dados de demonstração restaurados com sucesso!', 'info');
        renderizarTabela();
      }
    });
  }

  // Prevenção contra injeção de HTML no DOM
  function escapeHtml(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  // Renderização inicial da tabela
  renderizarTabela();
});

