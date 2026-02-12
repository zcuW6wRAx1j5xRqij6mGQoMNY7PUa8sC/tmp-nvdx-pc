<script setup>
import { transferHistoryApi } from '@/api/my'
import useList from '@/hooks/useList'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import { friendlyNumber } from '@/utils/utils'
const { showList, loading, finished, onLoad } = useList(transferHistoryApi)
const { t } = useI18n()

// 划转方向映射
const getTransferDirection = (flowType) => {
    if (flowType === 'transfer_in') {
        return t('transformHis.type.type1')
    } else if (flowType === 'transfer_out') {
        return t('transformHis.type.type2')
    }
}

onMounted(onLoad)
</script>
<!--  -->
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="$t('transformHis.title')"
        left-arrow
        @click-left="$router.back()"
        fixed
        placeholder
    >
    </van-nav-bar>
    <div class="transfer-history-page">
        <div class="header-labels">
            <div class="label">{{ $t('transformHis.showItem.label2') }}</div>
            <div class="label">{{ $t('transformHis.showItem.label1') }}</div>
        </div>
        <NoData v-if="!showList.length"></NoData>
        
        <van-list
            v-model:loading="loading"
            :finished="finished"
            :finished-text="$t('common.noMore')"
            @load="onLoad"
            v-if="showList.length"
        >
            <div
                v-for="item in showList"
                :key="item.id"
                class="transfer-item"
            >
                <div class="amount">{{ friendlyNumber(item.amount) }} USD</div>
                <div class="direction-info">
                    <div class="direction">{{ getTransferDirection(item.flow_type) }}</div>
                    <div class="time">{{ dayjs(item.created_at).format('YYYY.MM.DD HH:mm:ss') }}</div>
                </div>
            </div>
        </van-list>
    </div>
</template>

<style scoped lang="scss">
.transfer-history-page {
    padding: 16px;
}

.header-labels {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    .label {
        color: #666;
        font-size: 14px;
        font-weight: 400;
    }
}

.transfer-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid #1a1a1a;
    
    &:last-child {
        border-bottom: none;
    }
    
    .amount {
        // color: #fff;
		color: var(--text-color);
        font-size: 16px;
        font-weight: 500;
        font-family: DIN;
    }
    
    .direction-info {
        text-align: right;
        
        .direction {
            // color: #fff;
			color: var(--text-color);
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 4px;
        }
        
        .time {
            color: #666;
            font-size: 12px;
            font-weight: 400;
        }
    }
}
</style>

