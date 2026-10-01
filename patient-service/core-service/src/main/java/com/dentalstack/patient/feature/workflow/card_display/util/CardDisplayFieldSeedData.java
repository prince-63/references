package com.dentalstack.patient.feature.workflow.card_display.util;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.workflow.card_display.entity.CardDisplayField;
import com.dentalstack.patient.feature.workflow.card_display.enums.DisplayTypeEnum;
import java.util.ArrayList;
import java.util.List;

public class CardDisplayFieldSeedData {

    public static List<CardDisplayField> getSeedFields(UserProfile userProfile) {
        List<CardDisplayField> fields = new ArrayList<>();

        fields.add(CardDisplayField.builder()
                .fieldKey("patient_name")
                .label("Patient Name")
                .enabled(false)
                .position(1)
                .displayType(DisplayTypeEnum.TEXT)
                .sampleValue("John Doe")
                .showInPreview(true)
                .metadata(null)
                .build());

        fields.add(CardDisplayField.builder()
                .fieldKey("gender")
                .label("Gender")
                .enabled(true)
                .position(2)
                .displayType(DisplayTypeEnum.BADGE)
                .sampleValue("Male")
                .showInPreview(true)
                .metadata(null)
                .build());

        fields.add(CardDisplayField.builder()
                .fieldKey("age")
                .label("Age")
                .enabled(true)
                .position(3)
                .displayType(DisplayTypeEnum.TEXT)
                .sampleValue("29")
                .showInPreview(true)
                .metadata(null)
                .build());

        fields.add(CardDisplayField.builder()
                .fieldKey("patient_id")
                .label("Patient ID")
                .enabled(true)
                .position(4)
                .displayType(DisplayTypeEnum.TEXT)
                .sampleValue("P-1001")
                .showInPreview(true)
                .metadata(null)
                .build());

        fields.add(CardDisplayField.builder()
                .fieldKey("created_by")
                .label("Created By")
                .enabled(true)
                .position(5)
                .displayType(DisplayTypeEnum.TEXT)
                .sampleValue(userProfile.getUser().fullNameWithSalutation())
                .showInPreview(true)
                .metadata(null)
                .build());

        fields.add(CardDisplayField.builder()
                .fieldKey("created_on")
                .label("Created On")
                .enabled(true)
                .position(6)
                .displayType(DisplayTypeEnum.TEXT)
                .sampleValue("01-SEP-2025")
                .showInPreview(true)
                .metadata(null)
                .build());

        fields.add(CardDisplayField.builder()
                .fieldKey("product")
                .label("Product")
                .enabled(true)
                .position(7)
                .displayType(DisplayTypeEnum.BADGE)
                .sampleValue("Aligner Pro")
                .showInPreview(true)
                .metadata(null)
                .build());

        fields.add(CardDisplayField.builder()
                .fieldKey("follow_up_date")
                .label("Follow-up Date")
                .enabled(true)
                .position(8)
                .displayType(DisplayTypeEnum.TEXT)
                .sampleValue("01-SEP-2025")
                .showInPreview(true)
                .metadata(null)
                .build());

        fields.add(CardDisplayField.builder()
                .fieldKey("case_type")
                .label("Case Type")
                .enabled(true)
                .position(9)
                .displayType(DisplayTypeEnum.BADGE)
                .sampleValue("New Case")
                .showInPreview(true)
                .metadata(null)
                .build());

        fields.add(CardDisplayField.builder()
                .fieldKey("assignee")
                .label("Assignee")
                .enabled(true)
                .position(10)
                .displayType(DisplayTypeEnum.BADGE)
                .sampleValue("Dr. Adams")
                .showInPreview(true)
                .metadata(null)
                .build());

        fields.add(CardDisplayField.builder()
                .fieldKey("clinic")
                .label("Clinic")
                .enabled(true)
                .position(11)
                .displayType(DisplayTypeEnum.TEXT)
                .sampleValue("Smile Dental Clinic")
                .showInPreview(true)
                .metadata(null)
                .build());

        fields.add(CardDisplayField.builder()
                .fieldKey("customer_name")
                .label("Customer")
                .enabled(true)
                .position(11)
                .displayType(DisplayTypeEnum.TEXT)
                .sampleValue("Dr. John Doe")
                .showInPreview(true)
                .metadata(null)
                .build());

        return fields;
    }
}
