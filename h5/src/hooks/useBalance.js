// 现货获取余额
import { getSpotWalletApi, getContractWalletApi } from '@/api/my'
import { setDataToNumber, formatByCoinType } from '@/utils/utils'
// type 1现货 2合约
export function useBalance(params = [], is_otc = 0) {
    const walletInfo = ref({
        total: '',
        coins: {
            items: [],
        },
    })
    const contractWallet = ref({})
    const contractWalletOriginal = ref({})
    const getWalletData = type => {
        if (type === 1) {
            getSpotWalletApi(is_otc).then(data => {
                walletInfo.value = data || {
                    total: '',
                    coins: [],
                }
            })
        }
        if (type === 2) {
            getContractWalletApi().then(data => {
                contractWallet.value = setDataToNumber(data || {})
                contractWalletOriginal.value = data || {}
            })
        }
    }
    if (params.length) {
        params.forEach(item => {
            getWalletData(item)
        })
    }
    // 获取现货
    const getSpotBalance = coin => {
        return formatByCoinType(
            walletInfo.value.coins.items.find(item => item.coin_name === coin)?.amount || 0,coin,false,true
        )
    }
    // 获取合约
    const getContractBalance = computed(() => {
        return contractWallet.value.balance
    })
    return {
        getWalletData,
        walletInfo,
        contractWallet,
        getSpotBalance,
        getContractBalance,
        contractWalletOriginal
    }
}
