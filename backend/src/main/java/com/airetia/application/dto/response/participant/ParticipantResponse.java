// backend/src/main/java/com/airetia/application/dto/response/participant/ParticipantResponse.java
package com.airetia.application.dto.response.participant;

import java.time.LocalDate;

import com.airetia.domain.model.common.Gender;
import com.airetia.domain.model.participant.Participant;
import com.airetia.domain.model.participant.ParticipantType;

import lombok.Builder;
import lombok.Getter;

/**
 * 利用者レスポンス DTO
 * DB: participants テーブル（V8__create_participants.sql）
 * 01_glossary.md §2 Participant
 *
 * hasActivePenalty: ParticipantService 側でペナルティ確認後に上書きする
 * active: Participant.isActive (Boolean wrapper) → Boolean.TRUE.equals() で null safe 判定
 */
@Getter
@Builder
public class ParticipantResponse {

    private Long            id;
    private Long            memberId;
    private ParticipantType participantType;
    private String          firstName;
    private String          lastName;
    private String          firstNameKana;
    private String          lastNameKana;
    private Gender          gender;
    private LocalDate       birthDate;
    private String          notes;
    private boolean         active;
    private boolean         hasActivePenalty;

    public static ParticipantResponse from(Participant participant) {
        return ParticipantResponse.builder()
            .id(participant.getId())
            .memberId(participant.getMember().getId())
            .participantType(participant.getParticipantType())
            .firstName(participant.getFirstName())
            .lastName(participant.getLastName())
            .firstNameKana(participant.getFirstNameKana())
            .lastNameKana(participant.getLastNameKana())
            .gender(participant.getGender())
            .birthDate(participant.getBirthDate())
            .notes(participant.getNotes())
            .active(Boolean.TRUE.equals(participant.getIsActive()))
            .hasActivePenalty(false)
            .build();
    }
}