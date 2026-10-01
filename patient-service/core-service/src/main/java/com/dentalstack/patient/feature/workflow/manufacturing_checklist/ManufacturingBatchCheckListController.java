package com.dentalstack.patient.feature.workflow.manufacturing_checklist;

import com.dentalstack.patient.feature.workflow.manufacturing_checklist.dto.ManufacturingBatchCheckListRequestDTO;
import com.dentalstack.patient.feature.workflow.manufacturing_checklist.dto.ManufacturingBatchCheckListResponseDTO;
import com.dentalstack.patient.feature.workflow.manufacturing_checklist.dto.MultipleManufacturingBatchCheckListRequestDTO;
import com.dentalstack.patient.feature.workflow.manufacturing_checklist.service.ManufacturingBatchCheckListService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/manufacturing-batch-checklist")
@RequiredArgsConstructor
@Tag(name = "Manufacturing Batch Checklist", description = "APIs to manage manufacturing batch checklist")
public class ManufacturingBatchCheckListController {

    private final ManufacturingBatchCheckListService checkListService;

    @Operation(summary = "Create manufacturing batch checklist")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Checklist created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping("/create")
    public void create(@RequestBody ManufacturingBatchCheckListRequestDTO request) {
        checkListService.create(request);
    }

    @Operation(summary = "Create multiple manufacturing batch checklists")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Checklists created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping("/create/multiple")
    public void createMultiple(@RequestBody MultipleManufacturingBatchCheckListRequestDTO request) {
        checkListService.createMultiple(request.getData());
    }

    @Operation(summary = "Update manufacturing batch checklist")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Checklist updated successfully"),
        @ApiResponse(responseCode = "404", description = "Checklist not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ManufacturingBatchCheckListResponseDTO> update(
            @PathVariable Long id, @RequestBody ManufacturingBatchCheckListRequestDTO request) {
        return ResponseEntity.ok(checkListService.update(id, request));
    }

    @Operation(summary = "Delete manufacturing batch checklist")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Checklist deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Checklist not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        checkListService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get checklist by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Checklist details fetched"),
        @ApiResponse(responseCode = "404", description = "Checklist not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ManufacturingBatchCheckListResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(checkListService.getById(id));
    }

    @Operation(summary = "Get checklists by Batch ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Checklist list fetched"),
        @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<ManufacturingBatchCheckListResponseDTO>> getByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(checkListService.getByBatchId(batchId));
    }
}
