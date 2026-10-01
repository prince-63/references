package com.dentalstack.patient.feature.material.controller;

import com.dentalstack.patient.feature.material.dto.AddMaterialTool;
import com.dentalstack.patient.feature.material.dto.CreateMaterialRequest;
import com.dentalstack.patient.feature.material.dto.MaterialStageDetails;
import com.dentalstack.patient.feature.material.entity.Material;
import com.dentalstack.patient.feature.material.entity.MaterialShape;
import com.dentalstack.patient.feature.material.entity.MaterialSize;
import com.dentalstack.patient.feature.material.entity.MaterialTool;
import com.dentalstack.patient.feature.material.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Material", description = "Material APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/material/v1")
public class MaterialController {
    private final MaterialService materialService;

    @GetMapping("/treatment/stage")
    @Operation(summary = "Get all material stage")
    public ResponseEntity<List<MaterialStageDetails>> getAllMaterials() {
        return ResponseEntity.ok(materialService.getAllMaterials());
    }

    @GetMapping("/by-treatment-stage/{stageId}")
    public ResponseEntity<List<MaterialShape>> getShapesByTreatmentStage(@PathVariable Long stageId) {
        return ResponseEntity.ok(materialService.getShapesByTreatmentStage(stageId));
    }

    @GetMapping("/material/{doctor_id}/{shape_id}")
    @Operation(summary = "Get materials by shape and doctor id")
    public ResponseEntity<List<Material>> getMaterialsByShapeId(
            @PathVariable("doctor_id") Long doctorId, @PathVariable("shape_id") Long shapeId) {
        return ResponseEntity.ok(materialService.findMaterialsByShapeId(doctorId, shapeId));
    }

    @GetMapping("/material/sizes/{doctor_id}/{material_id}")
    @Operation(summary = "Get material sizes by material and doctor id")
    public ResponseEntity<List<MaterialSize>> getMaterialsSizeByMaterielId(
            @PathVariable("doctor_id") Long doctorId, @PathVariable("material_id") Long materialId) {
        return ResponseEntity.ok(materialService.findMaterialsSizeByMaterielId(doctorId, materialId));
    }

    @PostMapping("/add")
    public ResponseEntity<String> addMaterial(@Valid @RequestBody CreateMaterialRequest request) {
        materialService.AddMaterial(request.getMaterialName(), request.getId(), request.getDoctorId());
        return ResponseEntity.ok("Material added successfully");
    }

    @PostMapping("/add/sizes")
    public ResponseEntity<String> addMaterialSize(@Valid @RequestBody CreateMaterialRequest request) {
        materialService.AddMaterialSize(request.getMaterialName(), request.getId(), request.getDoctorId());
        return ResponseEntity.ok("Material size added successfully");
    }

    @PostMapping("/add/material/tool")
    public ResponseEntity<String> addMaterialTool(@Valid @RequestBody AddMaterialTool request) {
        materialService.AddMaterialTool(request);
        return ResponseEntity.ok("Material size added successfully");
    }

    @GetMapping("/tool/{doctor_id}")
    @Operation(summary = "Get materials tool by doctor id")
    public ResponseEntity<List<MaterialTool>> getMaterialsTools(@PathVariable("doctor_id") Long doctorId) {
        return ResponseEntity.ok(materialService.getMaterialsToolsOfDoctor(doctorId));
    }
}
