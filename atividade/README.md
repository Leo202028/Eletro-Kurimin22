# Eletro Kurumin — Sistema de Controlo de Stock de Componentes Eletrónicos

Bem-vindo ao repositório do sistema web de controlo de stock desenvolvido para a **Eletro Kurumin**.  
A aplicação foi concebida por um desenvolvedor júnior da equipa de software, com foco na simplicidade de utilização, integridade dos dados de armazém, rapidez de execução e cumprimento integral de todos os requisitos funcionais solicitados pela empresa.

---

## 1. Estrutura de Ficheiros do Projeto

O projeto adota uma arquitetura modular, limpa e de fácil manutenção, sem recurso a dependências externas pesadas ou passos complexos de compilação:

```text
eletro-kurumin/
│
├── index.html            # Ecrã Principal: Gestão de Componentes (CRUD, pesquisa, filtros e estatísticas)
├── login.html            # Ecrã de Início de Sessão (Autenticação e proteção de acessos)
├── relatorio.html        # Ecrã de Relatórios: Valorização patrimonial, impressão e exportação CSV
│
├── css/
│   └── styles.css        # Folha de estilos central (Design responsivo, componentes, cartões e @media print)
│
├── js/
│   ├── auth.js           # Módulo de Autenticação: Controlo de sessão, guardas de rota e utilizadores demo
│   ├── storage.js        # Camada de Persistência: CRUD no localStorage, validações de negócio e semente demo
│   ├── stock.js          # Lógica da Gestão de Stock: Manipulação do DOM, pesquisa em tempo real e modais
│   └── relatorio.js      # Lógica de Relatórios: Cálculo do valor total, formatações, impressão e ficheiro CSV
│
└── README.md             # Documentação técnica e instruções de execução
```

---

## 2. Requisitos Cumpridos

### 1. Autenticação e Segurança de Sessão
- **Início de Sessão:** Acesso condicionado por e-mail e palavra-passe.
- **Proteção de Rotas:** O acesso direto a `index.html` ou `relatorio.html` sem sessão iniciada é automaticamente bloqueado e redirecionado para `login.html`.
- **Terminar Sessão:** Botão presente no cabeçalho de todas as páginas autenticadas com confirmação do utilizador.
- **Utilizadores de Demonstração Pré-configurados:**
  - **Administrador / Gestor de Armazém:**
    - **E-mail:** `admin@eletrokurumin.pt`
    - **Palavra-passe:** `kurumin2026`
    - **Nome:** Carlos Pereira
  - **Técnica de Eletrónica:**
    - **E-mail:** `tecnico@eletrokurumin.pt`
    - **Palavra-passe:** `kurumin2026`
    - **Nome:** Inês Silva
  - *Existe ainda um botão de preenchimento automático no ecrã de início de sessão para testes rápidos.*

### 2. Gestão de Componentes (CRUD Completo)
- **Campos Obrigatórios por Componente:**
  1. **Código / Referência:** Identificador único do artigo (ex: `RES-10K-0805`, `IC-ATMEGA328P`).
  2. **Nome / Designação:** Nome descritivo da peça eletrónica.
  3. **Categoria:** Passivos, Semicondutores, Circuitos Integrados, Sensores, Optoeletrónica, Eletromecânicos, Conectores, Alimentação & Baterias.
  4. **Quantidade em Stock:** Número inteiro não negativo ($\ge 0$).
  5. **Preço Unitário:** Valor monetário estritamente positivo ($> 0,00\ \text{€}$).
  6. **Localização no Armazém:** Indicação física (ex: `Gaveta A-01`, `Prateleira B-03`).
  7. **Observações / Encapsulamento:** Campo opcional para notas técnicas.
- **Validações Estritas:**
  - Não permite códigos duplicados.
  - Rejeita valores decimais na quantidade ou valores negativos.
  - Rejeita preços nulos ou negativos.
- **Confirmação de Eliminação:**
  - Janela modal de confirmação que apresenta o nome e o código do componente antes da eliminação definitiva.
- **Pesquisa e Filtros em Tempo Real:**
  - Pesquisa instantânea por código, nome ou localização.
  - Filtro por categoria.
  - Filtro por nível de stock (alerta para itens com $\le 15$ unidades).

### 3. Relatórios e Avaliação Patrimonial
- **Valor Total do Stock:** Apresentado com enorme destaque visual, calculando a soma exata de:
  $$\text{Valor Total} = \sum (\text{Quantidade}_i \times \text{Preço Unitário}_i)$$
- **Exportação para CSV:** Gera um ficheiro `.csv` estruturado com codificação UTF-8 com BOM e separador `;`, garantindo abertura direta e correta no Microsoft Excel em Portugal e na Europa.
- **Impressão Otimizada:** Folha de estilos `@media print` dedicada que remove menus e botões, formata uma tabela limpa para papel A4 e inclui bloco formal para assinaturas do responsável pelo armazém e da direção financeira.

---

## 3. Como Executar a Aplicação

A aplicação foi desenvolvida em tecnologias web padrão (HTML5, CSS3 e JavaScript Moderno), pelo que **não requer instalação de dependências ou Node.js para funcionar**.

### Opção A — Abertura Direta no Navegador (Mais Rápido)
1. Navegue até à pasta do projeto.
2. Dê um duplo clique no ficheiro `login.html` (ou abra com o Google Chrome, Microsoft Edge, Mozilla Firefox ou Safari).
3. O sistema será iniciado imediatamente no navegador.

### Opção B — Executar com Servidor Local Simples

Caso pretenda simular um ambiente de servidor HTTP completo:

- **Via Python:**
  ```bash
  python -m http.server 8080
  ```
  Aceda a: [http://localhost:8080/login.html](http://localhost:8080/login.html)

- **Via Node.js (npx serve):**
  ```bash
  npx serve .
  ```

---

## 4. Notas de Desenvolvimento

- **Português Europeu:** Toda a interface, mensagens de validação, termos fiscais e relatórios utilizam estritamente o português europeu (*iniciar sessão*, *palavra-passe*, *stock*, *armazém*, *eliminar*, *guardar*).
- **Sem Dependências Externas (Offline Ready):** Todos os ícones foram integrados em formato SVG inline, garantindo que o sistema funciona mesmo sem ligação à Internet na rede local do armazém.

