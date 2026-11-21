# TicketIA

O TicketIA é um projeto de triagem de atendimentos em desenvolvimento. A proposta é classificar mensagens de clientes com IA e encaminhá-las ao departamento responsável, com opção de revisão manual. O endpoint `POST /tickets` registra a mensagem no PostgreSQL e retorna um protocolo UUID com o status `PENDENTE_TRIAGEM`.

## Stack

- **Backend** — Java 21, Spring Boot, Spring Data JPA, PostgreSQL e Flyway.
- **Frontend** — Next.js, React, TypeScript, Tailwind CSS e shadcn/ui.
- **Integrações previstas** — RabbitMQ para a fila de triagem e Spring AI com OpenAI para a classificação.

## Como rodar

Use Java 21, PostgreSQL 16 ou superior e Node.js 20.9 ou superior com npm. Execute cada bloco a partir da raiz do projeto.

### Backend

Crie o banco `ticketia_db` no PostgreSQL. Na primeira execução, copie o exemplo de configuração e ajuste usuário, senha e endereço do banco no arquivo `application.properties`.

```sh
cd backend
cp -n src/main/resources/application.properties.example src/main/resources/application.properties
```

Se o arquivo já existir, copie para ele as linhas `spring.datasource.*` do exemplo. Inicie a API na porta 8080. O ponto de entrada é `BackendApplication`.

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

### Frontend

Em outro terminal, instale as dependências e inicie a interface. Acesse [localhost:3000](http://localhost:3000).

```sh
cd frontend
npm ci
npm run dev
```

## Migrações

Ao iniciar o backend, o Flyway aplica automaticamente as migrações pendentes no banco configurado. A migração inicial cria a tabela `tickets`. Os scripts ficam em [db/migration](backend/src/main/resources/db/migration).

## Testes e build

Os testes usam a mesma conexão PostgreSQL definida em `backend/src/main/resources/application.properties`. O Flyway aplica as migrações pendentes ao iniciar. Cada teste de atendimento desfaz sua transação ao terminar.

```sh
cd backend
sh mvnw test
```

Para executar a suíte e gerar o JAR em `backend/target/`, troque `test` por `verify`.

No frontend, `npm test` compila a aplicação e executa os arquivos `tests/*.test.mjs` com o executor de testes do Node.js. O teste verifica o idioma e o título principal no HTML gerado para a página inicial.

```sh
cd frontend
npm run lint
npm test
```

A cada push em qualquer branch, o GitHub Actions executa os testes do backend com Java 21, PostgreSQL 16 e RabbitMQ 4. O teste de mensageria usa um classificador simulado e dispensa chave da Groq. Quando o backend passa, a CI instala as dependências do frontend com Node.js 24 e executa lint, build e testes.
