package com.dentalstack.doctor.dto.event;

import com.dentalstack.doctor.metadata.event.EventMetadata;
import com.dentalstack.doctor.metadata.event.EventMetadataType;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class DoctorInvitationReceivedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String practiceName;
    private String orgName;
    private String doctorRole;

    @JsonCreator
    public DoctorInvitationReceivedEventMetadata(String practiceName, String orgName, String doctorRole) {
        super(EventMetadataType.DOCTOR_INVITATION_RECEIVED);
        this.practiceName = practiceName;
        this.orgName = orgName;
        this.doctorRole = doctorRole;
    }
}
