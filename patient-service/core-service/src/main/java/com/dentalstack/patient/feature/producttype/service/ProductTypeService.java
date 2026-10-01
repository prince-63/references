package com.dentalstack.patient.feature.producttype.service;

import com.dentalstack.patient.feature.invitation.dto.AllInvitationDetailsForMobile;
import com.dentalstack.patient.feature.producttype.dto.producttype.ProductTypeAddRequest;
import com.dentalstack.patient.feature.treatment.dto.UpdateTreatmentType;

public interface ProductTypeService {
    AllInvitationDetailsForMobile addProductTypeToPatient(ProductTypeAddRequest productTypeAddRequest);

    AllInvitationDetailsForMobile addProductType(UpdateTreatmentType request);
}
