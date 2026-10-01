package com.dentalstack.patient.feature.vsp.service;

import com.dentalstack.patient.feature.vsp.dto.request.CreateVspBillingDetailsRequest;
import com.dentalstack.patient.feature.vsp.dto.request.UpdateVspBillingDetailsRequest;
import com.dentalstack.patient.feature.vsp.dto.response.VspBillingDetailsResponse;
import java.util.List;

public interface VspBillingDetailsService {
    VspBillingDetailsResponse createBillingDetails(CreateVspBillingDetailsRequest request);

    VspBillingDetailsResponse updateBillingDetails(UpdateVspBillingDetailsRequest request);

    VspBillingDetailsResponse getDefaultBillingDetails(Long profileId);

    VspBillingDetailsResponse getDefaultBillingDetails(Long profileId, Long customerProfileId);

    List<VspBillingDetailsResponse> getBillingDetailsByProfile(Long profileId);

    VspBillingDetailsResponse getBillingDetailsById(String billingId);
}
