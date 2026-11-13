// backend/src/main/java/com/airetia/infrastructure/batch/DataInitializer.java
package com.airetia.infrastructure.batch;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.domain.model.member.Member;
import com.airetia.domain.model.member.MemberRole;
import com.airetia.domain.model.member.NotificationSettings;
import com.airetia.domain.model.offering.DeliveryMethod;
import com.airetia.domain.model.offering.Offering;
import com.airetia.domain.model.provider.Provider;
import com.airetia.domain.model.provider.ProviderStatus;
import com.airetia.domain.model.ticket.Ticket;
import com.airetia.repository.MajorCategoryRepository;
import com.airetia.repository.MemberRepository;
import com.airetia.repository.NotificationSettingsRepository;
import com.airetia.repository.OfferingRepository;
import com.airetia.repository.ProviderRepository;
import com.airetia.repository.ServiceTypeRepository;
import com.airetia.repository.TicketRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 開発用テストデータ初期化（prod プロファイル以外で実行・冪等）
 * マスターデータ（service_types / major_categories / middle_categories / tags）は
 * Flyway V2〜V5 で投入済み。ここでは削除してもシステム運用に影響しないデータのみ作成する。
 *
 * ┌──────────────────────────┬────────────────┬──────────────────────────────────┐
 * │ メールアドレス            │ パスワード     │ ロール                           │
 * ├──────────────────────────┼────────────────┼──────────────────────────────────┤
 * │ admin@example.com        │ Admin1234!@    │ ADMIN                            │
 * │ member@example.com       │ Member1234!    │ MEMBER（チケット10枚）           │
 * │ provider@example.com     │ Provider1234!  │ MEMBER + APPROVED プロバイダー   │
 * └──────────────────────────┴────────────────┴──────────────────────────────────┘
 */
@Slf4j
@Component
@Profile("!prod")
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final MemberRepository               memberRepository;
    private final TicketRepository               ticketRepository;
    private final ProviderRepository             providerRepository;
    private final OfferingRepository             offeringRepository;
    private final NotificationSettingsRepository notificationSettingsRepository;
    private final ServiceTypeRepository          serviceTypeRepository;
    private final MajorCategoryRepository        majorCategoryRepository;
    private final PasswordEncoder                passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        createAdminIfAbsent();
        createMemberIfAbsent();
        createProviderIfAbsent();
        log.info("[DataInitializer] テストデータの初期化が完了しました");
    }

    private void createAdminIfAbsent() {
        final String email = "admin@example.com";
        if (memberRepository.existsByEmail(email)) return;
        memberRepository.save(Member.builder()
            .email(email)
            .passwordHash(passwordEncoder.encode("Admin1234!@"))
            .role(MemberRole.ADMIN)
            .firstName("管理者").lastName("テスト")
            .firstNameKana("かんりしゃ").lastNameKana("てすと")
            .birthDate(LocalDate.of(1990, 1, 1))
            .build());
        log.info("[DataInitializer] 管理者アカウントを作成: {}", email);
    }

    private void createMemberIfAbsent() {
        final String email = "member@example.com";
        if (memberRepository.existsByEmail(email)) return;

        Member member = memberRepository.save(Member.builder()
            .email(email)
            .passwordHash(passwordEncoder.encode("Member1234!"))
            .role(MemberRole.MEMBER)
            .firstName("太郎").lastName("山田")
            .firstNameKana("たろう").lastNameKana("やまだ")
            .birthDate(LocalDate.of(1995, 5, 15))
            .phoneNumber("09012345678").postalCode("1000001")
            .address("東京都千代田区千代田1-1")
            .build());

        Instant expiry = Instant.now().plus(365, ChronoUnit.DAYS);
        for (int i = 0; i < 10; i++) {
            ticketRepository.save(Ticket.builder().member(member).expiryDate(expiry).build());
        }
        notificationSettingsRepository.save(NotificationSettings.defaultFor(member.getId()));
        log.info("[DataInitializer] メンバーアカウントを作成: {} (チケット10枚)", email);
    }

    private void createProviderIfAbsent() {
        final String email = "provider@example.com";
        if (memberRepository.existsByEmail(email)) return;

        Member member = memberRepository.save(Member.builder()
            .email(email)
            .passwordHash(passwordEncoder.encode("Provider1234!"))
            .role(MemberRole.MEMBER)
            .firstName("花子").lastName("鈴木")
            .firstNameKana("はなこ").lastNameKana("すずき")
            .birthDate(LocalDate.of(1988, 8, 20))
            .phoneNumber("09087654321").postalCode("1500001")
            .address("東京都渋谷区神南1-1-1")
            .build());

        notificationSettingsRepository.save(NotificationSettings.defaultFor(member.getId()));

        Provider provider = providerRepository.save(Provider.builder()
            .member(member)
            .status(ProviderStatus.APPROVED)
            .highSchool("渋谷高校")
            .university("東京大学")
            .appealPoint("子どもの学習サポートを10年以上担当しています。分かりやすい説明が得意です。")
            .build());

        // マスターデータは Flyway V2〜V5 で投入済み
        var tutoring = serviceTypeRepository.findByCode("TUTORING").orElse(null);
        var study    = majorCategoryRepository.findByCode("STUDY").orElse(null);
        var arts     = majorCategoryRepository.findByCode("ARTS").orElse(null);

        if (tutoring != null && study != null) {
            offeringRepository.save(Offering.builder()
                .provider(provider).serviceType(tutoring).majorCategory(study)
                .title("基礎算数レッスン")
                .description("小学生向けの算数基礎。足し算・引き算・掛け算・割り算を楽しく学びます。")
                .deliveryMethod(DeliveryMethod.ONLINE)
                .durationMinutes(60).ticketsRequired(2).capacity(3)
                .build());
        }
        if (tutoring != null && arts != null) {
            offeringRepository.save(Offering.builder()
                .provider(provider).serviceType(tutoring).majorCategory(arts)
                .title("英語会話入門")
                .description("日常英語の基礎から。ネイティブ発音と基本フレーズを習得します。")
                .deliveryMethod(DeliveryMethod.ONLINE)
                .durationMinutes(45).ticketsRequired(1).capacity(5)
                .build());
        }
        log.info("[DataInitializer] プロバイダーアカウントを作成: {} (オファリング2件)", email);
    }
}