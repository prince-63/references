# Builder
FROM eclipse-temurin:21-jdk AS builder
ARG application_dir="/application"
WORKDIR ${application_dir}
COPY . ./
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew
RUN ./gradlew :spotlessApply
ENV GRADLE_OPTS="-Dorg.gradle.java.installations.auto-download=true"
RUN ./gradlew build -x test
ENV TZ="Asia/Kolkata"
EXPOSE 8080

# Builder
FROM builder AS dev
CMD java -Dspring.profiles.active=dev -jar build/libs/consumer-service-0.0.1-SNAPSHOT.jar -Xms1g -Xmx1g

FROM builder AS stage
CMD java -Dspring.profiles.active=stage -jar build/libs/consumer-service-0.0.1-SNAPSHOT.jar -Xms1g -Xmx1g

FROM builder AS prod
CMD java -Dspring.profiles.active=prod -jar build/libs/consumer-service-0.0.1-SNAPSHOT.jar -Xms1g -Xmx1g
