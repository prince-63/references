package com.dentalstack.patient.global.event;

import com.dentalstack.patient.feature.timeline.service.TimelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TimelineEventListener {

    private final TimelineService timelineService;

    @Async("timelineEventExecutor")
    @EventListener
    public void handleTimelineEvent(TimelineEvent event) {
        try {
            if (event.getOrgUserProfile() != null && event.getOrganization() != null) {
                timelineService.addEvent(
                        event.getUserId(),
                        event.getUserType(),
                        event.getForUserId(),
                        event.getForUserType(),
                        event.getEventType(),
                        event.getMetadata(),
                        event.getOrgUserProfile(),
                        event.getOrganization());
            } else if (event.getProfileId() != null) {
                timelineService.addEvent(
                        event.getUserId(),
                        event.getUserType(),
                        event.getForUserId(),
                        event.getForUserType(),
                        event.getEventType(),
                        event.getMetadata(),
                        event.getProfileId());
            } else {
                timelineService.addEvent(
                        event.getUserId(),
                        event.getUserType(),
                        event.getForUserId(),
                        event.getForUserType(),
                        event.getEventType(),
                        event.getMetadata());
            }
            log.debug(
                    "Timeline event persisted: type={}, userId={}, forUserId={}",
                    event.getEventType(),
                    event.getUserId(),
                    event.getForUserId());
        } catch (Exception e) {
            log.error(
                    "Failed to persist timeline event: type={}, userId={}, forUserId={}",
                    event.getEventType(),
                    event.getUserId(),
                    event.getForUserId(),
                    e);
        }
    }
}
