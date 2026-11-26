# TicketIA

## Sobre

O TicketIA registra mensagens de clientes, confirma o recebimento com um protocolo e usa IA para encaminhar os chamados por setor ou sinalizá-los para revisão. Na área do atendente, a equipe pode corrigir o encaminhamento e consultar o histórico.

<a id="contrato-de-triagem-v1"></a>

O worker consome o evento `ticket.received.v1` do RabbitMQ e valida categoria, prioridade, assunto e indicação de revisão. [Schema de classificação](contracts/classification-v1.schema.json)

## Stack

- **Backend** — Java 21, Spring Boot, PostgreSQL 16+ e Flyway.
- **Frontend** — Node.js 24, Next.js, React, TypeScript, Tailwind CSS e shadcn/ui.
- **Triagem** — RabbitMQ, Spring AI e Groq.

## Configuração

Na raiz do projeto, copie o arquivo de exemplo e preencha `TICKETIA_AI_API_KEY` com sua chave da Groq para rodar a triagem.

```sh
cp .env.example .env
```

Para acessar a área do atendente em `/staff`, configure `TICKETIA_STAFF_USERS` no `.env`. Substitua a senha deste exemplo de conta de revisão.

```dotenv
TICKETIA_STAFF_USERS=[{"username":"revisao","password":"troque-esta-senha","reviewer":true}]
```

## Docker

Com Docker Compose v2 instalado, execute o comando na raiz do projeto.

```sh
docker compose up --build -d
```

Abra [localhost:3000](http://localhost:3000). Para parar o ambiente, rode `docker compose down` na raiz.

## Sem Docker

Inicie PostgreSQL e RabbitMQ com os dados do `.env`. A partir da raiz, inicie a API e o worker pelo ponto de entrada `BackendApplication`. A API roda na porta 8080.

```sh
cd backend
sh mvnw spring-boot:run -Dspring-boot.run.profiles=publisher,worker
```

Em outro terminal, a partir da raiz, inicie o frontend e abra [localhost:3000](http://localhost:3000).

```sh
cd frontend
npm ci
npm run dev
```

## Testes

No diretório `backend/`, com PostgreSQL e RabbitMQ em execução, rode `sh mvnw test -Dticketia.test.messaging=true`. Para rodar a suíte sem a integração de mensageria, use `sh mvnw test`. Para gerar o JAR, use `sh mvnw package`.

No diretório `frontend/`, rode `npm run format:check`, `npm run lint` e `npm test`. O último comando inclui o build, que também pode ser executado com `npm run build`.
