# Builder
FROM asia-south1-docker.pkg.dev/nth-passage-421712/dev-ds-common/dev-ds-common:openjdk-19 AS builder
ARG application_dir="/application"
WORKDIR ${application_dir}
COPY . ./
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew
RUN ./gradlew :spotlessApply
RUN ./gradlew build -x test
# RUN wget https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar -O opentelemetry-javaagent.jar
ENV TZ="Asia/Kolkata"
EXPOSE 8080

# Builder
FROM builder AS dev
CMD java -Dspring.profiles.active=dev -jar build/libs/auth-service-0.0.1-SNAPSHOT.jar -Xms1g -Xmx1g

FROM builder AS stage
CMD java -Dspring.profiles.active=stage -jar build/libs/auth-service-0.0.1-SNAPSHOT.jar -Xms1g -Xmx1g

FROM builder AS prod
CMD java -Dspring.profiles.active=prod -jar build/libs/auth-service-0.0.1-SNAPSHOT.jar -Xms1g -Xmx1g
