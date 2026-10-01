package com.dental_stack.application;

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

public class RoutingDataSource extends AbstractRoutingDataSource {

    @Override
    protected Object determineCurrentLookupKey() {
        DatabaseType dbType = DatabaseContextHolder.get();
        // Return DEV as default if no context is set
        return dbType != null ? dbType : DatabaseType.DEV;
    }
}
