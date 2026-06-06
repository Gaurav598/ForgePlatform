package com.forgeai.auth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;
    private String name;
    private String avatar;

    @Builder.Default
    private String role = "USER"; // USER, ADMIN, TEAM_ADMIN

    @Builder.Default
    private String plan = "FREE"; // FREE, PRO, TEAM, ENTERPRISE

    private Map<String, OAuthInfo> oauth;

    private MfaConfig mfa;

    @Builder.Default
    private UserPreferences preferences = new UserPreferences();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    private Instant lastLoginAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OAuthInfo {
        private String providerId;
        private String email;
        private String name;
        private String avatar;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MfaConfig {
        @Builder.Default
        private boolean enabled = false;
        private String secret;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserPreferences {
        @Builder.Default
        private String theme = "dark";
        @Builder.Default
        private String language = "en";
    }
}
