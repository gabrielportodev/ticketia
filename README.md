# TicketIA

O TicketIA recebe mensagens de clientes, registra um protocolo e processa a triagem em segundo plano. A API grava o atendimento e o evento de outbox na mesma transação. O publicador envia o evento ao RabbitMQ e o worker valida a classificação antes de encaminhar o atendimento para um departamento ou registrar a necessidade de revisão.

## Stack

- **Backend** — Java 21, Spring Boot, Spring Data JPA, PostgreSQL e Flyway.
- **Frontend** — Next.js, React, TypeScript, Tailwind CSS e shadcn/ui.
- **Triagem** — RabbitMQ para mensageria, Spring AI com Groq e JSON Schema para validação.

## Configuração

Configure o ambiente no `.env` da raiz. Na primeira configuração, crie esse arquivo a partir de [`.env.example`](.env.example). Use uma atribuição `NOME=valor` por linha, sem aspas, para que o mesmo arquivo funcione com Docker Compose, Spring e Next.js. Variáveis exportadas no terminal têm precedência. Os padrões do Spring ficam no [application.properties](application.properties) da raiz, que o Maven inclui no JAR.

| Variáveis | Uso |
| --- | --- |
| `TICKETIA_PORT` | Porta publicada pelo Docker Compose. |
| `TICKETIA_API_URL` | Destino que o Next.js usa fora do Docker. Dentro do Compose, ele usa `http://backend:8080`. |
| `TICKETIA_DB_*`, `TICKETIA_RABBITMQ_*` | Credenciais e conexões do PostgreSQL e RabbitMQ. Os valores de exemplo são para execução local. Os volumes existentes mantêm as credenciais com que foram inicializados. |
| `TICKETIA_AI_API_KEY`, `TICKETIA_GROQ_*` | Chave obrigatória para o worker e opções da Groq. |
| `TICKETIA_JAVA_OPTIONS` | Opções da JVM da API e do worker no Compose. Por padrão, o heap vai de 64 a 256 MiB e a JVM dimensiona seus pools para dois processadores. |

## Executar com Docker

Com Docker e o plugin Docker Compose v2 em execução, preencha `TICKETIA_AI_API_KEY` no `.env` e rode a partir da raiz do projeto. O Compose passa a chave ao worker em tempo de execução.

```sh
docker compose up --build -d
docker compose ps
```

O frontend publica a porta 3000 no loopback e encaminha `POST /api/tickets` à API Spring na rede do Compose. PostgreSQL, RabbitMQ, API/publicador e worker usam essa rede interna. O Compose aguarda os serviços de infraestrutura e as migrações da API antes de iniciar o worker e o frontend. Acesse o formulário em [localhost:3000](http://localhost:3000).

Para acompanhar o processamento, execute na raiz do projeto.

```sh
docker compose logs -f backend worker
```

Para parar a aplicação, execute `docker compose down` na raiz. Os volumes guardam o banco e os dados do RabbitMQ entre execuções.

## Executar sem Docker

Use Java 21, PostgreSQL 16 ou superior e Node.js 24 com npm. Execute cada bloco a partir da raiz do projeto.

### Backend

Crie o banco indicado no `.env`. Para apontar para uma instância local existente, defina `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` e `SPRING_DATASOURCE_PASSWORD` no mesmo arquivo. Inicie a API na porta 8080. O ponto de entrada é `BackendApplication`.

```sh
cd backend
sh mvnw spring-boot:run
```

Para registrar um atendimento, envie a mensagem à API.

```sh
curl -i http://localhost:8080/tickets \
  -H 'Content-Type: application/json' \
  -d '{"message":"Fui cobrado duas vezes."}'
```

A resposta `201 Created` traz `success: true`, uma mensagem em português e os campos `protocol`, `status` e `created_at` dentro de `data`. Mensagens ausentes ou em branco recebem `400 Bad Request`, com `success: false` e o motivo em `message`.

Para rodar também o publicador e o worker no mesmo processo, inicie o RabbitMQ com as credenciais do `.env`, configure a chave da Groq e rode a partir da raiz do projeto.

```sh
cd backend
sh mvnw spring-boot:run -Dspring-boot.run.profiles=publisher,worker
```

### Frontend

Em outro terminal, instale as dependências e inicie a interface. Acesse [localhost:3000](http://localhost:3000).

```sh
cd frontend
npm ci
npm run dev
```

O servidor Next.js usa `TICKETIA_API_URL` do `.env` da raiz. O destino padrão é `http://127.0.0.1:8080`.

## Migrações

Ao iniciar o backend, o Flyway aplica automaticamente as migrações pendentes no banco configurado. Os scripts de atendimentos, classificações e outbox ficam em [db/migration](backend/src/main/resources/db/migration).

## Contrato de triagem v1

O [schema de classificação](contracts/classification-v1.schema.json) exige categoria, prioridade, assunto e indicação de revisão. O atendimento começa como `PENDENTE_TRIAGEM`, passa para `ENCAMINHADO` quando uma classificação válida indica o setor e fica `EM_REVISAO` se a resposta for inválida ou pedir revisão. A fila `ticket.received.v1` recebe a identificação do evento, o tipo, a versão, o horário e o protocolo. A mensagem original fica no PostgreSQL.

## Testes e build

Os testes usam a conexão PostgreSQL definida no `.env` da raiz ou nas variáveis de ambiente da CI. O Flyway aplica as migrações pendentes ao iniciar. Cada teste de atendimento desfaz sua transação ao terminar.

```sh
cd backend
sh mvnw test
```

Para executar a suíte e gerar o JAR em `backend/target/`, troque `test` por `verify`. Ao executar o JAR diretamente com `java -jar backend/target/backend-0.0.1-SNAPSHOT.jar`, use a raiz como diretório de trabalho para carregar o `.env`.

Com PostgreSQL e RabbitMQ disponíveis, execute `sh mvnw test -Dticketia.test.messaging=true` em `backend` para incluir a integração da fila. Esse teste usa um classificador simulado e um schema temporário no PostgreSQL.

No frontend, `npm test` compila a aplicação e executa os arquivos `tests/*.test.mjs` com o executor de testes do Node.js. O teste verifica o idioma e o título principal no HTML gerado para a página inicial.

```sh
cd frontend
npm run format:check
npm run lint
npm test
```

Para gerar apenas o build do frontend, execute `npm run build` em `frontend`.

A cada push em qualquer branch, o GitHub Actions executa os testes do backend com Java 21, PostgreSQL 16 e RabbitMQ 4. O teste de mensageria usa um classificador simulado e dispensa chave da Groq. Quando o backend passa, a CI instala as dependências do frontend com Node.js 24 e verifica a formatação com Prettier, executa o lint, o build e os testes.
