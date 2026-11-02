// backend/src/main/java/com/airetia/presentation/controller/auth/AuthController.java
package com.airetia.presentation.controller.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.airetia.application.dto.request.auth.LoginRequest;
import com.airetia.application.dto.request.auth.RegisterRequest;
import com.airetia.application.dto.response.auth.LoginResponse;
import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.application.dto.response.member.MemberResponse;
import com.airetia.application.service.auth.AuthService;
import com.airetia.application.service.member.MemberService;
import com.airetia.domain.model.participant.ParticipantType;
import com.airetia.domain.model.provider.ProviderStatus;
import com.airetia.infrastructure.security.MemberDetails;
import com.airetia.repository.ParticipantRepository;
import com.airetia.repository.ProviderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 認証コントローラー
 * → 03_common_specification.md §5 エンドポイント一覧（認証）
 *
 * POST /api/v1/auth/register - 会員登録
 * POST /api/v1/auth/login    - ログイン
 * GET  /api/v1/auth/me       - 現在のユーザー情報取得（capabilities 含む）
 * POST /api/v1/auth/logout   - SecurityConfig の logout 設定で処理
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService            authService;
    private final MemberService          memberService;
    private final AuthenticationManager  authenticationManager;
    private final ProviderRepository     providerRepository;
    private final ParticipantRepository  participantRepository;

    /** 会員登録 */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<MemberResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        log.info("Registration attempt: email={}", request.getEmail());
        var memberResponse = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("会員登録が完了しました。ログインしてください。", memberResponse));
    }

    /**
     * ログイン
     * Spring Security の Bad/Disabled/Locked 例外は GlobalExceptionHandler で処理。
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        log.info("Login attempt: email={}", request.getEmail());

        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        httpRequest.getSession(true).setAttribute(
            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        MemberDetails memberDetails = (MemberDetails) auth.getPrincipal();
        Long memberId = memberDetails.getId();

        boolean hasProvider = providerRepository.existsByMemberIdAndStatus(memberId, ProviderStatus.APPROVED);
        boolean hasParent   = participantRepository.existsByMemberIdAndParticipantType(memberId, ParticipantType.CHILD);

        LoginResponse response = LoginResponse.builder()
            .memberId(memberId)
            .email(memberDetails.getUsername())
            .role(memberDetails.getMember().getRole())
            .capabilities(LoginResponse.Capabilities.builder()
                .hasProvider(hasProvider)
                .hasParent(hasParent)
                .build())
            .build();

        log.info("Login successful: memberId={}", memberId);
        return ResponseEntity.ok(ApiResponse.success("ログインしました", response));
    }

    /**
     * 現在のユーザー情報取得
     * GET /api/v1/auth/me
     * capabilities は毎回最新値を取得（プロバイダー申請後に即反映）
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MemberResponse>> getMe(
            @AuthenticationPrincipal MemberDetails memberDetails) {

        Long memberId = memberDetails.getId();
        boolean hasProvider = providerRepository.existsByMemberIdAndStatus(memberId, ProviderStatus.APPROVED);
        boolean hasParent   = participantRepository.existsByMemberIdAndParticipantType(memberId, ParticipantType.CHILD);

        MemberResponse base = memberService.getMemberById(memberId);
        MemberResponse response = MemberResponse.builder()
            .id(base.getId())
            .email(base.getEmail())
            .firstName(base.getFirstName())
            .lastName(base.getLastName())
            .firstNameKana(base.getFirstNameKana())
            .lastNameKana(base.getLastNameKana())
            .phoneNumber(base.getPhoneNumber())
            .postalCode(base.getPostalCode())
            .address(base.getAddress())
            .birthDate(base.getBirthDate())
            .role(base.getRole())
            .isActive(base.getIsActive())
            .isLocked(base.getIsLocked())
            .createdAt(base.getCreatedAt())
            .capabilities(MemberResponse.Capabilities.builder()
                .hasProvider(hasProvider)
                .hasParent(hasParent)
                .build())
            .build();

        return ResponseEntity.ok(ApiResponse.success("ユーザー情報を取得しました", response));
    }

    // POST /api/v1/auth/logout は SecurityConfig の logout 設定で処理。
}