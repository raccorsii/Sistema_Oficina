# 🔧 Sistema de Gestão para Oficina Mecânica

Sistema web para cadastro e gerenciamento de **clientes**, **veículos** e **agendamentos de serviços**, com autenticação de usuários (sessão com expiração) e proteção de dados pessoais (CPF criptografado), desenvolvido como solução para o *Desafio Oficina Mecânica*.

---

## 📋 Contexto

A oficina fazia o controle de agendamentos, clientes e veículos de forma manual, o que causava perda de horários, duplicidade de informações e falhas no armazenamento de dados. Também não havia proteção adequada para dados pessoais como o CPF, o que poderia gerar descumprimento da **LGPD**.

Este sistema organiza o processo de agendamento e a gestão das informações, atendendo às regras de negócio definidas em reunião com o proprietário.

## ✅ Regras de negócio atendidas

| Regra | Como foi implementada |
|---|---|
| Mínimo de 3 registros por tabela no script do BD | `db.sql` popula `usuarios`, `clientes`, `veiculos`, `servicos` e `agendamentos` com 3 registros cada |
| Validação de falha no login | `autenticacao.autenticar()` retorna erro 401 com mensagem única ("Usuário ou senha inválidos."), sem revelar se o usuário existe |
| CPF criptografado | Armazenado apenas como hash **bcrypt** (`cpf_hash`) |
| Tela principal com nome do usuário, acesso aos recursos e logout | `/principal` + `GET /api/me` + `POST /api/logout` |
| Busca de clientes e edição | `GET /api/clientes?q=termo` (nome, e-mail, telefone ou CPF) e `PUT /api/clientes/<id>` |
| Agendamentos ordenados por data, com dados completos de cliente e veículo | `agendamento.listar()` faz JOIN de `agendamentos`, `veiculos`, `clientes` e `servicos`, ordenado por `data_agendamento` |
| Atualização da data de um agendamento | `PUT /api/agendamentos/<id>` |
| Veículo sempre associado a um cliente já cadastrado | `veiculos._validar()` exige `cliente_id` existente (erro 404 caso contrário) |
| Autenticação com tempo de expiração | Sessão de **30 minutos** (`EXPIRACAO_SEGUNDOS`) |

---

## 🛠️ Tecnologias

- **Python 3** + **Flask 3.0.3** (back-end e API JSON)
- **MySQL 8+** (banco de dados) com `mysql-connector-python 9.0.0`
- **bcrypt 4.2.0** (hash de senhas e CPF)
- **HTML / CSS / JavaScript** (páginas em `templates/` e arquivos estáticos em `static/`)

---

## 📁 Estrutura do projeto

```
sistema/
├── app.py               # Ponto de entrada: configura o Flask e registra as rotas
├── rotas.py             # Todas as rotas HTTP (páginas e API JSON)
├── autenticacao.py      # bcrypt, sessão com expiração e decoradores de proteção
├── clientes.py          # Regras de negócio de clientes
├── veiculos.py          # Regras de negócio de veículos
├── agendamento.py       # Regras de negócio de agendamentos e serviços
├── db.py                # Conexão com o MySQL e funções query/execute
├── testar_conexao.py    # Script utilitário para testar a conexão com o banco
├── db.sql               # Script de criação e população do banco (saep_db)
├── requirements.txt     # Dependências Python
├── templates/           # Páginas HTML (login, principal, clientes, veiculos, agendamentos)
└── static/              # CSS, JS e demais arquivos estáticos
```

### Organização em camadas

- **`rotas.py`** — recebe as requisições, protege as rotas e converte erros em respostas JSON padronizadas (decorador `@tratar`).
- **`clientes.py`, `veiculos.py`, `agendamento.py`** — validações e regras de negócio.
- **`db.py`** — única camada que fala diretamente com o banco. Usa consultas parametrizadas (proteção contra SQL Injection).

---

## 🗄️ Modelo de dados

```
usuarios                clientes ──< veiculos ──< agendamentos >── servicos
```

| Tabela | Principais campos |
|---|---|
| `usuarios` | `id`, `nome`, `login` (único), `senha_hash` (bcrypt), `criado_em` |
| `clientes` | `id`, `nome`, `cpf_hash` (bcrypt), `telefone`, `email`, `endereco`, `criado_em` |
| `veiculos` | `id`, `cliente_id` (FK), `placa` (única), `marca`, `modelo`, `ano`, `cor` |
| `servicos` | `id`, `descricao`, `valor` |
| `agendamentos` | `id`, `veiculo_id` (FK), `servico_id` (FK), `data_agendamento`, `status`, `observacao` |

**Relacionamentos**

- Um **cliente** possui vários **veículos** (1:N).
- Um **veículo** possui vários **agendamentos** (1:N).
- Um **serviço** pode estar em vários **agendamentos** (1:N).

**Status do agendamento:** `AGENDADO` · `EM_ANDAMENTO` · `CONCLUIDO` · `CANCELADO`

> O Diagrama Entidade-Relacionamento (DER) está disponível em `der.png` / `der.pdf`.

---

## 🚀 Como executar

### 1. Pré-requisitos

- Python 3.10 ou superior
- MySQL 8 ou superior em execução

### 2. Instalar as dependências

```bash
pip install -r requirements.txt
```

> Recomenda-se usar um ambiente virtual (`python -m venv venv`).

### 3. Criar e popular o banco de dados

```bash
mysql -u root -p < db.sql
```

O script cria o banco, as tabelas e insere os dados de teste.

### 4. Configurar a conexão (opcional)

Por padrão, o sistema usa os valores abaixo. Para alterá-los, defina variáveis de ambiente:

| Variável | Padrão |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3306` |
| `DB_USER` | `root` |
| `DB_PASSWORD` | *(definida em `db.py`)* |
| `DB_NAME` | `saep_db_v1` |
| `SECRET_KEY` | `troque-esta-chave-em-producao` |

Exemplo (Linux/macOS):

```bash
export DB_PASSWORD="sua_senha"
export SECRET_KEY="uma-chave-secreta-forte"
```

Exemplo (Windows PowerShell):

```powershell
$env:DB_PASSWORD="sua_senha"
$env:SECRET_KEY="uma-chave-secreta-forte"
```

### 5. Testar a conexão

```bash
python testar_conexao.py
```

Saída esperada: `Conexão OK: {'banco': 'saep_db_v1', 'versao': '8.x.x'}`

### 6. Iniciar o sistema

```bash
python app.py
```

Acesse: **http://localhost:5000**

---

## 🔑 Dados de teste

**Usuários**

| Nome | Login | Senha |
|---|---|---|
| Administrador | `admin` | `admin123` |
| Carlos Mecânico | `carlos` | `carlos123` |
| Ana Atendente | `ana` | `ana12345` |

**CPFs dos clientes de exemplo** (úteis para testar a busca por CPF)

| Cliente | CPF |
|---|---|
| João da Silva | 529.982.247-25 |
| Maria Oliveira | 111.444.777-35 |
| Pedro Santos | 390.533.447-05 |

---

## 🔐 Segurança e LGPD

- **Senhas** armazenadas somente como hash bcrypt.
- **CPF** armazenado somente como hash bcrypt (nunca em texto puro). Como o hash não permite `LIKE`, a busca e a verificação de duplicidade comparam o CPF informado com cada hash.
- **Sessão com expiração** de 30 minutos; após esse tempo, páginas redirecionam para `/login?expirou=1` e a API responde `401`.
- **Cookies de sessão** com `HttpOnly` e `SameSite=Lax`.
- **Consultas SQL parametrizadas** em toda a camada de dados.
- **Mensagem de login genérica**, para não revelar se um usuário existe.
- **Integridade referencial:** não é possível excluir cliente com veículos nem veículo com agendamentos.

---

## 🌐 Rotas

### Páginas (exigem login, exceto `/login`)

| Rota | Descrição |
|---|---|
| `/` | Redireciona para `/principal` ou `/login` |
| `/login` | Tela de login |
| `/principal` | Tela principal |
| `/clientes` | Gerenciamento de clientes |
| `/veiculos` | Gerenciamento de veículos |
| `/agendamentos` | Gerenciamento de agendamentos |

### API JSON

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/login` | Autentica o usuário e inicia a sessão |
| POST | `/api/logout` | Encerra a sessão |
| GET | `/api/me` | Retorna o nome do usuário logado |
| GET | `/api/teste-conexao` | Testa a conexão com o banco |
| GET | `/api/clientes?q=` | Lista/busca clientes (nome, e-mail, telefone ou CPF) |
| POST | `/api/clientes` | Cadastra cliente |
| PUT | `/api/clientes/<id>` | Edita cliente |
| DELETE | `/api/clientes/<id>` | Exclui cliente |
| GET | `/api/veiculos` | Lista veículos (com nome do proprietário) |
| POST | `/api/veiculos` | Cadastra veículo |
| PUT | `/api/veiculos/<id>` | Edita veículo |
| DELETE | `/api/veiculos/<id>` | Exclui veículo |
| GET | `/api/servicos` | Lista serviços disponíveis |
| GET | `/api/agendamentos` | Lista agendamentos ordenados por data |
| POST | `/api/agendamentos` | Cria agendamento |
| PUT | `/api/agendamentos/<id>` | Atualiza data, status e observação |
| DELETE | `/api/agendamentos/<id>` | Exclui agendamento |

Todas as rotas `/api/*` (exceto login, logout e teste de conexão) retornam **401** quando a sessão está ausente ou expirada.

### Exemplo de login

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"login": "admin", "senha": "admin123"}'
```

---

## 📝 Regras de validação

**Clientes**
- Nome com no mínimo 3 caracteres.
- E-mail em formato válido (opcional).
- CPF com 11 dígitos, único entre os clientes. *(Validação acadêmica: verifica apenas a quantidade de dígitos, não os dígitos verificadores.)*
- Na edição, o CPF só é alterado se for informado.

**Veículos**
- Placa nos formatos antigo e Mercosul (ex.: `ABC1D23`), única.
- Marca e modelo obrigatórios.
- Ano entre 1950 e o ano atual + 1.
- Cliente proprietário obrigatório e já cadastrado.

**Agendamentos**
- Data/hora válida (formato ISO, ex.: `2026-11-03T09:00`).
- Veículo e serviço existentes.
- Status dentro de: `AGENDADO`, `EM_ANDAMENTO`, `CONCLUIDO`, `CANCELADO`.

---

## 📦 Entregas do desafio

| Nº | Entrega | Arquivo |
|---|---|---|
| 1 | Documentação de software | `documentacao.pdf` |
| 2 | Diagrama entidade-relacionamento | `der.png` / `der.pdf` |
| 3 | Script de criação e população do BD | `saep_db.sql` (`db.sql`) |
| 4 | Funcionalidade de login | `autenticacao.py`, `templates/login.html` |
| 5 | Funcionalidade principal | `templates/principal.html`, `rotas.py` |
| 6 | Gerenciamento de clientes | `clientes.py`, `templates/clientes.html` |
| 7 | Gerenciamento de veículos | `veiculos.py`, `templates/veiculos.html` |
| 8 | Gerenciamento de agendamentos | `agendamento.py`, `templates/agendamentos.html` |

---

## 👤 Denis

Desenvolvido por **[Rafaella Accorsi Bueno]** como parte do desafio *Oficina Mecânica*.
