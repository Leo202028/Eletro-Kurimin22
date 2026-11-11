/**
 * ============================================================================
 * Eletro Kurumin - Sistema de Controlo de Stock de Componentes Eletrónicos
 * Ficheiro: relatorio.js
 * Descrição: Geração do relatório detalhado, cálculo do valor total, impressão e exportação CSV
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Proteção de rota e configuração de cabeçalho
  Auth.protegerPagina();
  Auth.configurarInterface();

  // 2. Elementos da interface
  const tabelaCorpo = document.getElementById('relatorio-table-body');
  const filtroCategoria = document.getElementById('filtro-categoria-relatorio');
  const btnImprimir = document.getElementById('btn-imprimir');
  const btnExportarCsv = document.getElementById('btn-exportar-csv');

  // Elementos de totais e indicadores de topo
  const kpiValorTotal = document.getElementById('kpi-valor-total');
  const kpiTotalArtigos = document.getElementById('kpi-total-artigos');
  const kpiTotalUnidades = document.getElementById('kpi-total-unidades');
  const kpiPrecoMedio = document.getElementById('kpi-preco-medio');

  // Metadados do relatório para impressão
  const relatorioDataEmissao = document.getElementById('relatorio-data-emissao');
  const relatorioEmitidoPor = document.getElementById('relatorio-emitido-por');

  const utilizadorAtual = Auth.obterUtilizadorAtual();
  const agora = new Date();
  const dataFormatada = agora.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (relatorioDataEmissao) relatorioDataEmissao.textContent = dataFormatada;
  if (relatorioEmitidoPor && utilizadorAtual) {
    relatorioEmitidoPor.textContent = `${utilizadorAtual.nome} (${utilizadorAtual.cargo})`;
  }

  /**
   * Preenche o seletor de categorias para o relatório.
   */
  function carregarFiltroCategorias(componentes) {
    if (!filtroCategoria) return;
    const selecionado = filtroCategoria.value;
    const categorias = [...new Set(componentes.map(c => c.categoria))].sort();

    filtroCategoria.innerHTML = '<option value="">Todas as Categorias</option>';
    categorias.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      if (cat === selecionado) opt.selected = true;
      filtroCategoria.appendChild(opt);
    });
  }

  /**
   * Calcula os totais do inventário e atualiza a interface.
   */
  function atualizarIndicadores(componentes) {
    const totalArtigos = componentes.length;
    const totalUnidades = componentes.reduce((acc, c) => acc + c.quantidade, 0);
    
    // Requisito 3: Cálculo do VALOR TOTAL DO STOCK (Soma de quantidade x preço unitário)
    const valorTotalStock = componentes.reduce((acc, c) => acc + (c.quantidade * c.preco), 0);
    
    const precoMedioPorUnidade = totalUnidades > 0 ? (valorTotalStock / totalUnidades) : 0;

    if (kpiValorTotal) kpiValorTotal.textContent = Storage.formatarMoeda(valorTotalStock);
    if (kpiTotalArtigos) kpiTotalArtigos.textContent = Storage.formatarInteiro(totalArtigos);
    if (kpiTotalUnidades) kpiTotalUnidades.textContent = Storage.formatarInteiro(totalUnidades);
    if (kpiPrecoMedio) kpiPrecoMedio.textContent = Storage.formatarMoeda(precoMedioPorUnidade);
  }

  /**
   * Renderiza os dados na tabela do relatório com base na categoria selecionada.
   */
  function renderizarRelatorio() {
    const todos = Storage.obterTodos();
    carregarFiltroCategorias(todos);

    const catSelecionada = filtroCategoria ? filtroCategoria.value : '';
    const componentes = catSelecionada 
      ? todos.filter(c => c.categoria === catSelecionada) 
      : todos;

    atualizarIndicadores(componentes);
    tabelaCorpo.innerHTML = '';

    if (componentes.length === 0) {
      tabelaCorpo.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: #64748b;">
            Nenhum componente encontrado para os critérios selecionados.
          </td>
        </tr>
      `;
      return;
    }

    let somaGeralQuantidade = 0;
    let somaGeralValor = 0;

    componentes.forEach(c => {
      const subtotal = c.quantidade * c.preco;
      somaGeralQuantidade += c.quantidade;
      somaGeralValor += subtotal;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="code-badge">${escapeHtml(c.codigo)}</span></td>
        <td>
          <strong>${escapeHtml(c.nome)}</strong>
          ${c.descricao ? `<div class="form-hint">${escapeHtml(c.descricao)}</div>` : ''}
        </td>
        <td><span class="category-tag">${escapeHtml(c.categoria)}</span></td>
        <td>${escapeHtml(c.localizacao)}</td>
        <td style="text-align: right; font-weight: 600;">${Storage.formatarInteiro(c.quantidade)}</td>
        <td class="price-cell" style="text-align: right;">${Storage.formatarMoeda(c.preco)}</td>
        <td class="total-cell" style="text-align: right;">${Storage.formatarMoeda(subtotal)}</td>
      `;
      tabelaCorpo.appendChild(tr);
    });

    // Linha de Rodapé da Tabela com os Totais Destacados
    const trTotal = document.createElement('tr');
    trTotal.style.backgroundColor = '#f1f5f9';
    trTotal.style.fontWeight = 'bold';
    trTotal.innerHTML = `
      <td colspan="4" style="text-align: right; padding: 1rem; text-transform: uppercase; font-size: 0.85rem;">
        Totais do Relatório (${componentes.length} itens):
      </td>
      <td style="text-align: right; padding: 1rem; font-size: 0.95rem; color: var(--color-primary);">
        ${Storage.formatarInteiro(somaGeralQuantidade)} un.
      </td>
      <td style="text-align: right; padding: 1rem; color: var(--color-text-muted);">-</td>
      <td style="text-align: right; padding: 1rem; font-size: 1.05rem; color: var(--color-success); font-family: var(--font-mono);">
        ${Storage.formatarMoeda(somaGeralValor)}
      </td>
    `;
    tabelaCorpo.appendChild(trTotal);
  }

  /**
   * Exporta a tabela atual do relatório para ficheiro CSV (separador ponto e vírgula, compatível com Excel europeu).
   */
  function exportarParaCsv() {
    const todos = Storage.obterTodos();
    const catSelecionada = filtroCategoria ? filtroCategoria.value : '';
    const componentes = catSelecionada 
      ? todos.filter(c => c.categoria === catSelecionada) 
      : todos;

    if (componentes.length === 0) {
      alert('Não existem dados para exportar.');
      return;
    }

    // Cabeçalhos em Português
    const cabecalhos = [
      'Código / Referência',
      'Designação do Componente',
      'Categoria',
      'Localização no Armazém',
      'Quantidade em Stock',
      'Preço Unitário (EUR)',
      'Valor Total em Stock (EUR)',
      'Observações'
    ];

    const linhasCsv = [];
    linhasCsv.push(cabecalhos.join(';'));

    let totalGeral = 0;
    let totalUnidades = 0;

    componentes.forEach(c => {
      const subtotal = c.quantidade * c.preco;
      totalGeral += subtotal;
      totalUnidades += c.quantidade;

      const linha = [
        `"${c.codigo.replace(/"/g, '""')}"`,
        `"${c.nome.replace(/"/g, '""')}"`,
        `"${c.categoria.replace(/"/g, '""')}"`,
        `"${c.localizacao.replace(/"/g, '""')}"`,
        c.quantidade,
        c.preco.toFixed(2).replace('.', ','),
        subtotal.toFixed(2).replace('.', ','),
        `"${(c.descricao || '').replace(/"/g, '""')}"`
      ];
      linhasCsv.push(linha.join(';'));
    });

    // Linha de total no CSV
    linhasCsv.push(['"TOTAIS"', '""', '""', '""', totalUnidades, '""', totalGeral.toFixed(2).replace('.', ','), '""'].join(';'));

    // UTF-8 BOM (\uFEFF) para que o Excel em Windows abra com acentuação correta
    const conteudoCsv = '\uFEFF' + linhasCsv.join('\r\n');
    const blob = new Blob([conteudoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const dataHoje = new Date().toISOString().split('T')[0];
    const nomeFicheiro = `eletro_kurumin_relatorio_stock_${dataHoje}.csv`;

    const linkDownload = document.createElement('a');
    linkDownload.href = url;
    linkDownload.setAttribute('download', nomeFicheiro);
    document.body.appendChild(linkDownload);
    linkDownload.click();
    document.body.removeChild(linkDownload);
    URL.revokeObjectURL(url);
  }

  /**
   * Aciona a impressão do relatório.
   */
  function imprimirRelatorio() {
    window.print();
  }

  // Eventos de escuta
  if (filtroCategoria) filtroCategoria.addEventListener('change', renderizarRelatorio);
  if (btnImprimir) btnImprimir.addEventListener('click', imprimirRelatorio);
  if (btnExportarCsv) btnExportarCsv.addEventListener('click', exportarParaCsv);

  function escapeHtml(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  // Renderização inicial do relatório
  renderizarRelatorio();
});

