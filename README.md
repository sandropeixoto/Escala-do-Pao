# Projeto: Escala do Pão de Queijo

## Visão Geral

Este projeto foi criado para gerenciar de forma justa e automática a escala de responsabilidades, como a compra do café da manhã, entre os membros de uma equipe. O sistema gera uma escala de rodízio, pulando automaticamente fins de semana e feriados, e permitindo o gerenciamento de ausências.

A aplicação é construída com React e Firebase, e foi projetada para ser uma solução PWA (Progressive Web App) para facilitar o acesso em dispositivos móveis e desktop.

## Funcionalidades

*   **Geração Automática de Escala:** Cria uma agenda de responsabilidades com base em uma lista de participantes e uma data de início.
*   **Rodízio Circular Justo:** Garante que todos os participantes passem pela escala de forma equitativa.
*   **Ignora Dias Não Úteis:** Fins de semana (sábados e domingos) são pulados automaticamente.
*   **Cadastro de Feriados:** Permite cadastrar feriados que são desconsiderados na geração da escala.
*   **Gerenciamento de Participantes:** Interface para adicionar e remover participantes da escala.
*   **Configuração da Data de Início:** Permite definir a data de início da escala.
*   **Gestão de Férias e Ausências:** Permite que um administrador defina períodos de ausência para os participantes. Durante esses períodos, a pessoa ausente não será incluída na escala.
*   **Interface Administrativa:** Uma área protegida para gerenciar participantes, feriados e ausências.
*   **Visualização Intuitiva:** Um calendário claro exibe a escala do mês, destacando o responsável do dia.

## Tech Stack

*   **Frontend:**
    *   **Framework:** [React](https://reactjs.org/)
    *   **Bundler:** [Vite](https://vitejs.dev/)
    *   **Roteamento:** [React Router](https://reactrouter.com/)
    *   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
    *   **Componentes de UI:** Componentes customizados com o auxílio de `react-datepicker` e `react-icons`.
    *   **Animação:** [Framer Motion](https://www.framer.com/motion/)
*   **Backend & Database:**
    *   **Plataforma:** [Firebase](https://firebase.google.com/)
    *   **Serviços:** Firestore Database para armazenamento de dados em tempo real.
*   **Utilitários:**
    *   **Manipulação de Datas:** [date-fns](httpss://date-fns.org/)
    *   **Linting:** [ESLint](https://eslint.org/)

## Estrutura do Projeto

O projeto segue uma estrutura de pastas organizada para facilitar a manutenção e escalabilidade.

```
/
├── public/                # Arquivos estáticos públicos
├── src/
│   ├── assets/            # Imagens, fontes, etc.
│   ├── components/        # Componentes React reutilizáveis
│   ├── pages/             # Componentes de página (Home, Admin, etc.)
│   ├── services/          # Configuração e serviços do Firebase
│   ├── utils/             # Funções utilitárias (ex: lógica de geração de escala)
│   ├── App.jsx            # Componente raiz da aplicação
│   ├── main.jsx           # Ponto de entrada da aplicação
│   └── index.css          # Estilos globais
├── .eslintrc.cjs          # Configuração do ESLint
├── firebase.json          # Configuração do Firebase Hosting
├── package.json           # Dependências e scripts do projeto
├── tailwind.config.js     # Configuração do Tailwind CSS
└── vite.config.js         # Configuração do Vite
```

## Como Executar o Projeto Localmente

### Pré-requisitos

*   [Node.js](httpss://nodejs.org/) (versão 20 ou superior)
*   [NPM](httpss://www.npmjs.com/)

### Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DO_PROJETO>
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Firebase:**
    *   Crie um projeto no [console do Firebase](https://console.firebase.google.com/).
    *   Adicione um aplicativo da Web ao seu projeto.
    *   Copie as credenciais de configuração do Firebase.
    *   Renomeie o arquivo `src/services/firebase.example.js` para `src/services/firebase.js`.
    *   Cole suas credenciais no arquivo `src/services/firebase.js`.

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

    A aplicação estará disponível em `http://localhost:5173`.

## Scripts Disponíveis

*   `npm run dev`: Inicia o servidor de desenvolvimento com Vite.
*   `npm run build`: Compila a aplicação para produção. Os arquivos finais estarão na pasta `dist`.
*   `npm run lint`: Executa o linter (ESLint) para verificar a qualidade do código.
*   `npm run preview`: Inicia um servidor local para visualizar a build de produção.

## Deployment

A aplicação está configurada para ser implantada facilmente no **Firebase Hosting**.

1.  **Construa o projeto:**
    ```bash
    npm run build
    ```

2.  **Faça o deploy:**
    *   Instale o Firebase CLI: `npm install -g firebase-tools`
    *   Autentique-se: `firebase login`
    *   Inicie o processo de deploy: `firebase deploy`
