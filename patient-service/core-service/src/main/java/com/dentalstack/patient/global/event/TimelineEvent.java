package com.dentalstack.patient.global.event;

import com.dentalstack.patient.feature.doctor.entity.Organization;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class TimelineEvent extends ApplicationEvent {

    private final Long userId;
    private final UserType userType;
    private final Long forUserId;
    private final UserType forUserType;
    private final EventType eventType;
    private final EventMetadata metadata;

    private final UserProfile orgUserProfile;
    private final Organization organization;
    private final Long profileId;

    private TimelineEvent(Builder builder) {
        super(builder.source);
        this.userId = builder.userId;
        this.userType = builder.userType;
        this.forUserId = builder.forUserId;
        this.forUserType = builder.forUserType;
        this.eventType = builder.eventType;
        this.metadata = builder.metadata;
        this.orgUserProfile = builder.orgUserProfile;
        this.organization = builder.organization;
        this.profileId = builder.profileId;
    }

    public static Builder builder(Object source) {
        return new Builder(source);
    }

    public static class Builder {
        private final Object source;
        private Long userId;
        private UserType userType;
        private Long forUserId;
        private UserType forUserType;
        private EventType eventType;
        private EventMetadata metadata;
        private UserProfile orgUserProfile;
        private Organization organization;
        private Long profileId;

        private Builder(Object source) {
            this.source = source;
        }

        public Builder userId(Long val) {
            userId = val;
            return this;
        }

        public Builder userType(UserType val) {
            userType = val;
            return this;
        }

        public Builder forUserId(Long val) {
            forUserId = val;
            return this;
        }

        public Builder forUserType(UserType val) {
            forUserType = val;
            return this;
        }

        public Builder eventType(EventType val) {
            eventType = val;
            return this;
        }

        public Builder metadata(EventMetadata val) {
            metadata = val;
            return this;
        }

        public Builder orgUserProfile(UserProfile val) {
            orgUserProfile = val;
            return this;
        }

        public Builder organization(Organization val) {
            organization = val;
            return this;
        }

        public Builder profileId(Long val) {
            profileId = val;
            return this;
        }

        public TimelineEvent build() {
            return new TimelineEvent(this);
        }
    }
}
