<script setup>
import { getTeamInfoApi } from '@/api/my'
import { ref } from 'vue'
import dayjs from 'dayjs'
const teamInfo = ref({
    team_list: [],
    team_summary: {},
})
getTeamInfoApi().then(res => {
    teamInfo.value = res.data || {
        team_list: [],
        team_summary: {},
    }
})
</script>
<template>
    <van-nav-bar
        safe-area-inset-top
        :title="$t('team.title')"
        left-arrow
        @click-left="$router.back()"
        fixed
        placeholder
    />
    <div class="flex-auto overflow-auto team-page">
        <div class="c-card-box flex justify-between flex-shrink-0">
            <div class="info-box">
                <div class="value">{{ teamInfo.team_summary.total_deposit_amount || 0 }}</div>
                <div class="label">{{ $t('team.label1') }}</div>
            </div>
            <div class="info-box">
                <div class="value">{{ teamInfo.team_summary.total_month_deposit_amount || 0 }}</div>
                <div class="label">{{ $t('team.label2') }}</div>
            </div>
            <div class="info-box">
                <div class="value">
                    {{ teamInfo.team_summary.total_deposit_reward_amount || 0 }}
                </div>
                <div class="label">{{ $t('team.label3') }}</div>
            </div>
        </div>
        <div class="team-title">{{ $t('team.title2') }}</div>
        <div class="c-card-box flex-auto overflow-auto">
            <div class="th-box">
                <div class="w-1/12">
                    {{ $t('team.th1') }}
                </div>
                <div class="w-3/12">
                    {{ $t('team.th2') }}
                </div>
                <div class="w-3/12">
                    {{ $t('team.th3') }}
                </div>
                <div class="w-2/12">
                    {{ $t('team.th4') }}
                </div>
                <div class="w-3/12">
                    {{ $t('team.th5') }}
                </div>
            </div>
            <div class="td-box" v-for="item in teamInfo.team_list.items" :key="item.id">
                <div class="w-1/12">
                    <img v-if="item.user.avatar" :src="item.user.avatar" class="w-4 h-4 rounded-full" alt="" />
                    <img v-else src="./img/default.png" class="w-4 h-4 rounded-full" alt="" />
                </div>
                <div class="w-3/12">
                    {{ item.user.phone }}
                </div>
                <div class="w-3/12">
                    {{ dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')}}
                </div>
                <div class="w-2/12">
                    {{ item.team_count}}
                </div>
                <div class="w-3/12">
                    {{ item.deposit_reward_amount }}
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.team-page {
    background-color: #f5f5f5;
    padding: 20px;
    display: flex;
    flex-direction: column;
    .info-box {
        text-align: center;
        width: 33%;
        flex: auto;
        .value {
            color: #000;
            text-align: center;
          
            font-size: 16px;
            font-style: normal;
            font-weight: 500;
            line-height: 140%; /* 22.4px */
            letter-spacing: 0.5px;
        }
        .label {
            color: #6b6b6b;
            text-align: center;
          
            font-size: 10px;
            font-style: normal;
            font-weight: 400;
            line-height: 140%; /* 14px */
            letter-spacing: 0.5px;
            margin-top: 8px;
        }
    }
    .team-title {
        color: #6b6b6b;
      
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 140%; /* 16.8px */
        letter-spacing: 0.5px;
        margin-bottom: 8px;
        margin-top: 6px;
        flex-shrink: 0;
    }
}
.th-box {
    display: flex;
    align-items: center;
    color: #6b6b6b;
    text-align: center;
  
    font-size: 10px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%; /* 14px */
    letter-spacing: 0.5px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding-bottom: 16px;
}
.td-box {
    display: flex;
    align-items: center;
    color: #000;
  
    font-size: 10px;
    font-style: normal;
    font-weight: 500;
    line-height: 140%; /* 14px */
    letter-spacing: 0.5px;
    margin-top: 16px;
    div {
        padding: 0 2px;
    }
}
</style>
