package com.dentalstack.patient.feature.order.util;

import com.dentalstack.patient.feature.order.dto.ShippingDetails;
import com.dentalstack.patient.feature.order.dto.ShippingDetailsRequest;
import com.dentalstack.patient.feature.order.exception.ShippingDetailsNotFoundException;
import com.dentalstack.patient.feature.order.repository.ShippingDetailsRepository;

public final class ShippingDetailsResolver {

    private ShippingDetailsResolver() {}

    public static ShippingDetails upsert(
            ShippingDetailsRequest request, ShippingDetailsRepository shippingDetailsRepository) {
        ShippingDetails shippingDetails;

        if (request.getShippingId() != null) {
            ShippingDetails existingShippingDetails = shippingDetailsRepository
                    .findById(request.getShippingId())
                    .orElseThrow(() -> new ShippingDetailsNotFoundException(request.getShippingId()));

            shippingDetails = ShippingDetails.updateShippingDetails(request, existingShippingDetails);
        } else {
            shippingDetails = ShippingDetails.shippingDetails(request);
            shippingDetails.setProfileId(request.getProfileId());
        }

        if (request.isDefault()) {
            shippingDetailsRepository.updatePreviousDefaultShippingDetails(request.getProfileId());
        }

        return shippingDetailsRepository.save(shippingDetails);
    }
}
