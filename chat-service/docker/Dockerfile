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

# Dev
FROM builder AS dev
CMD java -Xms1g -Xmx1g -Dspring.profiles.active=dev -jar build/libs/chat-service-0.0.1-SNAPSHOT.jar

FROM builder AS stage
CMD java -Xms1g -Xmx1g -Dspring.profiles.active=stage -jar build/libs/chat-service-0.0.1-SNAPSHOT.jar

FROM builder AS prod
CMD java -Xms1g -Xmx1g -Dspring.profiles.active=prod -jar build/libs/chat-service-0.0.1-SNAPSHOT.jar
