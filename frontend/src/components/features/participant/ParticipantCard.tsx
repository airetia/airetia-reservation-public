// frontend/src/components/features/participant/ParticipantCard.tsx
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import type { ParticipantListItem } from '@/models/participant'
import { GenderLabel } from '@/models/enums'
import styles from './ParticipantCard.module.css'

interface ParticipantCardProps {
  participant: ParticipantListItem
  onEdit: () => void
  onDelete: () => void
  onViewBookings: () => void
}

function calcAge(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function getFullName(p: ParticipantListItem): string {
  if ((p as any).full_name) return (p as any).full_name
  return `${(p as any).last_name ?? p.lastName ?? ''} ${(p as any).first_name ?? p.firstName ?? ''}`.trim() || '名前未設定'
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  onEdit,
  onDelete,
  onViewBookings,
}) => {
  const fullName = getFullName(participant)
  const age = participant.age ?? calcAge((participant as any).birth_date ?? participant.birthDate)
  const gender = participant.gender ? (GenderLabel[participant.gender] ?? '未設定') : '未設定'

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar}>{fullName.charAt(0) || '?'}</div>
        <div className={styles.info}>
          <div className={styles.name}>{fullName}</div>
          <div className={styles.meta}>
            {age !== null ? `${age}歳` : '年齢未設定'} ・ {gender}
          </div>
          {((participant as any).has_active_penalty ?? participant.hasActivePenalty) && (
            <div className={styles.penalty}>⚠️ 要注意マーク</div>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <Button variant="secondary" size="small" onClick={onViewBookings}>予約一覧</Button>
        <Button variant="secondary" size="small" onClick={onEdit}>編集</Button>
        <Button variant="danger" size="small" onClick={onDelete}>削除</Button>
      </div>
    </Card>
  )
}