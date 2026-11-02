[//]: # (airetia/docs/04_backend_specification.md)

# airetia バックエンド仕様書

**Version**: 3.1.0 | **Updated**: 2026-02-25
**ビジネスルール** → [02_business_rules.md](./02_business_rules.md) | **API 契約** → [03_common_specification.md](./03_common_specification.md)

---

## 目次
1. [技術スタック](#1-技術スタック)
2. [プロジェクト構成](#2-プロジェクト構成)
3. [レイヤー設計](#3-レイヤー設計)
4. [認証・認可実装](#4-認証認可実装)
5. [エンティティ設計](#5-エンティティ設計)
6. [ビジネスロジック実装](#6-ビジネスロジック実装)
7. [ファイルアップロード実装](#7-ファイルアップロード実装)
8. [バッチ処理](#8-バッチ処理)
9. [メール送信](#9-メール送信)
10. [エラーハンドリング](#10-エラーハンドリング)
11. [テスト戦略](#11-テスト戦略)

---

## 1. 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Java | 17 | 言語 |
| Spring Boot | 3.2.x | フレームワーク |
| Spring Security | 6.x | 認証・認可 |
| Spring Data JPA / Hibernate | 3.x / 6.x | ORM |
| Spring Session | 3.x | セッション管理（Phase1: InMemory） |
| AWS SDK v2 | 2.x | S3 ファイルアップロード |
| MySQL Connector | 8.x | JDBC ドライバ |
| Flyway | 9.x | DB マイグレーション |
| Lombok | 1.18.x | ボイラープレート削減 |
| MapStruct | 1.5.x | DTO 変換 |
| Thymeleaf | 3.x | メールテンプレート |

### Phase 別認証方針

| | Phase1（MVP） | Phase2 以降 |
|-|--------------|-----------|
| セッション | InMemory | Redis（ElastiCache） |
| チケット購入 | 管理者手動 | Stripe |
| 移行コスト | `application.yml` の変更のみ | − |

---

## 2. プロジェクト構成

```
backend/src/main/java/com/airetia/
├── config/                    # SecurityConfig, WebConfig, JpaConfig, SchedulingConfig, S3Config
├── domain/
│   ├── model/
│   │   ├── member/            # Member, MemberRole, Gender
│   │   ├── provider/          # Provider, ProviderStatus, ProviderQualification,
│   │   │                      #   ProviderAchievement, ProviderDocument, DocumentType
│   │   ├── participant/       # Participant, ParticipantType
│   │   ├── offering/          # Offering, DeliveryMethod
│   │   ├── availability/      # Availability
│   │   ├── booking/           # Booking, BookingStatus
│   │   ├── ticket/            # Ticket, TicketUsage, UsageType
│   │   ├── penalty/           # Penalty
│   │   └── report/            # Report, ReportType
│   ├── rule/
│   │   ├── BookingRule.java
│   │   ├── CancellationRule.java
│   │   ├── TicketRule.java
│   │   ├── PenaltyRule.java
│   │   └── AdminAccessRule.java
│   └── repository/            # インターフェースのみ
├── application/
│   ├── service/
│   ├── dto/                   # request/ response/
│   └── mapper/                # MapStruct
├── presentation/
│   └── controller/
├── infrastructure/
│   ├── batch/
│   ├── email/
│   └── storage/               # S3StorageService
└── shared/
    ├── exception/
    ├── util/                  # DateTimeUtil, ValidationUtil
    └── constant/              # ErrorCode, AppConstants
```

**依存方向**: `Presentation → Application → Domain` / `Infrastructure → Domain`
NG: `Domain → Application` / `Domain → Infrastructure`

---

## 3. レイヤー設計

| レイヤー | 責務 |
|---------|------|
| Domain | エンティティ・ビジネスルール・リポジトリ IF 定義 |
| Application | ユースケース実装・トランザクション管理・DTO 変換 |
| Presentation | HTTP リクエスト/レスポンス・バリデーション |
| Infrastructure | バッチ処理・メール・S3・セキュリティ実装 |

---

## 4. 認証・認可実装

### 4.1 SecurityConfig

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/register", "/api/v1/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/offerings/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/availabilities/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
            )
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers("/api/v1/auth/login", "/api/v1/auth/register")
            );
        return http.build();
    }

    /**
     * 単一の PasswordEncoder（強度 12）を全ユーザーに使用。
     * 管理者パスワードはバリデーション（12文字以上・記号必須）で制御し、
     * エンコード自体は同じエンコーダーを使用する。
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
```

### 4.2 MemberDetails

```java
@Getter
public class MemberDetails implements UserDetails {
    private final Member member;

    public MemberDetails(Member member) { this.member = member; }

    public Long getId() { return member.getId(); }

    @Override public String getUsername()  { return member.getEmail(); }
    @Override public String getPassword()  { return member.getPasswordHash(); }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + member.getRole().name()));
    }

    @Override public boolean isAccountNonLocked() { return !member.isLocked(); }
    @Override public boolean isEnabled()           { return member.isActive(); }
}
```

### 4.3 プロバイダー権限チェック

```java
@Service("providerAuthService")
public class ProviderAuthService {
    @Autowired private ProviderRepository providerRepository;

    public boolean hasProviderCapability(Object principal) {
        if (!(principal instanceof MemberDetails md)) return false;
        return providerRepository.existsByMemberIdAndStatus(
            md.getId(), ProviderStatus.APPROVED
        );
    }
}
```

コントローラーでの使用:
```java
@PreAuthorize("@providerAuthService.hasProviderCapability(principal)")
```

### 4.4 管理者によるメンバー機能利用禁止チェック

```java
@Component
public class AdminAccessRule {
    /**
     * ADMIN ロールが予約・チケット消費・Participant 作成などを試みた場合に例外を投げる。
     * 各 Service メソッドの冒頭で呼び出す。
     */
    public void denyIfAdmin(MemberDetails memberDetails) {
        if (memberDetails.getMember().getRole() == MemberRole.ADMIN) {
            throw new AdminMemberFeatureForbiddenException(
                "管理者アカウントはこの機能を使用できません"
            );
        }
    }
}
```

---

## 5. エンティティ設計

### 共通基底クラス

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
public abstract class BaseEntity {
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;
}
```

全 Enum は `@Enumerated(EnumType.STRING)` で保存。

### Member

> DB スキーマ → [06_infrastructure.md §2.2](./06_infrastructure.md#22-主要テーブル定義)（`members` テーブル）

```java
@Entity @Table(name = "members")
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberRole role;  // ADMIN または MEMBER

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(length = 50)
    private String firstNameKana;

    @Column(length = 50)
    private String lastNameKana;

    private LocalDate birthDate;

    @Column(length = 11)
    private String phone;

    @Column(length = 7)
    private String postalCode;

    @Column(length = 255)
    private String address;

    private boolean active = true;
    private boolean locked = false;
    private Instant suspendedUntil;
}
```

### Provider

```java
@Entity @Table(name = "providers")
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Provider extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false, unique = true)
    private Member member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProviderStatus status;

    @Column(length = 255)
    private String highSchool;

    @Column(length = 255)
    private String university;

    @Column(columnDefinition = "TEXT")
    private String appealPoint;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<ProviderQualification> qualifications = new ArrayList<>();

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<ProviderAchievement> achievements = new ArrayList<>();

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProviderDocument> documents = new ArrayList<>();

    /**
     * 必要書類（IDENTITY / CONTRACT / BANK_INFO）が 3 種類すべて揃ったら
     * PENDING_DOCUMENTS → PENDING へ遷移する。
     */
    public void tryTransitionToPending() {
        if (status != ProviderStatus.PENDING_DOCUMENTS) return;
        boolean hasAll = EnumSet.of(DocumentType.IDENTITY, DocumentType.CONTRACT, DocumentType.BANK_INFO)
            .stream()
            .allMatch(type -> documents.stream().anyMatch(d -> d.getDocumentType() == type));
        if (hasAll) {
            this.status = ProviderStatus.PENDING;
        }
    }
}
```

### Booking

```java
@Entity @Table(name = "bookings")
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Booking extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "availability_id", nullable = false)
    private Availability availability;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BookingStatus status;

    /**
     * 予約作成時に確定した消費チケット枚数。
     * キャンセル・NO_SHOW 後もこの値を保持する（報酬計算の基準値）。
     * → ビジネスルール: 02_business_rules.md §5.3
     */
    @Column(nullable = false)
    private Integer ticketsConsumed;
}
```

---

## 6. ビジネスロジック実装

ビジネスルールの詳細 → [02_business_rules.md](./02_business_rules.md)

### 6.1 予約作成フロー

```java
@Service
@Transactional
public class BookingService {

    @Autowired private AdminAccessRule adminAccessRule;

    public BookingResponse createBooking(MemberDetails memberDetails, BookingCreateRequest req) {
        // 0. 管理者による利用禁止チェック
        adminAccessRule.denyIfAdmin(memberDetails);

        // 1. 空き枠取得（楽観的ロック）
        Availability availability = availabilityRepository
            .findByIdWithLock(req.getAvailabilityId())
            .orElseThrow(() -> new ResourceNotFoundException("空き枠が見つかりません"));

        // 2. 予約ルールチェック（定員・同時上限・日次上限・時間重複・自己予約禁止）
        bookingRule.validate(memberDetails.getId(), req.getParticipantId(), availability);

        // 3. チケット残高確認
        int required = availability.getOffering().getTicketsRequired();
        ticketRule.validateBalance(memberDetails.getId(), required);

        // 4. 予約作成（ticketsConsumed を確定値として記録）
        Booking booking = Booking.create(req.getParticipantId(), availability, required);
        booking = bookingRepository.save(booking);

        // 5. チケット消費（FIFO）
        ticketService.consume(memberDetails.getId(), required, booking.getId());

        // 6. 確認メール（非同期）
        emailService.sendBookingConfirmation(booking);

        return bookingMapper.toResponse(booking);
    }
}
```

### 6.2 キャンセル処理

キャンセルポリシー → [02_business_rules.md §3](./02_business_rules.md#3-キャンセルルール)

```java
@Component
public class CancellationRule {

    public CancellationResult calculate(Booking booking, Instant cancelTime) {
        Instant start = booking.getAvailability().getStartDatetime();
        long minutesBefore = Duration.between(cancelTime, start).toMinutes();

        // 境界ちょうどは返還率が高い方を適用（>= で判定）
        double refundRate;
        Instant refundExpiry;

        if (minutesBefore >= 1440) {          // 24 時間以上前
            refundRate = 1.0;
            refundExpiry = null;              // 元の有効期限を使用
        } else if (minutesBefore >= 720) {    // 12 時間以上前
            refundRate = 0.5;
            refundExpiry = cancelTime.plus(7, ChronoUnit.DAYS);
        } else if (minutesBefore >= 30) {     // 30 分以上前
            refundRate = 0.2;
            refundExpiry = cancelTime.plus(7, ChronoUnit.DAYS);
        } else {
            refundRate = 0.0;
            refundExpiry = null;
        }

        int refundAmount = (int) Math.floor(booking.getTicketsConsumed() * refundRate);

        // 返還有効期限 = MIN(計算値, 元チケット有効期限)
        Instant originalExpiry = ticketService.getEarliestExpiry(booking);
        if (refundExpiry != null && originalExpiry != null) {
            refundExpiry = refundExpiry.isBefore(originalExpiry) ? refundExpiry : originalExpiry;
        } else if (refundExpiry == null) {
            refundExpiry = originalExpiry;
        }

        return new CancellationResult(refundAmount, refundExpiry);
    }
}
```

### 6.3 報酬計算

報酬ルール → [02_business_rules.md §5.3](./02_business_rules.md#53-報酬計算)

```java
@Service
public class RewardService {

    public int calculateMonthlyReward(Long providerId, YearMonth month) {
        // 完了サービスの合計チケット枚数
        List<Booking> completed = bookingRepository
            .findByProviderAndMonthAndStatus(providerId, month, BookingStatus.COMPLETED);
        int totalTickets = completed.stream()
            .mapToInt(Booking::getTicketsConsumed)
            .sum();

        // 無断キャンセルの報酬チケット枚数（ticketsConsumed は予約確定時の値を保持）
        List<Booking> noShows = bookingRepository
            .findByProviderAndMonthAndStatus(providerId, month, BookingStatus.NO_SHOW);
        int noShowTickets = noShows.stream()
            .filter(b -> b.getTicketsConsumed() >= 6)   // 消費予定 6 枚以上に固定 1 枚
            .mapToInt(b -> 1)
            .sum();

        return (int) Math.floor((totalTickets + noShowTickets) * 500 * 0.4);
    }
}
```

---

## 7. ファイルアップロード実装

### 7.1 S3Config

```java
@Configuration
public class S3Config {
    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.region}")
    private String region;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
            .region(Region.of(region))
            .build();
    }
}
```

### 7.2 S3StorageService

```java
@Service
public class S3StorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
        Set.of("image/jpeg", "image/png", "application/pdf");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024L; // 10 MB

    @Autowired private S3Client s3Client;
    @Value("${aws.s3.bucket}") private String bucket;

    public String upload(MultipartFile file, Long providerId, DocumentType type) {
        validateFile(file);
        String key = "providers/%d/documents/%s/%s"
            .formatted(providerId, type.name().toLowerCase(),
                       UUID.randomUUID() + "_" + file.getOriginalFilename());
        try {
            s3Client.putObject(
                PutObjectRequest.builder()
                    .bucket(bucket).key(key).contentType(file.getContentType()).build(),
                RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );
        } catch (IOException e) {
            throw new SystemException("ファイルアップロードに失敗しました", e);
        }
        return key;
    }

    public void delete(String s3Key) {
        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(s3Key).build());
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileTooLargeException("ファイルサイズは 10 MB 以内にしてください");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new UnsupportedFileTypeException("JPG / PNG / PDF のみ対応しています");
        }
    }
}
```

---

## 8. バッチ処理

> バッチ実行時刻は全て JST 基準（cron は 6 フィールド・UTC 値で指定）

| バッチ | cron（UTC） | JST 実行時刻 | 処理内容 |
|--------|-------------|------------|---------|
| BookingReleaseBatch | `0 0 15 * * ?` | 0:00 | 2ヶ月先の空き枠を予約解放 |
| TicketExpiryBatch | `0 0 15 * * ?` | 0:00 | 期限切れチケットを論理削除 |
| PenaltyExpiryBatch | `0 0 16 * * ?` | 1:00 | 3ヶ月経過ペナルティを無効化 |
| NoShowDetectionBatch | `0 0,30 * * * ?` | 毎時 0 分・30 分 | 無断キャンセル検知 |
| ReminderEmailBatch | `0 0 22 * * ?` | 7:00 | 翌日リマインドメール |

```java
// BookingReleaseBatch
@Scheduled(cron = "0 0 15 * * ?", zone = "UTC")
public void releaseBookings() {
    LocalDate today = LocalDate.now(ZoneId.of("Asia/Tokyo"));
    LocalDate releaseDate = today.plusMonths(2);  // N ヶ月後の計算 → 02_business_rules.md §6.2
    availabilityRepository.releaseByDate(releaseDate);
}

// PenaltyExpiryBatch
@Scheduled(cron = "0 0 16 * * ?", zone = "UTC")
public void expirePenalties() {
    penaltyRepository.deactivateExpired(Instant.now());
}
```

---

## 9. メール送信

```java
@Service
public class EmailService {
    @Async
    public void sendBookingConfirmation(Booking booking) { /* booking-confirmation.html */ }
}
```

| トリガー | テンプレート |
|---------|------------|
| 予約確定 | `booking-confirmation.html` |
| キャンセル | `booking-cancelled.html` |
| ペナルティ付与 | `penalty-applied.html` |
| プロバイダー申請受付 | `provider-application-received.html` |
| プロバイダー承認 | `provider-approved.html` |
| プロバイダー却下 | `provider-rejected.html` |
| 翌日リマインド | `reminder.html` |

---

## 10. エラーハンドリング

### 例外クラス階層

```
airetiaException（RuntimeException）
├── ResourceNotFoundException（404）
├── ValidationException（400）
├── InsufficientTicketsException（422）
├── BookingConflictException（409）
├── BookingLimitExceededException（422）
├── BusinessRuleViolationException（422）
├── AccountSuspendedException（403）
├── AdminMemberFeatureForbiddenException（403）
├── FileTooLargeException（413）
└── UnsupportedFileTypeException（415）
```

### GlobalExceptionHandler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(airetiaException.class)
    public ResponseEntity<ErrorResponse> handleairetia(airetiaException ex) {
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus())
            .body(ErrorResponse.of(ex));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<FieldError> errors = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> new FieldError(e.getField(), e.getDefaultMessage()))
            .toList();
        return ResponseEntity.badRequest().body(ErrorResponse.validation(errors));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleFileSize(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
            .body(ErrorResponse.of(ErrorCode.FILE_TOO_LARGE, "ファイルサイズは 10 MB 以内にしてください"));
    }
}
```

---

## 11. テスト戦略

| テスト種別 | ツール | 対象 |
|----------|--------|------|
| 単体テスト | JUnit5 + Mockito | ビジネスルールクラス |
| 統合テスト | @SpringBootTest + MockMvc | Controller → DB |
| DB テスト | @DataJpaTest | Repository |

### テスト必須ケース

- 予約上限 30 件超過でエラー
- 1 日 3 件超過でエラー
- 時間重複でエラー
- チケット残高不足でエラー
- キャンセル返還枚数計算（境界値: ちょうど 1440 分・720 分・30 分・29 分）
- 無断キャンセルペナルティ付与
- 自分のサービス予約でエラー
- 管理者による予約・チケット消費・Participant 作成でエラー
- 10 MB 超ファイルで 413 エラー
- 対応外形式ファイルで 415 エラー
- 書類 3 種類アップロード完了後に Provider ステータスが `PENDING` に遷移すること
- `ticketsConsumed` が NO_SHOW 後も保持されていること（報酬計算の正確性）

---

*関連: [06_infrastructure.md](./06_infrastructure.md)*
