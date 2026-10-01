package com.dental_stack.files.move_file.config;

import com.dental_stack.application.DatabaseContextHolder;
import com.dental_stack.application.DatabaseType;
import com.dental_stack.exception.file.FileMoveException;
import com.dental_stack.files.common.services.FileService;
import com.dental_stack.files.move_file.dto.MoveFileChunkMessage;
import java.util.function.Consumer;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
@AllArgsConstructor
public class StageMoveFileConfig {
    private final FileService fileService;

    @Bean
    public Consumer<MoveFileChunkMessage> stageMoveFileConsumer() {
        return message -> {
            log.info(
                    "Job {} | Profile {} | Files {}",
                    message.getJobId(),
                    message.getProfileId(),
                    message.getFileIds().size());
            try {
                DatabaseContextHolder.set(DatabaseType.STAGE);
                fileService.moveFile(message.getProfileId(), message.getFileIds());
                log.info(
                        "Successfully moved files | Job {} | Profile {} | Files {}",
                        message.getJobId(),
                        message.getProfileId(),
                        message.getFileIds().size());
            } catch (Exception e) {
                log.error(
                        "Failed to move files | Job {} | Profile {} | Files {} | Error: {}",
                        message.getJobId(),
                        message.getProfileId(),
                        message.getFileIds().size(),
                        e.getMessage(),
                        e);
                throw new FileMoveException(message.getProfileId(), message.getFileIds().size(), e);
            } finally {
                DatabaseContextHolder.clear();
            }
        };
    }
}
