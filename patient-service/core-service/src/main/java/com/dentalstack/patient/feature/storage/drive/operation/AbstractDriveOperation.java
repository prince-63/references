package com.dentalstack.patient.feature.storage.drive.operation;

import com.dentalstack.patient.feature.storage.drive.optimize.OptimizedDrivePathResolver;
import com.google.api.services.drive.Drive;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public abstract class AbstractDriveOperation<T, R> implements DriveOperation<T, R> {

    protected final OptimizedDrivePathResolver pathResolver;

    @Override
    public R execute(Drive drive, T context) throws Exception {
        validate(context);
        logStart(context);

        try {
            R result = doExecute(drive, context);
            logSuccess(context, result);
            return result;
        } catch (Exception e) {
            logError(context, e);
            throw e;
        }
    }

    protected abstract R doExecute(Drive drive, T context) throws Exception;

    protected void logStart(T context) {
        log.debug("Starting operation: {} with context: {}", getOperationName(), context);
    }

    protected void logSuccess(T context, R result) {
        log.info("Operation {} completed successfully", getOperationName());
    }

    protected void logError(T context, Exception error) {
        log.error("Operation {} failed: {}", getOperationName(), error.getMessage(), error);
    }

    protected String getOperationName() {
        return this.getClass().getSimpleName();
    }
}
