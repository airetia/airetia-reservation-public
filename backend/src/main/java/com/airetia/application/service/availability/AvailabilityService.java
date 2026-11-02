// backend/src/main/java/com/airetia/application/service/availability/AvailabilityService.java
package com.airetia.application.service.availability;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.application.dto.request.availability.AvailabilityRequest;
import com.airetia.application.dto.response.availability.AvailabilityResponse;
import com.airetia.domain.model.availability.Availability;
import com.airetia.domain.model.member.MemberRole;
import com.airetia.domain.model.provider.ProviderStatus;
import com.airetia.exception.BusinessException;
import com.airetia.exception.ResourceNotFoundException;
import com.airetia.infrastructure.security.MemberDetails;
import com.airetia.repository.AvailabilityRepository;
import com.airetia.repository.OfferingRepository;
import com.airetia.repository.ProviderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private static final ZoneId JST = ZoneId.of("Asia/Tokyo");

    private final AvailabilityRepository availabilityRepository;
    private final OfferingRepository offeringRepository;
    private final ProviderRepository providerRepository;

    /** 公開用：日付・オファリング指定で検索（認証不要） */
    @Transactional(readOnly = true)
    public List<AvailabilityResponse> search(LocalDate date, Long offeringId) {
        // LocalDate(JST) → UTC Instant 範囲に変換（DB は UTC 保存）
        Instant startUtc = date != null ? date.atStartOfDay(JST).toInstant() : null;
        Instant endUtc   = date != null ? date.plusDays(1).atStartOfDay(JST).toInstant() : null;
        return availabilityRepository.findBookableByDateAndOffering(startUtc, endUtc, offeringId)
                .stream()
                .map(a -> AvailabilityResponse.from(a,
                        availabilityRepository.countConfirmedBookings(a.getId())))
                .toList();
    }

    /** プロバイダー自身の空き枠一覧（AvailabilityController の ?mySlots=true 対応） */
    @Transactional(readOnly = true)
    public List<AvailabilityResponse> searchByProvider(MemberDetails memberDetails) {
        return getMyAvailabilities(memberDetails);
    }

    /** 空き枠詳細（認証不要） */
    @Transactional(readOnly = true)
    public AvailabilityResponse getOne(Long id) {
        var a = findById(id);
        return AvailabilityResponse.from(a, availabilityRepository.countConfirmedBookings(id));
    }

    /** プロバイダー自身の空き枠一覧 */
    @Transactional(readOnly = true)
    public List<AvailabilityResponse> getMyAvailabilities(MemberDetails memberDetails) {
        var provider = requireApprovedProvider(memberDetails);
        return availabilityRepository.findByProviderIdOrderByStartDatetimeAsc(provider.getId())
                .stream()
                .map(a -> AvailabilityResponse.from(a,
                        availabilityRepository.countConfirmedBookings(a.getId())))
                .toList();
    }

    /** 空き枠作成 */
    @Transactional
    public AvailabilityResponse create(MemberDetails memberDetails, AvailabilityRequest req) {
        var provider = requireApprovedProvider(memberDetails);
        var offering = offeringRepository.findById(req.getOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("サービスが見つかりません"));
        if (!offering.getProvider().getId().equals(provider.getId())) {
            throw new BusinessException("他のプロバイダーのサービスには空き枠を登録できません");
        }
        if (!req.getStartDatetime().isBefore(req.getEndDatetime())) {
            throw new BusinessException("開始日時は終了日時より前に設定してください");
        }
        // 登録可能期間チェック：当日〜3ヶ月後の月末
        LocalDate startDate = req.getStartDatetime().atZone(JST).toLocalDate();
        LocalDate today     = LocalDate.now(JST);
        LocalDate maxDate   = today.plusMonths(3).withDayOfMonth(
                today.plusMonths(3).lengthOfMonth());
        if (startDate.isBefore(today) || startDate.isAfter(maxDate)) {
            throw new BusinessException("空き枠は本日〜3ヶ月後の月末の範囲で登録してください");
        }
        Availability av = Availability.builder()
                .provider(provider)
                .offering(offering)
                .startDatetime(req.getStartDatetime())
                .endDatetime(req.getEndDatetime())
                .capacity(req.getCapacity())
                .build();
        av = availabilityRepository.save(av);
        return AvailabilityResponse.from(av, 0L);
    }

    /** 定員変更のみ許可 */
    @Transactional
    public AvailabilityResponse updateCapacity(Long id, MemberDetails memberDetails, Integer capacity) {
        Availability av = findById(id);
        checkOwner(av, memberDetails);
        long booked = availabilityRepository.countConfirmedBookings(id);
        if (capacity < booked) {
            throw new BusinessException(
                    String.format("既存予約数（%d件）より小さい定員には変更できません", booked));
        }
        av.updateCapacity(capacity);
        availabilityRepository.save(av);
        return AvailabilityResponse.from(av, booked);
    }

    /** 空き枠削除（予約がある場合は不可） */
    @Transactional
    public void delete(Long id, MemberDetails memberDetails) {
        Availability av = findById(id);
        checkOwner(av, memberDetails);
        if (availabilityRepository.countConfirmedBookings(id) > 0) {
            throw new BusinessException("予約が入っている空き枠は削除できません");
        }
        availabilityRepository.deleteById(id);
    }

    private Availability findById(Long id) {
        return availabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("空き枠が見つかりません"));
    }

    private com.airetia.domain.model.provider.Provider requireApprovedProvider(MemberDetails md) {
        var provider = providerRepository.findByMemberId(md.getId())
                .orElseThrow(() -> new BusinessException("プロバイダー登録が必要です"));
        if (provider.getStatus() != ProviderStatus.APPROVED) {
            throw new BusinessException("承認済みプロバイダーのみ操作できます");
        }
        return provider;
    }

    private void checkOwner(Availability av, MemberDetails md) {
        boolean isAdmin = md.getMember().getRole() == MemberRole.ADMIN;
        if (!isAdmin && !av.getProvider().getMember().getId().equals(md.getId())) {
            throw new BusinessException("この空き枠を操作する権限がありません");
        }
    }
}