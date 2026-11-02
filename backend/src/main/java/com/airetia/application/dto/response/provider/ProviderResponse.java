package com.airetia.application.dto.response.provider;

import java.time.Instant;

import com.airetia.domain.model.provider.Provider;
import com.airetia.domain.model.provider.ProviderStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProviderResponse {

    private Long id;
    private Long memberId;
    private String firstName;
    private String lastName;
    private String email;
    private ProviderStatus status;
    private String highSchool;
    private String university;
    private String appealPoint;
    private String bio;
    private Instant createdAt;

    public static ProviderResponse from(Provider provider) {
        var member = provider.getMember();
        return ProviderResponse.builder()
            .id(provider.getId())
            .memberId(member != null ? member.getId() : null)
            .firstName(member != null ? member.getFirstName() : null)
            .lastName(member != null ? member.getLastName() : null)
            .email(member != null ? member.getEmail() : null)
            .status(provider.getStatus())
            .highSchool(provider.getHighSchool())
            .university(provider.getUniversity())
            .appealPoint(provider.getAppealPoint())
            .bio(provider.getBio())
            .createdAt(provider.getCreatedAt())
            .build();
    }
}
