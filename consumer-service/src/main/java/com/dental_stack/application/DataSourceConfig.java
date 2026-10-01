package com.dental_stack.application;

import com.zaxxer.hikari.HikariDataSource;
import java.util.HashMap;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class DataSourceConfig {

    @Bean(name = "devDataSource")
    @ConfigurationProperties("app.datasource.dev")
    public HikariDataSource devDataSource() {
        HikariDataSource ds = DataSourceBuilder.create().type(HikariDataSource.class).build();
        ds.setInitializationFailTimeout(-1);
        return ds;
    }

    @Bean(name = "stageDataSource")
    @ConfigurationProperties("app.datasource.stage")
    public HikariDataSource stageDataSource() {
        HikariDataSource ds = DataSourceBuilder.create().type(HikariDataSource.class).build();
        ds.setInitializationFailTimeout(-1);
        return ds;
    }

    @Bean(name = "prodDataSource")
    @ConfigurationProperties("app.datasource.prod")
    public HikariDataSource prodDataSource() {
        HikariDataSource ds = DataSourceBuilder.create().type(HikariDataSource.class).build();
        ds.setInitializationFailTimeout(-1);
        return ds;
    }

    @Primary
    @Bean(name = "routingDataSource")
    public DataSource routingDataSource(
            @Qualifier("devDataSource") DataSource devDataSource,
            @Qualifier("stageDataSource") DataSource stageDataSource,
            @Qualifier("prodDataSource") DataSource prodDataSource) {

        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put(DatabaseType.DEV, devDataSource);
        targetDataSources.put(DatabaseType.STAGE, stageDataSource);
        targetDataSources.put(DatabaseType.PROD, prodDataSource);

        RoutingDataSource routingDataSource = new RoutingDataSource();
        routingDataSource.setTargetDataSources(targetDataSources);
        routingDataSource.setDefaultTargetDataSource(devDataSource);
        routingDataSource.afterPropertiesSet();
        return routingDataSource;
    }
}
