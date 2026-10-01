package com.dentalstack.patient.feature.reminder.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class PushNotificationReminderChannelMetadata extends ReminderChannelMetadata implements Serializable {
    private String mobileNo;
    private int notificationIndex;
    private String title;
    private Long patientId;
    private String email;

    @JsonCreator
    public PushNotificationReminderChannelMetadata(
            @JsonProperty("mobileNo") String mobileNo,
            @JsonProperty("notificationIndex") int notificationIndex,
            @JsonProperty("title") String title,
            @JsonProperty("patientId") Long patientId,
            @JsonProperty("email") String email) {
        super(ReminderChannelMetadataType.PUSH_NOTIFICATION);
        this.mobileNo = mobileNo;
        this.notificationIndex = notificationIndex;
        this.title = title;
        this.patientId = patientId;
        this.email = email;
    }
}
