# syntax=docker/dockerfile:1
FROM eclipse-temurin:21-jdk-noble AS build
WORKDIR /workspace/backend

COPY backend/ ./
COPY application.properties ../
COPY contracts/ ../contracts/

RUN --mount=type=cache,target=/root/.m2 \
    sh mvnw --batch-mode -Dmaven.test.skip=true package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/backend/target/backend-*.jar ./app.jar
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
