package com.dentalstack.chat.entity;

import com.dentalstack.chat.dto.chat.AddChatRequest;
import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.List;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
@Setter
@Entity
@Table(name = "chat")
public class Chat extends BaseEntity {

    @Column(columnDefinition = "TEXT")
    private String message;

    private Long patientId;

    private Long doctorId;

    @Column(columnDefinition = "TEXT")
    private String imageName;

    private boolean messageRead;

    private String roleName;

    private String createdBy;

    private Boolean addedToChat;

    private boolean active;

    @Nullable
    @org.hibernate.annotations.Type(io.hypersistence.utils.hibernate.type.array.ListArrayType.class)
    @Column(name = "file_ids", columnDefinition = "bigint[]")
    private List<Long> fileIds;

    private Boolean popupDismissed;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode additionalData;

    public static Chat from(AddChatRequest request) {
        return Chat.builder()
                .message(request.getMessage())
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .imageName(request.getImageName())
                .messageRead(false)
                .roleName(request.getRoleName())
                .createdBy(request.getCreatedBy())
                .active(true)
                .popupDismissed(false)
                .build();
    }
}
