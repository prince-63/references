package com.dentalstack.patient.feature.workflow.core.task_tracker.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class NoPlansToApproveException extends BusinessException {

    public NoPlansToApproveException(
            long draft,
            long inProgress,
            long sentForApproval,
            long pendingApproval,
            long approved,
            long active,
            long archived,
            long rePlan,
            long deactivated) {
        super(
                BusinessErrorCode.NO_PLANS_TO_APPROVE,
                buildMessage(
                        draft,
                        inProgress,
                        sentForApproval,
                        pendingApproval,
                        approved,
                        active,
                        archived,
                        rePlan,
                        deactivated));
    }

    private static String buildMessage(
            long draft,
            long inProgress,
            long sentForApproval,
            long pendingApproval,
            long approved,
            long active,
            long archived,
            long rePlan,
            long deactivated) {
        return String.format(
                "This case cannot be moved to APPROVED because there are no treatment plans pending review.\n\n"
                        + "Summary of plans:\n"
                        + "📝 %d Draft | 🔄 %d In Progress | 📤 %d Sent for Approval | ⏳ %d Pending Approval | "
                        + "✅ %d Approved | ⚡ %d Active | 📦 %d Archived | 🔁 %d Re-Plan | ❌ %d Deactivated",
                draft, inProgress, sentForApproval, pendingApproval, approved, active, archived, rePlan, deactivated);
    }
}
