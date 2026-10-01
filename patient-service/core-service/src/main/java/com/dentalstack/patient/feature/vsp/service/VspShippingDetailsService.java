package com.dentalstack.patient.feature.vsp.service;

import com.dentalstack.patient.feature.vsp.dto.request.CreateVspShippingDetailsRequest;
import com.dentalstack.patient.feature.vsp.dto.request.UpdateVspShippingDetailsRequest;
import com.dentalstack.patient.feature.vsp.dto.response.VspShippingDetailsResponse;
import java.util.List;

public interface VspShippingDetailsService {
    VspShippingDetailsResponse createShippingDetails(CreateVspShippingDetailsRequest request);

    VspShippingDetailsResponse updateShippingDetails(UpdateVspShippingDetailsRequest request);

    VspShippingDetailsResponse getDefaultShippingDetails(Long profileId);

    VspShippingDetailsResponse getDefaultShippingDetails(Long profileId, Long customerProfileId);

    List<VspShippingDetailsResponse> getShippingDetailsByProfile(Long profileId);

    VspShippingDetailsResponse getShippingDetailsById(String shippingId);
}
