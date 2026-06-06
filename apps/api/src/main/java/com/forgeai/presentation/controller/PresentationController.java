package com.forgeai.presentation.controller;

import com.forgeai.common.dto.ApiResponse;
import com.forgeai.presentation.dto.PresentationDto;
import com.forgeai.presentation.service.PresentationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/presentations")
@RequiredArgsConstructor
@Tag(name = "Presentations", description = "AI-powered presentation generation")
public class PresentationController {

    private final PresentationService presentationService;

    @PostMapping
    @Operation(summary = "Create a new AI presentation")
    public ResponseEntity<ApiResponse<PresentationDto.Response>> create(
            Authentication auth,
            @Valid @RequestBody PresentationDto.CreateRequest request) {
        String userId = (String) auth.getPrincipal();
        PresentationDto.Response response = presentationService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Presentation created", response));
    }

    @GetMapping
    @Operation(summary = "List user presentations (paginated)")
    public ResponseEntity<ApiResponse<Page<PresentationDto.ListResponse>>> list(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userId = (String) auth.getPrincipal();
        Page<PresentationDto.ListResponse> presentations = presentationService.list(userId, page, size);
        return ResponseEntity.ok(ApiResponse.ok(presentations));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get presentation by ID")
    public ResponseEntity<ApiResponse<PresentationDto.Response>> getById(
            Authentication auth,
            @PathVariable String id) {
        String userId = (String) auth.getPrincipal();
        PresentationDto.Response response = presentationService.getById(userId, id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a presentation")
    public ResponseEntity<ApiResponse<Void>> delete(
            Authentication auth,
            @PathVariable String id) {
        String userId = (String) auth.getPrincipal();
        presentationService.delete(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Presentation deleted"));
    }
}
