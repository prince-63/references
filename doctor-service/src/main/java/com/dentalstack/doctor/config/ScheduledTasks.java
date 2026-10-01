package com.dentalstack.doctor.config;

import com.dentalstack.doctor.service.SchedulerService;
import java.text.SimpleDateFormat;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTasks.class);

    private final SchedulerService schedulerService;

    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");
}
