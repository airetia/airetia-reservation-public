// backend/src/test/java/com/airetia/repository/MemberRepositoryTest.java
package com.airetia.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.airetia.domain.model.member.Member;
import com.airetia.domain.model.member.MemberRole;

/**
 * 修正:
 *   - gender フィールドを削除（Member エンティティに gender は存在しない。
 *     gender は participants テーブルで管理 / 06_infrastructure.md §2.2）
 *   - role を追加（@Column(nullable = false) のため保存前に必須）
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class MemberRepositoryTest {

    @Autowired
    MemberRepository memberRepository;

    @Test
    void saveMember_success() {
        Member member = Member.builder()
            .firstName("太郎")
            .lastName("山田")
            .firstNameKana("タロウ")
            .lastNameKana("ヤマダ")
            .email("test-" + System.currentTimeMillis() + "@example.com") // 重複回避
            .passwordHash(new BCryptPasswordEncoder().encode("Password123"))
            .role(MemberRole.MEMBER)  // nullable = false のため必須
            .birthDate(LocalDate.of(1990, 1, 1))
            .postalCode("1234567")
            .address("東京都渋谷区")
            .phoneNumber("09012345678")
            .build();

        Member saved = memberRepository.save(member);

        assertNotNull(saved.getId());
        assertEquals(MemberRole.MEMBER, saved.getRole());
    }
}