/**
 * ローカルストレージユーティリティ
 * 型安全性と例外処理を提供
 */

export const storage = {
  /**
   * アイテムを保存
   */
  set: <T>(key: string, value: T): void => {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(key, serializedValue)
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${key}`, error)
    }
  },

  /**
   * アイテムを取得
   */
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.warn(`Failed to get from localStorage: ${key}`, error)
      return null
    }
  },

  /**
   * アイテムを削除
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`Failed to remove from localStorage: ${key}`, error)
    }
  },

  /**
   * キーの存在確認
   */
  exists: (key: string): boolean => {
    try {
      return localStorage.getItem(key) !== null
    } catch (error) {
      console.warn(`Failed to check localStorage: ${key}`, error)
      return false
    }
  },

  /**
   * すべてクリア
   */
  clear: (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      console.warn('Failed to clear localStorage', error)
    }
  },

  /**
   * ストレージサイズを取得（概算）
   */
  getSize: (): number => {
    let total = 0
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length
        }
      }
    } catch (error) {
      console.warn('Failed to calculate localStorage size', error)
    }
    return total
  },
}

/**
 * セッションストレージユーティリティ
 */
export const sessionStorage = {
  set: <T>(key: string, value: T): void => {
    try {
      const serializedValue = JSON.stringify(value)
      window.sessionStorage.setItem(key, serializedValue)
    } catch (error) {
      console.warn(`Failed to save to sessionStorage: ${key}`, error)
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const item = window.sessionStorage.getItem(key)
      if (item === null) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.warn(`Failed to get from sessionStorage: ${key}`, error)
      return null
    }
  },

  remove: (key: string): void => {
    try {
      window.sessionStorage.removeItem(key)
    } catch (error) {
      console.warn(`Failed to remove from sessionStorage: ${key}`, error)
    }
  },

  clear: (): void => {
    try {
      window.sessionStorage.clear()
    } catch (error) {
      console.warn('Failed to clear sessionStorage', error)
    }
  },
}

export default storage