// backend/src/main/java/com/airetia/infrastructure/security/MemberDetailsService.java
package com.airetia.infrastructure.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.domain.model.member.Member;
import com.airetia.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

/**
 * Spring Security UserDetailsService実装
 * 
 * メールアドレスでメンバーを検索し、認証情報を提供
 */
@Service
@RequiredArgsConstructor
public class MemberDetailsService implements UserDetailsService {
    
    private final MemberRepository memberRepository;
    
    /**
     * ユーザー名（メールアドレス）でメンバーを検索
     * 
     * @param email メールアドレス
     * @return UserDetails 認証情報
     * @throws UsernameNotFoundException メンバーが見つからない場合
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Member member = memberRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException(
                "ユーザーが見つかりません: " + email
            ));
        
        return new MemberDetails(member);
    }
}