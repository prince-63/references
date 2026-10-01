package com.dentalstack.patient.feature.workflow.core.workflows.projection;

public interface AssigneeDistributionProjection {

    Long getAssigneeId();

    String getUserName();

    String getRole();

    Integer getCaseCount();

    Long getOverdueCount();

    String getAssigneeType();

    Double getPercentage();

    Integer getTotalTaskCount();

    Integer getNewCaseCount();

    Integer getPlanOutsourceCount();

    Integer getPlanningInHouseCount();

    Integer getProductionInHouseCount();

    Integer getProductionOutsourceCount();

    Integer getOngoingProductListCount();
}
