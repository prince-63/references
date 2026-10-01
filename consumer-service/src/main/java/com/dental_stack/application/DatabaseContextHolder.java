package com.dental_stack.application;

public class DatabaseContextHolder {

    private static final ThreadLocal<DatabaseType> CONTEXT = new ThreadLocal<>();

    public static void set(DatabaseType dbType) {
        CONTEXT.set(dbType);
    }

    public static DatabaseType get() {
        return CONTEXT.get();
    }

    public static void clear() {
        CONTEXT.remove();
    }
}
