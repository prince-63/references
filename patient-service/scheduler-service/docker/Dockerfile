# Builder
FROM asia-south1-docker.pkg.dev/nth-passage-421712/dev-ds-common/dev-ds-common:openjdk-19 AS builder
ARG application_dir="/application"
WORKDIR ${application_dir}
COPY . ./
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew
RUN ./gradlew :scheduler-service:spotlessApply
RUN ./gradlew :scheduler-service:spotlessCheck
RUN ./gradlew :scheduler-service:assemble

ENV TZ="Asia/Kolkata"
EXPOSE 8080

# Builder
FROM builder AS dev
CMD java -Xms512m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError -Dnewrelic.environment=development -Dspring.profiles.active=dev -jar scheduler-service/build/libs/scheduler-service-0.0.1-SNAPSHOT.jar

FROM builder AS stage
CMD java -Xms512m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError -Dnewrelic.environment=staging -Dspring.profiles.active=stage -jar scheduler-service/build/libs/scheduler-service-0.0.1-SNAPSHOT.jar

FROM builder AS prod
CMD java -Xms512m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError -Dnewrelic.environment=production -Dspring.profiles.active=prod -jar scheduler-service/build/libs/scheduler-service-0.0.1-SNAPSHOT.jar