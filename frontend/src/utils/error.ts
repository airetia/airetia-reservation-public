// frontend/src/utils/error.ts
import axios from 'axios'

/**
 * エラーメッセージ抽出ユーティリティ
 * → 05_frontend_specification.md §10
 *
 * フォーム送信・API 呼び出しの catch ブロックで使用する。
 * サーバーからのメッセージを優先し、なければデフォルトメッセージを返す。
 *
 * 使用例:
 *   } catch (err) {
 *     showToast(extractErrorMessage(err), 'error')
 *   }
 */

export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    // サーバーレスポンスのメッセージを優先（httpClient インターセプターで err.message にも設定済み）
    return err.response?.data?.message ?? err.message ?? '予期せぬエラーが発生しました'
  }
  if (err instanceof Error) return err.message
  return '予期せぬエラーが発生しました'
}

/**
 * フィールドエラー一覧抽出（バリデーションエラー用）
 * → 03_common_specification.md §6 エラーレスポンス形式
 */
export function extractFieldErrors(
  err: unknown
): Record<string, string> {
  if (!axios.isAxiosError(err)) return {}
  const errors: { field: string; message: string }[] =
    err.response?.data?.errors ?? []
  return Object.fromEntries(errors.map(e => [e.field, e.message]))
}
