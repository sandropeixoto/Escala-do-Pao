# Escala do Pão de Queijo

Este é um projeto de aplicação web para gerenciar de forma justa e automática a escala de responsabilidades, como a compra do café da manhã ou do pão de queijo, entre os membros de uma equipe.

O sistema gera uma escala de rodízio, pulando automaticamente fins de semana e feriados (cadastrados via Firebase), garantindo que a distribuição de tarefas seja sempre equilibrada.

## ✨ Funcionalidades Principais

- **Geração Automática de Escala:** Com base em uma lista de participantes e uma data de início, o sistema cria uma agenda de responsabilidades.
- **Rodízio Circular Justo:** Garante que todos os participantes passem pela escala de forma equitativa antes de repetir.
- **Ignora Dias Não Úteis:** Fins de semana (sábados e domingos) são automaticamente pulados.
- **Cadastro de Feriados:** Integração com o Firebase para buscar e desconsiderar feriados customizáveis na geração da escala.
- **Interface Moderna e Reativa:** Interface limpa e agradável construída com as tecnologias mais recentes do ecossistema React.

## 🛠️ Tecnologias Utilizadas

- **Framework Frontend:** [React](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Roteamento:** [React Router DOM](https://reactrouter.com/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/)
- **Manipulação de Datas:** [date-fns](https://date-fns.org/)
- **Backend e Banco de Dados:** [Firebase (Firestore)](https://firebase.google.com/)

## 🚀 Como Executar o Projeto

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/sandropeixoto/Escala-do-Pao.git
    cd Escala-do-Pao
    ```

2.  **Instale as Dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    - Crie um arquivo chamado `.env.local` na raiz do projeto.
    - Adicione suas credenciais do Firebase a este arquivo, como no exemplo abaixo. Estas variáveis são carregadas automaticamente pelo Vite.

    ```
    VITE_API_KEY="sua_api_key"
    VITE_AUTH_DOMAIN="seu_auth_domain"
    VITE_PROJECT_ID="seu_project_id"
    VITE_STORAGE_BUCKET="seu_storage_bucket"
    VITE_MESSAGING_SENDER_ID="seu_sender_id"
    VITE_APP_ID="seu_app_id"
    ```

4.  **Execute o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  Abra [http://localhost:5173](http://localhost:5173) (ou a porta indicada no seu terminal) para ver a aplicação em execução.
