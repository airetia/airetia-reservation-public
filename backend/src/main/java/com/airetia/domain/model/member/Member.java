// backend/src/main/java/com/airetia/domain/model/member/Member.java
package com.airetia.domain.model.member;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.airetia.domain.model.common.BaseEntity;
import com.airetia.domain.model.common.Gender;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * メンバーエンティティ
 * DB: V1__create_members.sql
 * 02_business_rules.md §7.2
 */
@Entity
@Table(name = "members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Member extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberRole role;

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(length = 50)
    private String firstNameKana;

    @Column(length = 50)
    private String lastNameKana;

    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Gender gender;

    @Column(name = "phone_number", length = 11)
    private String phoneNumber;

    @Column(length = 7)
    private String postalCode;

    @Column(length = 255)
    private String address;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private Boolean isLocked = false;

    @Column
    private Instant suspendedUntil;

    // ── ドメインメソッド ──────────────────────────────

    public void updateProfile(String firstName, String lastName,
                               String firstNameKana, String lastNameKana,
                               String phoneNumber, String postalCode,
                               String address) {
        if (firstName != null)     this.firstName     = firstName;
        if (lastName != null)      this.lastName      = lastName;
        if (firstNameKana != null) this.firstNameKana = firstNameKana;
        if (lastNameKana != null)  this.lastNameKana  = lastNameKana;
        if (phoneNumber != null)   this.phoneNumber   = phoneNumber;
        if (postalCode != null)    this.postalCode    = postalCode;
        if (address != null)       this.address       = address;
    }

    public void updateGender(Gender gender) {
        this.gender = gender;
    }

    /**
     * 利用停止（終了日時を指定）
     * PenaltyRule から日数指定で停止する場合は suspendFor(int days) を使用
     */
    public void suspend(Instant until) {
        this.isLocked      = true;
        this.suspendedUntil = until;
    }

    /**
     * 利用停止（日数指定）
     * PenaltyRule.applyForNoShow() から呼び出される
     * 02_business_rules.md §4.2
     */
    public void suspendFor(int days) {
        Instant until = LocalDate.now(ZoneId.of("Asia/Tokyo"))
            .plusDays(days)
            .atStartOfDay(ZoneId.of("Asia/Tokyo"))
            .toInstant();
        this.isLocked       = true;
        this.suspendedUntil = until;
    }

    public void unsuspend() {
        this.isLocked       = false;
        this.suspendedUntil = null;
    }

    /** 現在利用停止中か（isLocked = true かつ suspendedUntil が未来） */
    public boolean isSuspended() {
        return Boolean.TRUE.equals(this.isLocked)
            && this.suspendedUntil != null
            && this.suspendedUntil.isAfter(Instant.now());
    }

    /** アカウント削除（論理削除） */
    public void deactivate() {
        this.isActive = false;
    }

    public void changePassword(String newPasswordHash) {
        this.passwordHash = newPasswordHash;
    }

    /** MemberDetails.isAccountNonLocked() で使用 */
    public boolean isLocked() {
        return Boolean.TRUE.equals(this.isLocked);
    }

    /** MemberDetails.isEnabled() で使用 */
    public boolean isActive() {
        return Boolean.TRUE.equals(this.isActive);
    }
}