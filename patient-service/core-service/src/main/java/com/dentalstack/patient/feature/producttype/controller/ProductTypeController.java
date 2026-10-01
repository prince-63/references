package com.dentalstack.patient.feature.producttype.controller;

import com.dentalstack.patient.feature.producttype.service.ProductTypeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "profile", description = "Product APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/product/type/v1")
public class ProductTypeController {

    private final ProductTypeService productTypeService;
}
