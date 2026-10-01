package com.dentalstack.patient.feature.workflow.activity.mapper;

import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.InternalWorkflowEnum;

public class ActivityStatusMapper {

    public static String toReadableString(InternalWorkflowEnum workflowEnum) {
        if (workflowEnum == null) {
            return null;
        }
        String[] parts = workflowEnum.name().split("_");
        StringBuilder readable = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].isEmpty()) continue;
            readable.append(parts[i].substring(0, 1).toUpperCase())
                    .append(parts[i].substring(1).toLowerCase());
            if (i < parts.length - 1) {
                readable.append(" ");
            }
        }
        return readable.toString();
    }

    public static String toReadableString(String workflowName) {
        if (workflowName == null) {
            return null;
        }
        String[] parts = workflowName.split("_");
        StringBuilder readable = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].isEmpty()) continue;
            readable.append(parts[i].substring(0, 1).toUpperCase())
                    .append(parts[i].substring(1).toLowerCase());
            if (i < parts.length - 1) {
                readable.append(" ");
            }
        }
        return readable.toString();
    }
}
