import { getCurrencyApi } from '@/api/common'
export function useCurrency(t) {
    const currencyList = ref([])
    getCurrencyApi().then(data => {
        currencyList.value = data || []
        console.log(currencyList.value)
    })
    return { currencyList }
}
