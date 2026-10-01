package com.dentalstack.patient.feature.bracket.controller;

import com.dentalstack.patient.feature.bracket.dto.AddBracketCompanyRequest;
import com.dentalstack.patient.feature.bracket.entity.Bracket;
import com.dentalstack.patient.feature.bracket.entity.BracketSubType;
import com.dentalstack.patient.feature.bracket.entity.BracketType;
import com.dentalstack.patient.feature.bracket.entity.BracketTypeCompany;
import com.dentalstack.patient.feature.bracket.service.BracketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Bracket", description = "Braces bracket APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/braces/bracket/v1")
@Slf4j
public class BracketController {

    private final BracketService bracketService;

    @PostMapping("/add")
    public ResponseEntity<String> addBracketCompanyName(@Valid @RequestBody AddBracketCompanyRequest request) {
        bracketService.addBracketCompanyName(request);
        return ResponseEntity.ok("Bracket added successfully");
    }

    @GetMapping("/")
    @Operation(summary = "Get all brackets stage")
    public ResponseEntity<List<Bracket>> getAllBrackets() {
        return ResponseEntity.ok(bracketService.getAllBrackets());
    }

    @GetMapping("/bracket-type/{bracket_id}")
    @Operation(summary = "Get the bracket type by bracket id")
    public ResponseEntity<List<BracketType>> getBracketType(@PathVariable("bracket_id") Long bracketId) {
        return ResponseEntity.ok(bracketService.getBracketType(bracketId));
    }

    @GetMapping("/bracket-sub-type/{doctor_id}/{bracket_type_id}")
    @Operation(summary = "Get bracket sub type by bracket type id")
    public ResponseEntity<List<BracketSubType>> getBracketSubType(
            @PathVariable("doctor_id") Long doctorId, @PathVariable("bracket_type_id") Long bracketTypeId) {
        return ResponseEntity.ok(bracketService.getBracketSubType(doctorId, bracketTypeId));
    }

    @GetMapping("/bracket-company/{doctor_id}/{bracket_sub_type_id}")
    @Operation(summary = "Get bracket companies by bracket sub type id")
    public ResponseEntity<List<BracketTypeCompany>> getBracketCompany(
            @PathVariable("doctor_id") Long doctorId, @PathVariable("bracket_sub_type_id") Long bracketSubTypeId) {
        return ResponseEntity.ok(bracketService.getBracketCompany(doctorId, bracketSubTypeId));
    }
}
