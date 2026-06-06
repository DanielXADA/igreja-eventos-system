# Sistema de Gerenciamento de Eventos para Igrejas

## Sobre o projeto

Este projeto foi desenvolvido para a disciplina de Projeto de Banco de Dados.

A proposta foi criar um sistema voltado para igrejas, com o objetivo de facilitar a organização de eventos e atividades internas.

O sistema permite cadastrar eventos, usuários, locais, categorias, inscrições, voluntários, ministérios, doações, comentários, notícias e notificações.

Também foram implementadas funções de login, controle de acesso, check-in de participantes, consultas específicas e relatórios utilizando agregações do MongoDB.

## Objetivo

O objetivo principal do sistema é centralizar informações que normalmente ficam separadas em planilhas, anotações ou grupos de mensagens.

Com o sistema, a igreja consegue organizar:

* Eventos e congressos.
* Inscrições dos participantes.
* Controle de presença por check-in.
* Locais onde os eventos serão realizados.
* Equipes de voluntários.
* Ministérios.
* Doações e arrecadações.
* Comentários e avaliações.
* Notícias e notificações.

## Tecnologias utilizadas

Foram utilizadas as seguintes tecnologias:

* Node.js
* Express
* MongoDB
* Mongoose
* JavaScript
* HTML
* CSS
* JSON Web Token
* bcryptjs
* Postman
* MongoDB Compass

## Organização do projeto

```text
projeto/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── index.html
    ├── dashboard.html
    ├── script.js
    └── dashboard.js
```

O backend contém toda a parte de API, conexão com o banco de dados, regras de negócio, autenticação e consultas.

O frontend contém as telas de login, cadastro e dashboard do sistema.

## Coleções utilizadas

O banco de dados possui as seguintes coleções:

1. usuarios
2. eventos
3. categorias
4. locais
5. inscricoes
6. comentarios
7. ministerios
8. voluntarios
9. doacoes
10. notificacoes
11. noticias

Com isso, o projeto atende ao requisito de possuir pelo menos 10 coleções principais.

## Exemplos de documentos

### Usuário

```json
{
  "nome": "Administrador Principal",
  "email": "admin@igrejanova.com",
  "senha": "senha criptografada",
  "tipo": "admin",
  "telefone": "91999999999"
}
```

### Local

```json
{
  "nome": "Templo Principal",
  "capacidade": 500,
  "endereco": {
    "rua": "Rua Central",
    "numero": "100",
    "bairro": "Centro",
    "cidade": "Belém",
    "estado": "PA",
    "cep": "66000-000"
  },
  "ativo": true
}
```

### Evento

```json
{
  "titulo": "Congresso de Jovens",
  "descricao": "Congresso anual da igreja",
  "categoria": "ID_DA_CATEGORIA",
  "local": "ID_DO_LOCAL",
  "data": "2026-07-20T19:00:00.000Z",
  "capacidade": 300,
  "inscricoesAbertas": true,
  "status": "Confirmado"
}
```

### Inscrição

```json
{
  "usuario": "ID_DO_USUARIO",
  "evento": "ID_DO_EVENTO",
  "status": "confirmado",
  "checkIn": {
    "realizado": false,
    "data": null
  }
}
```

## Decisões de modelagem

O MongoDB foi escolhido porque trabalha com documentos em formato semelhante a JSON, o que facilita a organização dos dados.

Algumas informações foram armazenadas diretamente dentro dos documentos. Um exemplo é o endereço do local, que fica dentro do campo `endereco`.

Outras informações foram relacionadas por meio de `ObjectId`.

Exemplos:

* Um evento possui uma categoria.
* Um evento possui um local.
* Uma inscrição pertence a um usuário e a um evento.
* Um comentário pertence a um usuário e a um evento.
* Um usuário pode estar relacionado a um ministério.

Também foi criado um índice na coleção de inscrições para impedir que o mesmo usuário se inscreva duas vezes no mesmo evento.

As senhas dos usuários são armazenadas de forma criptografada utilizando bcryptjs.

## Operações CRUD

As coleções possuem operações de criação, leitura, atualização e exclusão.

Os principais métodos HTTP utilizados foram:

* `POST` para criar registros.
* `GET` para consultar registros.
* `PUT` e `PATCH` para atualizar registros.
* `DELETE` para excluir registros.

Exemplo das rotas de eventos:

```text
POST   /api/eventos
GET    /api/eventos
GET    /api/eventos/:id
PUT    /api/eventos/:id
DELETE /api/eventos/:id
```

Esse padrão também é utilizado nas demais coleções do sistema.

## Consultas implementadas

Foram criadas cinco consultas diferentes, conforme solicitado no trabalho.

### 1. Consulta simples por campo

Busca eventos por categoria:

```text
GET /api/consultas/categoria/:categoriaId
```

Essa consulta procura eventos que possuam uma categoria específica.

### 2. Consulta com operador de comparação

Busca eventos futuros:

```text
GET /api/consultas/proximos
```

Foi utilizado o operador `$gte` para buscar eventos cuja data seja maior ou igual à data atual.

```javascript
{
  data: {
    $gte: new Date()
  }
}
```

### 3. Consulta com múltiplas condições

Busca eventos com inscrições abertas e capacidade maior que 100 pessoas:

```text
GET /api/consultas/ativos-grandes
```

Foram utilizados os operadores `$and` e `$gt`.

### 4. Consulta com campo aninhado

Busca locais pela cidade:

```text
GET /api/consultas/cidade/Belém
```

A consulta utiliza o campo:

```text
endereco.cidade
```

Esse campo fica dentro do objeto `endereco` da coleção de locais.

### 5. Consulta com expressão regular

Busca eventos por parte do título:

```text
GET /api/consultas/buscar?busca=congresso
```

Foram utilizados os operadores `$regex` e `$options`.

Essa consulta permite encontrar eventos mesmo quando o usuário digita apenas parte do título.

## Pipelines de agregação

Foram criados três relatórios utilizando pipelines de agregação do MongoDB.

### Participantes por evento

```text
GET /api/relatorios/participantes
```

Esse relatório conta quantos participantes estão inscritos em cada evento.

Foram utilizados operadores como:

* `$match`
* `$group`
* `$lookup`
* `$unwind`
* `$project`
* `$sort`

### Média de avaliações por categoria

```text
GET /api/relatorios/media-categoria
```

Esse relatório calcula a média das avaliações dos eventos agrupadas por categoria.

Foram utilizados operadores como:

* `$match`
* `$lookup`
* `$unwind`
* `$group`
* `$avg`
* `$project`
* `$sort`

### Eventos com mais comentários

```text
GET /api/relatorios/engajados
```

Esse relatório mostra os eventos que possuem maior quantidade de comentários.

Foram utilizados operadores como:

* `$match`
* `$group`
* `$lookup`
* `$unwind`
* `$project`
* `$sort`

## Login e autenticação

O sistema possui login utilizando JSON Web Token.

Rota de login:

```text
POST /api/usuarios/login
```

Exemplo de dados enviados:

```json
{
  "email": "admin@igrejanova.com",
  "senha": "admin123456"
}
```

Após o login, a API retorna um token.

Nas rotas protegidas, esse token deve ser enviado no cabeçalho:

```text
Authorization: Bearer TOKEN
```

Também foi implementado controle de acesso de acordo com o tipo do usuário.

Os tipos utilizados são:

* membro
* voluntario
* lider
* pastor
* admin

## Configuração do arquivo `.env`

Dentro da pasta `backend`, deve ser criado um arquivo chamado `.env`.

Exemplo:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/igreja-eventos
JWT_SECRET=igreja_eventos_chave_secreta
JWT_EXPIRES_IN=8h
```

Esse arquivo guarda configurações importantes do sistema e não deve ser enviado para repositórios públicos.

## Como executar o projeto

### Requisitos

Antes de iniciar, é necessário instalar:

* Node.js
* MongoDB Community Server
* MongoDB Compass, opcionalmente
* Visual Studio Code
* Postman, opcionalmente

### Instalar as dependências

Abra o terminal dentro da pasta `backend` e execute:

```bash
npm install
```

### Iniciar o backend

Para executar em modo de desenvolvimento:

```bash
npm run dev
```

Também é possível executar com:

```bash
npm start
```

O backend será iniciado no endereço:

```text
http://localhost:3000
```

## Como executar o frontend

Abra a pasta `frontend` no Visual Studio Code.

Com a extensão Live Server instalada, clique com o botão direito no arquivo `index.html` e escolha:

```text
Open with Live Server
```

Normalmente, o frontend será aberto em:

```text
http://127.0.0.1:5500
```

## Testes realizados

As APIs foram testadas utilizando o Postman.

Também foi utilizado o MongoDB Compass para verificar os registros diretamente no banco de dados.

Durante os testes foram realizadas operações de:

* Cadastro.
* Consulta.
* Atualização.
* Exclusão.
* Login.
* Controle de permissões.
* Inscrição em eventos.
* Check-in.
* Consultas específicas.
* Relatórios com agregações.

## Apresentação

Na apresentação do projeto serão demonstrados:

* Funcionamento geral do sistema.
* Cadastro de registros.
* Listagem de dados.
* Atualização de registros.
* Exclusão de registros.
* Alterações aparecendo no MongoDB Compass.
* Cinco consultas diferentes.
* Três pipelines de agregação.
* Login e autenticação.
* Inscrição e check-in de participantes.

## Considerações finais

O projeto permitiu aplicar na prática conceitos de banco de dados NoSQL, criação de APIs, relacionamentos entre coleções, consultas e agregações.

O sistema ainda pode receber novas funcionalidades no futuro, mas a versão atual já atende aos principais requisitos definidos para o trabalho.
