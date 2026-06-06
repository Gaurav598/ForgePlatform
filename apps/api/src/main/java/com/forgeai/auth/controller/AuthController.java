package com.forgeai.auth.controller;

import com.forgeai.auth.dto.AuthDto;
import com.forgeai.auth.service.AuthService;
import com.forgeai.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication and token management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> register(
            @Valid @RequestBody AuthDto.RegisterRequest request) {
        AuthDto.AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> login(
            @Valid @RequestBody AuthDto.LoginRequest request) {
        AuthDto.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> refresh(
            @Valid @RequestBody AuthDto.RefreshRequest request) {
        AuthDto.AuthResponse response = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.ok("Token refreshed", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and revoke refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody AuthDto.RefreshRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully"));
    }

    @PostMapping("/logout-all")
    @Operation(summary = "Revoke all sessions for current user")
    public ResponseEntity<ApiResponse<Void>> logoutAll(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        authService.logoutAll(userId);
        return ResponseEntity.ok(ApiResponse.ok("All sessions revoked"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user info")
    public ResponseEntity<ApiResponse<AuthDto.UserInfo>> me(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        AuthDto.UserInfo userInfo = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(userInfo));
    }

    @PatchMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<AuthDto.UserInfo>> updateProfile(
            Authentication authentication,
            @RequestBody AuthDto.UpdateProfileRequest request) {
        String userId = (String) authentication.getPrincipal();
        AuthDto.UserInfo userInfo = authService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", userInfo));
    }
}
