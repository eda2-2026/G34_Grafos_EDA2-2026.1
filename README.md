# TechGraph - Mapeamento Tecnológico de Repositórios

O **TechGraph** é uma aplicação web desenvolvida para analisar e visualizar de forma interativa a stack tecnológica de uma organização do GitHub. A solução mapeia os repositórios e suas linguagens utilizando a teoria de grafos, mais especificamente um **Grafo Bipartido**, permitindo identificar tendências de tecnologias, agrupamento de projetos e popularidade de linguagens na organização.

---

## Fundamentação Teórica (O Grafo Bipartido)

Um **Grafo Bipartido** é um tipo especial de grafo cujos vértices (nós) podem ser divididos em dois conjuntos independentes e disjuntos, $U$ e $V$, de tal forma que cada aresta (conexão) conecta um vértice de $U$ a um vértice de $V$. Não existem arestas que conectem vértices do mesmo conjunto.

No **TechGraph**, os dois conjuntos são:
1. **Vértices de Repositório ($U$):** Representam os projetos criados na organização do GitHub (ex: `api-vendas`, `app-mobile`).
2. **Vértices de Tecnologia ($V$):** Representam as linguagens de programação identificadas nos repositórios (ex: `TypeScript`, `Python`, `Go`).

As **Arestas (Conexões)** são não-direcionadas e representam a relação: *"O repositório $X$ utiliza a tecnologia $Y$"*. Portanto, um nó de repositório nunca se conecta diretamente a outro repositório, e um nó de tecnologia nunca se conecta diretamente a outra tecnologia.

---

## Arquitetura do Projeto

A aplicação é estruturada como um **Monorepo** em TypeScript, composto por:

- **Shared (`/shared`):** Contratos de tipos TypeScript compartilhados entre backend e frontend (como `GrafoNode`, `GrafoLink` e `GrafoResponse`).
- **Backend (Bun + ElysiaJS) (`/backend`):** Consome a API do GitHub com paginação, agrupa linguagens por repositório com processamento concorrente respeitando limites de taxa (*rate limits*), monta a estrutura matemática do grafo bipartido e disponibiliza um endpoint JSON com cache em memória.
- **Frontend (Vite + React + TypeScript) (`/frontend`):** Renderiza o grafo tridimensional ou bidimensional usando bibliotecas de force-directed graph (`react-force-graph` ou `cytoscape.js`), além de oferecer painéis de detalhes ao clicar nos nós e ranking lateral.

---

## Configuração das Credenciais do GitHub

Para que o backend possa consultar os dados da organização no GitHub, é necessário obter um Token de Acesso Pessoal (PAT).

### Passo a passo para criar o Token:
1. Acesse o GitHub e vá em **Settings** > **Developer Settings** > **Personal access tokens**.
2. Recomendado utilizar **Tokens (classic)** ou **Fine-grained tokens**.
3. **Escopo necessário:**
   - Para tokens clássicos, selecione o escopo `repo` (para leitura de repositórios privados da organização, se aplicável) ou apenas permissões básicas de leitura pública.
   - Para tokens Fine-grained, dê permissão de leitura para **Repository metadata** e **Repository languages** na organização desejada.
4. Copie o token gerado (você não poderá visualizá-lo novamente).

---

## Setup e Execução do Projeto

### Pré-requisitos
- [Bun](https://bun.sh/) instalado na máquina (versão 1.0 ou superior).

### 1. Configurando Variáveis de Ambiente
Na raiz da pasta do backend, crie um arquivo `.env` baseado no `.env.example`:

```bash
# Copiar o exemplo de variáveis de ambiente
cp backend/.env.example backend/.env
```

Edite o arquivo `backend/.env` e preencha as variáveis:
```env
GITHUB_TOKEN=seu_token_aqui
GITHUB_ORG=nome_da_organizacao_no_github
PORT=3000
```

### 2. Instalando as Dependências
Instale as dependências da aplicação a partir da raiz do monorepo:
```bash
bun install
```

### 3. Rodando o Servidor de Desenvolvimento

#### Executar o Backend:
```bash
cd backend
bun dev
```
O servidor estará rodando em `http://localhost:3000`. A rota `/api/grafo-tecnologias` expõe a estrutura do grafo bipartido.

#### Executar o Frontend:
```bash
cd frontend
bun dev
```
O frontend estará acessível em `http://localhost:5173`. O proxy configurado no Vite redirecionará as chamadas de `/api` para o backend Elysia.

---

## Estrutura de Resposta da API `/api/grafo-tecnologias`

O JSON retornado pelo backend segue o padrão abaixo, adequado para consumo por bibliotecas de grafos:

```json
{
  "nodes": [
    { "id": "repo_backend-loja", "label": "Backend Loja", "group": "repositorio" },
    { "id": "tech_JavaScript", "label": "JavaScript", "group": "tecnologia" },
    { "id": "tech_TypeScript", "label": "TypeScript", "group": "tecnologia" }
  ],
  "links": [
    { "source": "repo_backend-loja", "target": "tech_JavaScript" },
    { "source": "repo_backend-loja", "target": "tech_TypeScript" }
  ]
}
```
