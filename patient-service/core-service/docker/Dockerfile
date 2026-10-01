# Builder
FROM asia-south1-docker.pkg.dev/nth-passage-421712/dev-ds-common/dev-ds-common:openjdk-19 AS builder
ARG application_dir="/application"
WORKDIR ${application_dir}
COPY . ./
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew
RUN ./gradlew :core-service:spotlessApply
RUN ./gradlew :core-service:spotlessCheck
RUN ./gradlew :core-service:assemble
# RUN wget https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar -O opentelemetry-javaagent.jar

ENV TZ="Asia/Kolkata"
EXPOSE 8080

# Runner
FROM builder AS dev
CMD java -Xms512m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError -Dspring.profiles.active=dev -jar core-service/build/libs/core-service-0.0.1-SNAPSHOT.jar

FROM builder AS stage
CMD java -Xms768m -Xmx1024m -XX:MaxMetaspaceSize=384m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError -Dspring.profiles.active=stage -jar core-service/build/libs/core-service-0.0.1-SNAPSHOT.jar

FROM builder AS prod
CMD java -Xms768m -Xmx1024m -XX:MaxMetaspaceSize=384m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError -Dspring.profiles.active=prod -jar core-service/build/libs/core-service-0.0.1-SNAPSHOT.jar