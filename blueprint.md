
# Blueprint do Projeto: Escala do Pão de Queijo

## Visão Geral

Este documento serve como a fonte única de verdade para o projeto "Escala do Pão de Queijo". Ele detalha o propósito do aplicativo, as funcionalidades implementadas e os planos para futuras atualizações.

O objetivo principal é gerenciar de forma justa e automática a escala de responsabilidades, como a compra do café da manhã, entre os membros de uma equipe. O sistema gera uma escala de rodízio, pulando automaticamente fins de semana e feriados, e permitindo o gerenciamento de ausências.

## Funcionalidades Implementadas

*   **Geração Automática de Escala:** Cria uma agenda de responsabilidades com base em uma lista de participantes e uma data de início.
*   **Rodízio Circular Justo:** Garante que todos os participantes passem pela escala de forma equitativa.
*   **Ignora Dias Não Úteis:** Fins de semana (sábados e domingos) são pulados.
*   **Cadastro de Feriados:** Permite cadastrar feriados que são desconsiderados na geração da escala.
*   **Gerenciamento de Participantes:** Interface para adicionar e remover participantes da escala.
*   **Configuração da Data de Início:** Permite definir a data de início da escala.

## Plano para a Próxima Funcionalidade: Gestão de Férias e Ausências

### 1. Visão Geral

O objetivo é permitir que um administrador defina períodos de ausência para os participantes. Durante esses períodos, a pessoa ausente não será incluída na escala. Ao final do período, a pessoa retornará automaticamente à fila.

### 2. Etapas Detalhadas

*   **Etapa 1: Criar o Componente de UI `Absences.jsx`**
    *   **Localização:** `src/components/Absences.jsx`
    *   **Funcionalidades:**
        *   Formulário para agendar ausências com seleção de participante e datas de início/fim.
        *   Lista para exibir e permitir a exclusão de ausências agendadas.

*   **Etapa 2: Atualizar o Modelo de Dados no Firebase**
    *   **Ação:** Criar uma nova coleção chamada `absences`.
    *   **Estrutura:** Documentos com `participantId`, `participantName`, `startDate`, `endDate`.

*   **Etapa 3: Modificar a Lógica de Geração de Escala**
    *   **Localização:** `src/utils/schedule.js`
    *   **Ação:** O algoritmo de geração de escala deverá buscar as ausências e pular os participantes que estiverem ausentes em uma determinada data.

*   **Etapa 4: Integrar o Componente à Página de Administração**
    *   **Localização:** `src/pages/Admin.jsx`
    *   **Ação:** Adicionar uma nova aba "Ausências" e renderizar o componente `Absences.jsx`.
