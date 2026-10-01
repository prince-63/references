package com.dentalstack.doctor.controller.v1;

import com.dentalstack.doctor.dto.customer_access.CustomerAccessAndRevokeRequest;
import com.dentalstack.doctor.dto.customer_access.CustomerAccessAndRevokeResponse;
import com.dentalstack.doctor.service.CustomerAccessAndRevokeService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/doctor/customer/access")
@AllArgsConstructor
public class CustomerAccessAndRovokeController {

    private final CustomerAccessAndRevokeService customerAccessAndRevokeService;

    @PostMapping("/details")
    public ResponseEntity<CustomerAccessAndRevokeResponse> getCustomerAccessDetails(
            @RequestBody CustomerAccessAndRevokeRequest request) {
        return ResponseEntity.ok(customerAccessAndRevokeService.getCustomerAccessDetails(request));
    }
}
