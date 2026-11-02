// backend/src/main/java/com/airetia/application/service/offering/OfferingService.java
package com.airetia.application.service.offering;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.application.dto.request.offering.OfferingRequest;
import com.airetia.application.dto.response.offering.OfferingResponse;
import com.airetia.domain.model.category.MajorCategory;
import com.airetia.domain.model.category.MiddleCategory;
import com.airetia.domain.model.category.ServiceType;
import com.airetia.domain.model.category.Tag;
import com.airetia.domain.model.member.MemberRole;
import com.airetia.domain.model.offering.Offering;
import com.airetia.domain.model.provider.ProviderStatus;
import com.airetia.exception.BusinessException;
import com.airetia.exception.ResourceNotFoundException;
import com.airetia.infrastructure.security.MemberDetails;
import com.airetia.repository.BookingRepository;
import com.airetia.repository.MajorCategoryRepository;
import com.airetia.repository.MiddleCategoryRepository;
import com.airetia.repository.OfferingRepository;
import com.airetia.repository.ProviderRepository;
import com.airetia.repository.ServiceTypeRepository;
import com.airetia.repository.TagRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OfferingService {

    private final OfferingRepository       offeringRepository;
    private final ProviderRepository       providerRepository;
    private final BookingRepository        bookingRepository;
    private final ServiceTypeRepository    serviceTypeRepository;
    private final MajorCategoryRepository  majorCategoryRepository;
    private final MiddleCategoryRepository middleCategoryRepository;
    private final TagRepository            tagRepository;

    @Transactional(readOnly = true)
    public List<OfferingResponse> getActiveOfferings() {
        var offerings = offeringRepository.findByActiveTrue();
        Instant now = Instant.now();
        Instant since30 = now.minus(30, ChronoUnit.DAYS);
        Instant since90 = now.minus(90, ChronoUnit.DAYS);
        Map<Long, Double> cache = new HashMap<>();
        return offerings.stream().map(o -> {
            double score = cache.computeIfAbsent(o.getProvider().getId(),
                id -> computeScore(id, o.getProvider().getCreatedAt(), since30, since90, now));
            return OfferingResponse.from(o, score);
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<OfferingResponse> getMyOfferings(MemberDetails md) {
        var provider = providerRepository.findByMemberId(md.getId())
            .orElseThrow(() -> new ResourceNotFoundException("プロバイダー情報が見つかりません"));
        return offeringRepository.findByProvider_IdOrderByCreatedAtDesc(provider.getId())
            .stream().map(OfferingResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public OfferingResponse getOffering(Long id) {
        var o = findById(id);
        Instant now = Instant.now();
        double score = computeScore(o.getProvider().getId(), o.getProvider().getCreatedAt(),
            now.minus(30, ChronoUnit.DAYS), now.minus(90, ChronoUnit.DAYS), now);
        return OfferingResponse.fromDetail(o, score);
    }

    @Transactional
    public OfferingResponse create(MemberDetails md, OfferingRequest req) {
        var provider = resolveProvider(md, req.getProviderId());
        validateDuration(req.getDurationMinutes());

        var serviceType   = resolveServiceType(req.getServiceTypeCode());
        var majorCategory = resolveMajorCategory(req.getMajorCategoryCode());
        var middles       = resolveMiddleCategories(req.getMiddleCategoryCodes());
        var tags          = resolveTags(req.getTagCodes());

        var offering = Offering.builder()
            .provider(provider).serviceType(serviceType).majorCategory(majorCategory)
            .middleCategories(middles).tags(tags)
            .title(req.getTitle()).description(req.getDescription())
            .deliveryMethod(req.getDeliveryMethod())
            .durationMinutes(req.getDurationMinutes())
            .ticketsRequired(req.getTicketsRequired()).capacity(req.getCapacity())
            .build();
        return OfferingResponse.from(offeringRepository.save(offering));
    }

    @Transactional
    public OfferingResponse update(Long id, MemberDetails md, OfferingRequest req) {
        var offering = findById(id);
        checkOwner(offering, md);
        validateDuration(req.getDurationMinutes());
        offering.update(
            req.getTitle(), req.getDescription(), req.getDeliveryMethod(),
            req.getDurationMinutes(), req.getTicketsRequired(), req.getCapacity(),
            resolveMajorCategory(req.getMajorCategoryCode()),
            resolveMiddleCategories(req.getMiddleCategoryCodes()),
            resolveTags(req.getTagCodes())
        );
        return OfferingResponse.from(offeringRepository.save(offering));
    }

    @Transactional
    public void delete(Long id, MemberDetails md) {
        var offering = findById(id);
        checkOwner(offering, md);
        if (offeringRepository.countActiveBookingsByOfferingId(id) > 0)
            throw new BusinessException("有効な予約があるサービスは削除できません");
        offering.deactivate();
        offeringRepository.save(offering);
    }

    // ── private helpers ──────────────────────────────────────────────

    private com.airetia.domain.model.provider.Provider resolveProvider(MemberDetails md, Long targetId) {
        if (md.getMember().getRole() == MemberRole.ADMIN) {
            if (targetId == null) throw new BusinessException("providerId を指定してください");
            var p = providerRepository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("プロバイダーが見つかりません"));
            if (p.getStatus() != ProviderStatus.APPROVED)
                throw new BusinessException("承認済みプロバイダーのみ作成できます");
            return p;
        }
        var p = providerRepository.findByMemberId(md.getId())
            .orElseThrow(() -> new BusinessException("プロバイダー登録が必要です"));
        if (p.getStatus() != ProviderStatus.APPROVED)
            throw new BusinessException("承認済みプロバイダーのみ作成できます");
        return p;
    }

    private ServiceType resolveServiceType(String code) {
        final String resolvedCode = (code != null) ? code : "TUTORING";
        return serviceTypeRepository.findByCode(resolvedCode)
            .orElseThrow(() -> new BusinessException("サービス種別が見つかりません: " + resolvedCode));
    }

    private MajorCategory resolveMajorCategory(String code) {
        if (code == null) throw new BusinessException("大分類を選択してください");
        final String c = code;
        return majorCategoryRepository.findByCode(c)
            .orElseThrow(() -> new BusinessException("大分類が見つかりません: " + c));
    }

    private Set<MiddleCategory> resolveMiddleCategories(Set<String> codes) {
        if (codes == null || codes.isEmpty()) return new HashSet<>();
        return codes.stream()
            .map(c -> middleCategoryRepository.findByCode(c)
                .orElseThrow(() -> new BusinessException("中分類が見つかりません: " + c)))
            .collect(Collectors.toSet());
    }

    private Set<Tag> resolveTags(Set<String> codes) {
        if (codes == null || codes.isEmpty()) return new HashSet<>();
        return codes.stream()
            .map(c -> tagRepository.findByCode(c)
                .orElseThrow(() -> new BusinessException("タグが見つかりません: " + c)))
            .collect(Collectors.toSet());
    }

    private Offering findById(Long id) {
        return offeringRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("サービスが見つかりません"));
    }

    private void checkOwner(Offering o, MemberDetails md) {
        if (md.getMember().getRole() == MemberRole.ADMIN) return;
        Long pid = providerRepository.findByMemberId(md.getId()).map(p -> p.getId()).orElse(null);
        if (pid == null || !o.getProvider().getId().equals(pid))
            throw new BusinessException("編集権限がありません");
    }

    private void validateDuration(Integer d) {
        if (d == null || d < 15 || d > 120 || d % 15 != 0)
            throw new BusinessException("時間は15〜120分・15分刻みで指定してください");
    }

    private double computeScore(Long pid, Instant createdAt, Instant since30, Instant since90, Instant now) {
        long c30 = bookingRepository.countCompletedByProviderSince(pid, since30, now);
        long c90 = bookingRepository.countCompletedByProviderSince(pid, since90, now);
        long r90 = bookingRepository.countResolvedByProviderSince(pid, since90, now);
        double util       = Math.min(c30 / 10.0, 1.0);
        double completion = r90 > 0 ? (double) c90 / r90 : 1.0;
        long days = ChronoUnit.DAYS.between(createdAt, now);
        double bonus = days <= 60 ? 1.0 : days <= 120 ? 0.5 : 0.0;
        return util * 0.4 + completion * 0.4 + bonus * 0.2;
    }
}