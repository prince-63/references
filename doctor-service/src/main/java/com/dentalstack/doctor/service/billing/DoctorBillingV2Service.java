package com.dentalstack.doctor.service.billing;

import com.dentalstack.doctor.dto.billing.DoctorBillingDetails;
import com.dentalstack.doctor.dto.billing.DoctorBillingRequest;
import org.springframework.web.multipart.MultipartFile;

public interface DoctorBillingV2Service {
    DoctorBillingDetails addOrUpdateDoctorBillingDetails(
            DoctorBillingRequest request, MultipartFile file, MultipartFile companyBrandProfilePicture);
}
