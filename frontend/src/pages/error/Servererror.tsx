// frontend/src/pages/error/Servererror.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Servererror.module.css'

export const Servererror: React.FC = () => (
  <div className={styles.page}>
    <div className={styles.card}>
      <div className={styles.icon}>⚠️</div>
      <h1 className={styles.title}>500</h1>
      <p className={styles.subtitle}>サーバーエラーが発生しました</p>
      <p className={styles.desc}>
        一時的な問題が発生しています。しばらく経ってから再度お試しください。
      </p>
      <div className={styles.actions}>
        <button className={styles.retryBtn} onClick={() => window.location.reload()}>
          再読み込み
        </button>
        <Link to="/" className={styles.homeBtn}>トップへ戻る</Link>
      </div>
    </div>
  </div>
)
