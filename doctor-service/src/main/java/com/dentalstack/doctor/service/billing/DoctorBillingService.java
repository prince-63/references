package com.dentalstack.doctor.service.billing;

import com.dentalstack.doctor.dto.billing.DoctorBillingDetails;
import com.dentalstack.doctor.dto.billing.DoctorBillingRequest;
import com.dentalstack.doctor.entity.billing.DoctorBilling;
import org.springframework.web.multipart.MultipartFile;

public interface DoctorBillingService {

    DoctorBilling addOrUpdateDoctorBillingDetails(
            DoctorBillingRequest request, MultipartFile file, MultipartFile companyBrandProfilePicture);

    DoctorBillingDetails getDoctorBillingDetails(long organizationId, long doctorId, long profileId);
}
