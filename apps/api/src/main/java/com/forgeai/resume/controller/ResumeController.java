package com.forgeai.resume.controller;

import com.forgeai.common.dto.ApiResponse;
import com.forgeai.resume.dto.ResumeDto;
import com.forgeai.resume.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
@Tag(name = "Resumes", description = "Resume upload, analysis, and management")
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a resume (PDF/DOCX)")
    public ResponseEntity<ApiResponse<ResumeDto.ResumeResponse>> upload(
            Authentication auth,
            @RequestParam("file") MultipartFile file) throws IOException {
        String userId = (String) auth.getPrincipal();
        ResumeDto.ResumeResponse response = resumeService.upload(userId, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Resume uploaded", response));
    }

    @PostMapping("/analyze")
    @Operation(summary = "Analyze a resume with AI")
    public ResponseEntity<ApiResponse<ResumeDto.AnalysisResponse>> analyze(
            Authentication auth,
            @Valid @RequestBody ResumeDto.AnalyzeRequest request) {
        String userId = (String) auth.getPrincipal();
        ResumeDto.AnalysisResponse response = resumeService.analyze(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Resume analyzed", response));
    }

    @GetMapping
    @Operation(summary = "List user resumes (paginated)")
    public ResponseEntity<ApiResponse<Page<ResumeDto.ResumeResponse>>> list(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userId = (String) auth.getPrincipal();
        Page<ResumeDto.ResumeResponse> resumes = resumeService.listResumes(userId, page, size);
        return ResponseEntity.ok(ApiResponse.ok(resumes));
    }

    @GetMapping("/{resumeId}/analyses")
    @Operation(summary = "Get all analyses for a resume")
    public ResponseEntity<ApiResponse<List<ResumeDto.AnalysisResponse>>> getAnalyses(
            Authentication auth,
            @PathVariable String resumeId) {
        String userId = (String) auth.getPrincipal();
        List<ResumeDto.AnalysisResponse> analyses = resumeService.getAnalyses(userId, resumeId);
        return ResponseEntity.ok(ApiResponse.ok(analyses));
    }
}
