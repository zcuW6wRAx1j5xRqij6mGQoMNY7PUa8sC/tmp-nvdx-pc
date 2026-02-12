class sessionStorageProxy {
    constructor(storageModel) {
        this.storage = storageModel
    }

    setItem(key, value) {
        this.storage.setItem(key, JSON.stringify(value))
    }

    getItem(key) {
        return JSON.parse(this.storage.getItem(key))
    }

    removeItem(key) {
        this.storage.removeItem(key)
    }

    clear() {
        this.storage.clear()
    }
}

class localStorageProxy extends sessionStorageProxy {
    constructor(localStorage) {
        super(localStorage)
    }
}

export const storageSession = new sessionStorageProxy(sessionStorage)

export const storageLocal = new localStorageProxy(localStorage)
