/**
 * ============================================================================
 * Eletro Kurumin - Sistema de Controlo de Stock de Componentes Eletrónicos
 * Ficheiro: storage.js
 * Descrição: Camada de persistência local (localStorage) e dados de demonstração
 * ============================================================================
 */

const Storage = (() => {
  const STORAGE_KEY = 'eletro_kurumin_stock_v1';

  // Componentes de demonstração pré-carregados na primeira execução
  const COMPONENTES_INICIAIS = [
    {
      id: 'comp_1',
      codigo: 'RES-10K-0805',
      nome: 'Resistor SMD 10kΩ 1/8W 1%',
      categoria: 'Passivos',
      quantidade: 1500,
      preco: 0.03,
      localizacao: 'Gaveta A-01',
      descricao: 'Resistência de filme espesso em invólucro 0805.'
    },
    {
      id: 'comp_2',
      codigo: 'CAP-100U-25V',
      nome: 'Condensador Eletrolítico 100µF 25V',
      categoria: 'Passivos',
      quantidade: 120,
      preco: 0.18,
      localizacao: 'Gaveta A-08',
      descricao: 'Condensador radial polarizado 105°C.'
    },
    {
      id: 'comp_3',
      codigo: 'IC-ATMEGA328P',
      nome: 'Microcontrolador ATmega328P-PU',
      categoria: 'Circuitos Integrados',
      quantidade: 25,
      preco: 3.45,
      localizacao: 'Gaveta B-03',
      descricao: 'MCU 8-bit AVR 32KB Flash em encapsulamento DIP-28.'
    },
    {
      id: 'comp_4',
      codigo: 'MOD-ESP32-WROOM',
      nome: 'Módulo WiFi & BLE ESP32-WROOM-32D',
      categoria: 'Semicondutores',
      quantidade: 40,
      preco: 4.80,
      localizacao: 'Gaveta B-10',
      descricao: 'SoC dual-core com antena PCB integrada.'
    },
    {
      id: 'comp_5',
      codigo: 'IC-NE555P',
      nome: 'Temporizador de Precisão NE555P',
      categoria: 'Circuitos Integrados',
      quantidade: 85,
      preco: 0.42,
      localizacao: 'Gaveta B-01',
      descricao: 'Circuito integrado temporizador padrão em formato DIP-8.'
    },
    {
      id: 'comp_6',
      codigo: 'DIO-1N4007',
      nome: 'Díodo Retificador 1N4007 1000V 1A',
      categoria: 'Semicondutores',
      quantidade: 350,
      preco: 0.05,
      localizacao: 'Gaveta A-15',
      descricao: 'Díodo de junção de uso geral DO-41.'
    },
    {
      id: 'comp_7',
      codigo: 'TRN-2N2222A',
      nome: 'Transístor NPN 2N2222A 40V 0.8A',
      categoria: 'Semicondutores',
      quantidade: 210,
      preco: 0.12,
      localizacao: 'Gaveta A-14',
      descricao: 'Transístor bipolar de comutação rápida TO-92.'
    },
    {
      id: 'comp_8',
      codigo: 'SNS-DHT22',
      nome: 'Sensor Digital de Temperatura e Humidade DHT22',
      categoria: 'Sensores',
      quantidade: 18,
      preco: 5.60,
      localizacao: 'Gaveta C-02',
      descricao: 'Sensor de alta precisão com saída digital calibrada.'
    },
    {
      id: 'comp_9',
      codigo: 'REL-5V-1CH',
      nome: 'Módulo Relé 5V 1 Canal 10A com Optoacoplador',
      categoria: 'Eletromecânicos',
      quantidade: 30,
      preco: 1.75,
      localizacao: 'Gaveta C-05',
      descricao: 'Comutação de cargas AC 250V/10A ou DC 30V/10A.'
    },
    {
      id: 'comp_10',
      codigo: 'REG-LM7805',
      nome: 'Regulador de Tensão Linear 5V 1.5A LM7805',
      categoria: 'Alimentação & Baterias',
      quantidade: 65,
      preco: 0.65,
      localizacao: 'Gaveta B-07',
      descricao: 'Regulador positivo de três terminais TO-220.'
    },
    {
      id: 'comp_11',
      codigo: 'LED-5MM-RED',
      nome: 'LED Difuso Vermelho 5mm Alto Brilho',
      categoria: 'Optoeletrónica',
      quantidade: 450,
      preco: 0.04,
      localizacao: 'Gaveta A-20',
      descricao: 'Comprimento de onda 625nm, corrente direta 20mA.'
    },
    {
      id: 'comp_12',
      codigo: 'CON-HDR-40P',
      nome: 'Barra de Pinos Macho 2.54mm 40 Pinos',
      categoria: 'Conectores',
      quantidade: 8, // Stock baixo intencional para teste de alertas
      preco: 0.50,
      localizacao: 'Gaveta D-01',
      descricao: 'Passo 2.54mm separável de 1 linha.'
    }
  ];

  /**
   * Inicializa o armazenamento com os dados de demonstração caso esteja vazio.
   */
  function inicializar() {
    try {
      const dados = localStorage.getItem(STORAGE_KEY);
      if (!dados) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(COMPONENTES_INICIAIS));
      }
    } catch (e) {
      console.error('Erro ao aceder ao localStorage:', e);
    }
  }

  /**
   * Obtém a lista completa de componentes.
   * @returns {Array} Lista de componentes eletrónicos.
   */
  function obterTodos() {
    inicializar();
    try {
      const dados = localStorage.getItem(STORAGE_KEY);
      return dados ? JSON.parse(dados) : [];
    } catch (e) {
      console.error('Erro ao ler componentes:', e);
      return [];
    }
  }

  /**
   * Procura um componente pelo respetivo ID único.
   * @param {string} id 
   * @returns {Object|null}
   */
  function obterPorId(id) {
    const componentes = obterTodos();
    return componentes.find(item => item.id === id) || null;
  }

  /**
   * Verifica se já existe um componente com o código indicado (ignorando o id atual, se fornecido).
   * @param {string} codigo 
   * @param {string|null} idAtual 
   * @returns {boolean}
   */
  function existeCodigo(codigo, idAtual = null) {
    const componentes = obterTodos();
    const codigoNormalizado = codigo.trim().toUpperCase();
    return componentes.some(item => 
      item.codigo.trim().toUpperCase() === codigoNormalizado && item.id !== idAtual
    );
  }

  /**
   * Regista um novo componente no stock.
   * @param {Object} dados
   * @returns {{sucesso: boolean, mensagem: string, item?: Object}}
   */
  function adicionar(dados) {
    const validacao = validarComponente(dados);
    if (!validacao.valido) {
      return { sucesso: false, mensagem: validacao.erro };
    }

    if (existeCodigo(dados.codigo)) {
      return { sucesso: false, mensagem: `O código/referência "${dados.codigo}" já está em uso noutro componente.` };
    }

    const novoComponente = {
      id: 'comp_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      codigo: dados.codigo.trim().toUpperCase(),
      nome: dados.nome.trim(),
      categoria: dados.categoria.trim(),
      quantidade: parseInt(dados.quantidade, 10),
      preco: parseFloat(dados.preco),
      localizacao: dados.localizacao.trim(),
      descricao: dados.descricao ? dados.descricao.trim() : ''
    };

    const lista = obterTodos();
    lista.unshift(novoComponente);
    guardarLista(lista);

    return { sucesso: true, mensagem: 'Componente registado com sucesso!', item: novoComponente };
  }

  /**
   * Atualiza os dados de um componente existente.
   * @param {string} id 
   * @param {Object} dados 
   * @returns {{sucesso: boolean, mensagem: string, item?: Object}}
   */
  function atualizar(id, dados) {
    const lista = obterTodos();
    const indice = lista.findIndex(item => item.id === id);

    if (indice === -1) {
      return { sucesso: false, mensagem: 'Componente não encontrado no sistema.' };
    }

    const validacao = validarComponente(dados);
    if (!validacao.valido) {
      return { sucesso: false, mensagem: validacao.erro };
    }

    if (existeCodigo(dados.codigo, id)) {
      return { sucesso: false, mensagem: `O código/referência "${dados.codigo}" já pertence a outro componente.` };
    }

    lista[indice] = {
      ...lista[indice],
      codigo: dados.codigo.trim().toUpperCase(),
      nome: dados.nome.trim(),
      categoria: dados.categoria.trim(),
      quantidade: parseInt(dados.quantidade, 10),
      preco: parseFloat(dados.preco),
      localizacao: dados.localizacao.trim(),
      descricao: dados.descricao ? dados.descricao.trim() : ''
    };

    guardarLista(lista);
    return { sucesso: true, mensagem: 'Componente atualizado com sucesso!', item: lista[indice] };
  }

  /**
   * Elimina um componente do stock pelo ID.
   * @param {string} id 
   * @returns {{sucesso: boolean, mensagem: string}}
   */
  function eliminar(id) {
    const lista = obterTodos();
    const novaLista = lista.filter(item => item.id !== id);

    if (novaLista.length === lista.length) {
      return { sucesso: false, mensagem: 'Componente não encontrado.' };
    }

    guardarLista(novaLista);
    return { sucesso: true, mensagem: 'Componente eliminado com sucesso!' };
  }

  /**
   * Restaura os dados para a semente de demonstração inicial.
   */
  function restaurarDadosDemonstracao() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(COMPONENTES_INICIAIS));
    return obterTodos();
  }

  /**
   * Guarda a lista no localStorage.
   * @param {Array} lista 
   */
  function guardarLista(lista) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch (e) {
      console.error('Falha ao guardar no localStorage:', e);
    }
  }

  /**
   * Validações de integridade e negócio dos dados do componente.
   * - Campos obrigatórios: código, nome, categoria, localização
   * - Quantidade: número inteiro não negativo (>= 0)
   * - Preço unitário: número estritamente positivo (> 0)
   * @param {Object} dados 
   * @returns {{valido: boolean, erro?: string}}
   */
  function validarComponente(dados) {
    if (!dados.codigo || dados.codigo.trim() === '') {
      return { valido: false, erro: 'O código/referência do componente é obrigatório.' };
    }

    if (!dados.nome || dados.nome.trim() === '') {
      return { valido: false, erro: 'A designação/nome do componente é obrigatória.' };
    }

    if (!dados.categoria || dados.categoria.trim() === '') {
      return { valido: false, erro: 'Selecione uma categoria para o componente.' };
    }

    if (!dados.localizacao || dados.localizacao.trim() === '') {
      return { valido: false, erro: 'A localização no armazém é obrigatória (ex: Gaveta A-01).' };
    }

    // Validação da Quantidade (Inteiro não negativo)
    const qtdNum = Number(dados.quantidade);
    if (dados.quantidade === '' || isNaN(qtdNum) || !Number.isInteger(qtdNum) || qtdNum < 0) {
      return { valido: false, erro: 'A quantidade em stock deve ser um número inteiro não negativo (zero ou superior).' };
    }

    // Validação do Preço Unitário (Positivo > 0)
    const precoNum = Number(dados.preco);
    if (dados.preco === '' || isNaN(precoNum) || precoNum <= 0) {
      return { valido: false, erro: 'O preço unitário deve ser um número estritamente positivo (maior que 0,00 €).' };
    }

    return { valido: true };
  }

  /**
   * Formatação monetária em Euros (padrão português: 1.234,56 €).
   * @param {number} valor 
   * @returns {string}
   */
  function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor || 0);
  }

  /**
   * Formatação de números inteiros com separadores de milhar portugueses.
   * @param {number} valor 
   * @returns {string}
   */
  function formatarInteiro(valor) {
    return new Intl.NumberFormat('pt-PT').format(valor || 0);
  }

  // Executa a inicialização logo no carregamento do ficheiro
  inicializar();

  return {
    obterTodos,
    obterPorId,
    adicionar,
    atualizar,
    eliminar,
    restaurarDadosDemonstracao,
    validarComponente,
    formatarMoeda,
    formatarInteiro
  };
})();

