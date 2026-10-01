package com.dentalstack.chat.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import io.swagger.v3.core.jackson.ModelResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

@Configuration
public class SpringDocConfig {

    /**
     * SpringDoc does not follow spring jackson naming convention and by default it shows property
     * naming in upper camel case. To fix this we need this configuration.
     *
     * @see <a
     *     href="https://stackoverflow.com/questions/67192746/how-to-change-namingstrategy-in-springdoc">Stackoverflow</a>
     */
    @Bean
    public ModelResolver modelResolver(ObjectMapper objectMapper) {
        return new ModelResolver(Jackson2ObjectMapperBuilder.json()
                .propertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
                .build());
    }
}
