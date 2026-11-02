/**
 * =========================================
 * Tabsコンポーネント（タブ切り替え）
 * =========================================
 */

import styles from './Tabs.module.css'

interface Tab {
  key: string
  label: string
  disabled?: boolean
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (key: string) => void
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.tabList}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            disabled={tab.disabled}
            className={`${styles.tab} ${
              activeTab === tab.key ? styles.active : ''
            } ${tab.disabled ? styles.disabled : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}