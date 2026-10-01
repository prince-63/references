package com.dentalstack.patient.feature.order.service;

import com.dentalstack.patient.feature.order.dto.CreateShippingDetailsRequest;
import com.dentalstack.patient.feature.order.dto.ShippingDetailsResponse;
import com.dentalstack.patient.feature.order.dto.UpdateShippingDetailsRequest;

public interface ShippingDetailsService {
    ShippingDetailsResponse createShippingDetails(CreateShippingDetailsRequest request);

    ShippingDetailsResponse updateShippingDetails(UpdateShippingDetailsRequest request);

    ShippingDetailsResponse makeShippingDetailsDefault(Long shippingId, Long customerProfileId);

    ShippingDetailsResponse getShippingDetailsById(Long shippingId);

    ShippingDetailsResponse getDefaultShipping(Long profileId, Long customerProfileId);
}
