Phase 1: 認証機能（Week 2）
Day 8-9: Spring Security + BCrypt設定
SecurityConfig作成:
java// config/SecurityConfig.java
package com.airetia.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // 初期テスト用（後で有効化）
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());
        
        return http.build();
    }
}
動作確認:
bashmvn spring-boot:run
# エラーなく起動

# 未認証で /api/hello アクセス → 403 Forbidden 確認
curl http://localhost:8080/api/hello
Day 10-12: ユーザー登録API作成
DTO作成:
java// application/dto/request/auth/RegisterRequest.java
package com.airetia.application.dto.request.auth;

import com.airetia.domain.model.member.Gender;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    
    @NotBlank(message = "姓は必須です")
    @Size(max = 50)
    private String firstName;
    
    @NotBlank(message = "名は必須です")
    @Size(max = 50)
    private String lastName;
    
    @NotBlank
    @Size(max = 50)
    @Pattern(regexp = "^[ぁ-ん]+$", message = "ひらがなで入力してください")
    private String firstNameKana;
    
    @NotBlank
    @Size(max = 50)
    @Pattern(regexp = "^[ぁ-ん]+$", message = "ひらがなで入力してください")
    private String lastNameKana;
    
    @NotBlank(message = "メールアドレスは必須です")
    @Email(message = "メールアドレスの形式が正しくありません")
    private String email;
    
    @NotBlank(message = "パスワードは必須です")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,64}$",
        message = "パスワードは8文字以上64文字以下で、大文字・小文字・数字をそれぞれ1文字以上含む必要があります"
    )
    private String password;
    
    @NotNull
    @Past(message = "生年月日は過去の日付である必要があります")
    private LocalDate birthDate;
    
    @NotNull
    private Gender gender;
    
    @NotBlank
    @Pattern(regexp = "^\\d{7}$", message = "郵便番号は7桁の数字で入力してください")
    private String postalCode;
    
    @NotBlank
    @Size(max = 255)
    private String address;
    
    @NotBlank
    @Pattern(regexp = "^\\d{10,11}$", message = "電話番号は10桁または11桁の数字で入力してください")
    private String phoneNumber;
}
java// application/dto/response/auth/RegisterResponse.java
package com.airetia.application.dto.response.auth;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterResponse {
    private Long memberId;
    private String email;
    private String message;
}
Service作成:
java// application/service/auth/AuthService.java
package com.airetia.application.service.auth;

import com.airetia.application.dto.request.auth.RegisterRequest;
import com.airetia.application.dto.response.auth.RegisterResponse;
import com.airetia.domain.model.member.Member;
import com.airetia.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        
        // メールアドレス重複チェック
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("このメールアドレスは既に登録されています");
        }
        
        // パスワードハッシュ化
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        
        // メンバー作成
        Member member = Member.builder()
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .firstNameKana(request.getFirstNameKana())
            .lastNameKana(request.getLastNameKana())
            .email(request.getEmail())
            .passwordHash(hashedPassword)
            .birthDate(request.getbirthDate())
            .gender(request.getGender())
            .postalCode(request.getPostalCode())
            .address(request.getAddress())
            .phoneNumber(request.getPhoneNumber())
            .build();
        
        Member saved = memberRepository.save(member);
        
        return RegisterResponse.builder()
            .memberId(saved.getId())
            .email(saved.getEmail())
            .message("会員登録が完了しました")
            .build();
    }
}
Controller作成:
java// presentation/controller/auth/AuthController.java
package com.airetia.presentation.controller.auth;

import com.airetia.application.dto.request.auth.RegisterRequest;
import com.airetia.application.dto.response.auth.RegisterResponse;
import com.airetia.application.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
        @Valid @RequestBody RegisterRequest request
    ) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
動作確認（REST Client）:
VSCodeに REST Client 拡張機能をインストールし、以下のファイルを作成:
http### 会員登録
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
  "firstName": "太郎",
  "lastName": "山田",
  "firstNameKana": "たろう",
  "lastNameKana": "やまだ",
  "email": "test2@example.com",
  "password": "Password123",
  "birthDate": "1990-01-01",
  "gender": "MALE",
  "postalCode": "1234567",
  "address": "東京都渋谷区",
  "phoneNumber": "09012345678"
}
実行 → 201 Created & memberId 返却確認
MySQLでデータ確認:
sqlSELECT * FROM members WHERE email = 'test2@example.com';
Day 13-14: ログインAPI作成（セッションベース）
LoginRequest/Response:
java// application/dto/request/auth/LoginRequest.java
package com.airetia.application.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    
    @NotBlank(message = "メールアドレスは必須です")
    @Email
    private String email;
    
    @NotBlank(message = "パスワードは必須です")
    private String password;
}
java// application/dto/response/auth/LoginResponse.java
package com.airetia.application.dto.response.auth;

import com.airetia.domain.model.member.MemberRole;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private Long memberId;
    private String email;
    private MemberRole role;
    private String message;
}
AuthService にログインロジック追加:
java// AuthService.java に追加
@Transactional(readOnly = true)
public LoginResponse login(LoginRequest request) {
    
    // メンバー検索
    Member member = memberRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new IllegalArgumentException("メールアドレスまたはパスワードが正しくありません"));
    
    // パスワード検証
    if (!passwordEncoder.matches(request.getPassword(), member.getPasswordHash())) {
        throw new IllegalArgumentException("メールアドレスまたはパスワードが正しくありません");
    }
    
    // アカウント有効性チェック
    if (!member.getIsActive()) {
        throw new IllegalStateException("このアカウントは無効化されています");
    }
    
    return LoginResponse.builder()
        .memberId(member.getId())
        .email(member.getEmail())
        .role(member.getRole())
        .message("ログインしました")
        .build();
}
AuthController にログインエンドポイント追加:
java// AuthController.java に追加
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(
    @Valid @RequestBody LoginRequest request,
    HttpServletRequest httpRequest
) {
    LoginResponse response = authService.login(request);
    
    // セッション作成
    HttpSession session = httpRequest.getSession(true);
    session.setAttribute("memberId", response.getMemberId());
    session.setAttribute("role", response.getRole());
    
    return ResponseEntity.ok(response);
}

@PostMapping("/logout")
public ResponseEntity<Void> logout(HttpServletRequest httpRequest) {
    HttpSession session = httpRequest.getSession(false);
    if (session != null) {
        session.invalidate();
    }
    return ResponseEntity.noContent().build();
}
動作確認:
http### ログイン
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "email": "test2@example.com",
  "password": "Password123"
}

### ログアウト
POST http://localhost:8080/api/v1/auth/logout