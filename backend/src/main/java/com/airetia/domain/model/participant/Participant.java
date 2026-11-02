// backend/src/main/java/com/airetia/domain/model/participant/Participant.java
package com.airetia.domain.model.participant;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.airetia.domain.model.common.BaseEntity;
import com.airetia.domain.model.common.Gender;
import com.airetia.domain.model.member.Member;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 利用者エンティティ（SELF / CHILD）
 * DB: V8__create_participants.sql
 * 02_business_rules.md §5.4
 */
@Entity
@Table(name = "participants")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Participant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Enumerated(EnumType.STRING)
    @Column(name = "participant_type", nullable = false, length = 20)
    private ParticipantType participantType;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "first_name_kana", length = 50)
    private String firstNameKana;

    @Column(name = "last_name_kana", length = 50)
    private String lastNameKana;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Gender gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    /** プロバイダーが参照する利用者特記事項（任意） */
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder
    public Participant(Member member, ParticipantType participantType,
                       String firstName, String lastName,
                       String firstNameKana, String lastNameKana,
                       Gender gender, LocalDate birthDate, String notes) {
        this.member          = member;
        this.participantType = participantType;
        this.firstName       = firstName;
        this.lastName        = lastName;
        this.firstNameKana   = firstNameKana;
        this.lastNameKana    = lastNameKana;
        this.gender          = gender;
        this.birthDate       = birthDate;
        this.notes           = notes;
    }

    /** 利用者情報更新 */
    public void update(String firstName, String lastName,
                       String firstNameKana, String lastNameKana,
                       Gender gender, LocalDate birthDate, String notes) {
        if (firstName != null)     this.firstName     = firstName;
        if (lastName  != null)     this.lastName      = lastName;
        if (firstNameKana != null) this.firstNameKana = firstNameKana;
        if (lastNameKana  != null) this.lastNameKana  = lastNameKana;
        if (gender    != null)     this.gender        = gender;
        if (birthDate != null)     this.birthDate     = birthDate;
        if (notes     != null)     this.notes         = notes;
    }

    /** 論理削除（予約なし確認後に呼ぶ） */
    public void deactivate() {
        this.isActive = false;
    }
}