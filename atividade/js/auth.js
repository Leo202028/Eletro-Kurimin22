/**
 * ============================================================================
 * Eletro Kurumin - Sistema de Controlo de Stock de Componentes Eletrónicos
 * Ficheiro: auth.js
 * Descrição: Gestão de autenticação, controlo de sessão e utilizador demo
 * ============================================================================
 */

const Auth = (() => {
  const SESSION_KEY = 'eletro_kurumin_active_user';

  // Utilizadores de demonstração autorizados no sistema
  const UTILIZADORES_DEMO = [
    {
      id: 'usr_1',
      nome: 'Carlos Pereira',
      cargo: 'Gestor de Armazém',
      email: 'admin@eletrokurumin.pt',
      palavraPasse: 'kurumin2026'
    },
    {
      id: 'usr_2',
      nome: 'Inês Silva',
      cargo: 'Técnica de Eletrónica',
      email: 'tecnico@eletrokurumin.pt',
      palavraPasse: 'kurumin2026'
    }
  ];

  /**
   * Obtém os dados da sessão do utilizador com sessão iniciada.
   * @returns {Object|null}
   */
  function obterUtilizadorAtual() {
    try {
      const sessao = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      return sessao ? JSON.parse(sessao) : null;
    } catch (e) {
      console.error('Erro ao ler dados da sessão:', e);
      return null;
    }
  }

  /**
   * Verifica se existe um utilizador autenticado e com sessão ativa.
   * @returns {boolean}
   */
  function estaAutenticado() {
    return obterUtilizadorAtual() !== null;
  }

  /**
   * Tenta iniciar sessão com as credenciais fornecidas.
   * @param {string} email 
   * @param {string} palavraPasse 
   * @param {boolean} lembrarSessao 
   * @returns {{sucesso: boolean, mensagem: string, utilizador?: Object}}
   */
  function iniciarSessao(email, palavraPasse, lembrarSessao = false) {
    if (!email || !palavraPasse) {
      return { sucesso: false, mensagem: 'Por favor, introduza o e-mail e a palavra-passe.' };
    }

    const emailLimpo = email.trim().toLowerCase();
    const utilizadorEncontrado = UTILIZADORES_DEMO.find(
      u => u.email.toLowerCase() === emailLimpo && u.palavraPasse === palavraPasse
    );

    if (!utilizadorEncontrado) {
      return {
        sucesso: false,
        mensagem: 'Credenciais inválidas. Verifique o e-mail e a palavra-passe inseridos.'
      };
    }

    // Cria objeto de sessão seguro (sem expor a palavra-passe)
    const dadosSessao = {
      id: utilizadorEncontrado.id,
      nome: utilizadorEncontrado.nome,
      cargo: utilizadorEncontrado.cargo,
      email: utilizadorEncontrado.email,
      iniciadoEm: new Date().toISOString()
    };

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(dadosSessao));
      if (lembrarSessao) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(dadosSessao));
      }
    } catch (e) {
      console.error('Erro ao guardar sessão:', e);
    }

    return { sucesso: true, mensagem: 'Sessão iniciada com sucesso!', utilizador: dadosSessao };
  }

  /**
   * Termina a sessão do utilizador e limpa os dados armazenados.
   */
  function terminarSessao() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('Erro ao limpar sessão:', e);
    }
    window.location.href = 'login.html';
  }

  /**
   * Proteção de página: Se não estiver autenticado, bloqueia o acesso e
   * redireciona de imediato para a página de início de sessão.
   */
  function protegerPagina() {
    if (!estaAutenticado()) {
      window.location.href = 'login.html';
    }
  }

  /**
   * Redireciona para o painel principal caso o utilizador já tenha sessão ativa.
   * Utilizado na página login.html.
   */
  function redirecionarSeAutenticado() {
    if (estaAutenticado()) {
      window.location.href = 'index.html';
    }
  }

  /**
   * Atualiza a interface com as informações do utilizador autenticado
   * e configura o evento de clique no botão de terminar sessão.
   */
  function configurarInterface() {
    const utilizador = obterUtilizadorAtual();
    if (!utilizador) return;

    // Atualiza nome visível
    const elementoNome = document.getElementById('header-user-name');
    if (elementoNome) {
      elementoNome.textContent = utilizador.nome;
    }

    // Atualiza iniciais do avatar
    const elementoAvatar = document.getElementById('header-user-avatar');
    if (elementoAvatar) {
      const iniciais = utilizador.nome
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      elementoAvatar.textContent = iniciais;
    }

    // Configura botões de terminar sessão
    const botoesLogout = document.querySelectorAll('.btn-logout');
    botoesLogout.forEach(botao => {
      botao.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Deseja realmente terminar a sua sessão?')) {
          terminarSessao();
        }
      });
    });
  }

  return {
    obterUtilizadoresDemo: () => UTILIZADORES_DEMO,
    obterUtilizadorAtual,
    estaAutenticado,
    iniciarSessao,
    terminarSessao,
    protegerPagina,
    redirecionarSeAutenticado,
    configurarInterface
  };
})();

