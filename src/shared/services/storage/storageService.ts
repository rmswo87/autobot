// 스토리지 서비스 (localStorage, sessionStorage 관리)

class StorageService {
  private storage: Storage

  constructor(storage: Storage = localStorage) {
    this.storage = storage
  }

  get<T = unknown>(key: string): T | null {
    try {
      const item = this.storage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error getting item from storage: ${key}`, error)
      return null
    }
  }

  set<T = unknown>(key: string, value: T): void {
    try {
      this.storage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting item to storage: ${key}`, error)
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item from storage: ${key}`, error)
    }
  }

  clear(): void {
    try {
      this.storage.clear()
    } catch (error) {
      console.error('Error clearing storage', error)
    }
  }
}

// 인스턴스 export
export const localStorageService = new StorageService(localStorage)
export const sessionStorageService = new StorageService(sessionStorage)

// 편의 함수들
export const storage = {
  get: <T = unknown>(key: string) => localStorageService.get<T>(key),
  set: <T = unknown>(key: string, value: T) => localStorageService.set(key, value),
  remove: (key: string) => localStorageService.remove(key),
  clear: () => localStorageService.clear(),
}

