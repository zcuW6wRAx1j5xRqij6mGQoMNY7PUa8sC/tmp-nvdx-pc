<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import OpeTop from "./components/OpeTop.vue";
import BookList from "./components/BookList.vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import useSocket from "@/hooks/useSocket";
import { friendlyNumber, multiply, divide, usdcToUsd } from "@/utils/utils";
import ContractOrderCom from "./components/ContractOrderCom.vue";
import NewOpeTop from './components/NewOpeTop.vue'
import NewOpeData from './components/NewOpeData.vue'
import NewOpeBuy from './components/NewOpeBuy.vue'
import NewChart from './NewChart.vue'


import { getLeverApi } from "@/api/common";
import { getSymbolDetailApi, addContractOrderApi } from "@/api/data";
import { useBalance } from "@/hooks/useBalance";
import { showSuccessToast, showLoadingToast, closeToast } from "vant";
const { getContractBalance, getWalletData } = useBalance([2]);
const { setSub, unsubscribeChannel } = useSocket();
const { t } = useI18n();
const route = useRoute();
// 第一个组件的状态
const symbol = ref();
const symbolId = ref(+(route.query.symbolId as string));
const name = ref();

// 第二个组件的独立状态
const symbol2 = ref();
const symbolId2 = ref(+(route.query.symbolId as string));
const name2 = ref();
const bLogo2 = ref();
const spotId2 = ref();


// 基础币
const baseAsset = ref();
// 计价币
const quoteAsset = ref();
const spotId = ref();
const bLogo = ref();
const optionList = ref([])
const getOptions = (data) => {
    optionList.value = data
}
// 获取币的详情 - 第一个组件
const getDetail = () => {
    console.log(symbolId.value, 'symbolId.value');
    if (!symbolId.value) {
        return;
    }
    getSymbolDetailApi({
        symbol_id: symbolId.value,
        symbol_type: "futures",
    }).then((data) => {
        isInit = true; // 重新获取价格
        name.value = data.name;
        // baseAsset.value = data.base_asset.toUpperCase();
        // quoteAsset.value = data.quote_asset.toUpperCase();
        symbol.value = data.symbol;
        spotId.value = data.id;
        bLogo.value = data.logo;
        initFromHandle();
    });
};

// 获取币的详情 - 第二个组件
const getDetail2 = () => {
    console.log(symbolId2.value, 'symbolId2.value');
    if (!symbolId2.value) {
        return;
    }
    getSymbolDetailApi({
        symbol_id: symbolId2.value,
        symbol_type: "futures",
    }).then((data) => {
        isInit = true; // 重新获取价格
        name2.value = data.name;
        symbol2.value = data.symbol;
        bLogo2.value = data.logo;
        spotId2.value = data.id;
        baseAsset.value = data.base_asset.toUpperCase();
        quoteAsset.value = data.quote_asset.toUpperCase();
        initFromHandle();
    });
};

onMounted(() => {
    getDetail();
    // 第二个组件也需要初始化，但使用自己的symbolId2
    getDetail2();
});
const leverList = ref([]);

// 获取杠杆数据
onMounted(async () => {
    getLeverApi().then((data) => {
        leverList.value = Object.keys(data).map((el) => {
            return {
                name: `${el}X`,
                value: el,
                isDisabled: +data[el] === 0,
            };
        });
        if (leverList.value.length > 0) {
            levelSelectActiveTab.value = levelValue.value = leverList.value[0].value
            initFrom.value.leverage = leverList.value[0].value
            initFrom.value.leverLabel = `${t("contractOpe.level.tab.tab2")}${leverList.value[0].name}`
            initFromHandle()
        }
    });
});
const changeLever = () => {
    levelActiveTabName.value = levelList.value.find((el) => el.id === levelActiveTab.value)
        ?.name as string;
    height.value = anchors[1];
};
// 第一个组件的币切换事件
const bChange = (item) => {
    symbolId.value = item?.id;
    getDetail();
};

// 第二个组件的独立币切换事件
const bChange2 = (item) => {
    // 更新第二个组件的状态并获取详细信息
    name2.value = item?.name;
    symbol2.value = item?.symbol;
    symbolId2.value = item?.id;
    bLogo2.value = item?.logo;
    getDetail2();
};
// 获取当前数据给到bookList组件用于显示当前价格
// 为两个NewOpeData组件创建独立的数据存储
const nowData = ref({});
const nowData2 = ref({}); // 第二个组件的独立数据
const recordMap = ref({});
const opeData = ref()
let isInit = true;

// 修改dataChange处理函数，确保两个组件的数据独立
const dataChange = (val, _recordMap) => {
    // 更新recordMap
    recordMap.value = _recordMap;

    // 初始化价格，仅在第一个组件的数据变化时执行
    if (val.symbol === symbol2.value && isInit) {
        isInit = false;
        fromData.value.price = friendlyNumber(val.price);
    }
    // 为每个组件更新对应的数据
    if (val.symbol === symbol.value) {
        nowData.value = val;
    }
    if (val.symbol === symbol2.value) {
        nowData2.value = val;
    }
};
// 表单
// const searchList = computed(() => {
//     return [
//         {
//             name: t('contractOpe.type.type1'),
//             id: 1,
//         },
//         {
//             name: t('contractOpe.type.type2'),
//             id: 2,
//         },
//     ]
// })
const activeTab = ref(1);
// const searchChange = id => {
//     activeTab.value = id
//     initFromHandle()
// }
const isOpen = computed(() => {
    return activeTab.value === 1;
});
const dataList = computed(() => {
    return [
        {
            name: t("contractOpe.order.order2"),
            id: "market",
        },
        {
            name: t("contractOpe.order.order1"),
            id: "limit",
        },
    ];
});
const selectChange = (_, item) => {
    fromData.value.price = friendlyNumber(nowData.value.price);
    fromData.value.document_type = item.id;
    fromData.value.document_type_label = item.name;
    fromData.value.amount = "";
    slider.value = 0;
};
const errorObj = ref({});
const initFrom = ref({
    document_type_label: "",
    document_type: "market",
    price: 0, // 价格
    amount: "", // 数量
    leverage: 100, // 杠杆
    leverLabel: `${t("contractOpe.level.tab.tab2")}20x`,
    margin_type: "crossed",
});
const fromData = ref({ ...initFrom.value });
// 是否是限价订单
const isLimit = computed(() => {
    return fromData.value.document_type === "limit";
});
const slider = ref(0);
// 初始化表单
const initFromHandle = () => {
    fromData.value = {
        ...initFrom.value,
    };
    const defaultValue = dataList.value[0];
    fromData.value.document_type_label = defaultValue.name;
    fromData.value.document_type = defaultValue.id;
    fromData.value.price = friendlyNumber(nowData.value.price);
    fromData.value.leverLabel = `${t("contractOpe.level.tab.tab1")} ${fromData.value.leverage
        }x`;
};
// 是否开启止盈止损
const checked = ref(false);
const checkFrom = ref({
    sl: "",
    tp: "",
});
//  保证金  输入的数量 * 100
const bond = computed(() => {
    const _amount = String(fromData.value.amount).replace(".", '');

    return friendlyNumber(multiply(_amount, 100));
});
// const bond = ref(0);
const changeAmount = (event) => {
    //   const val = event.target.value;
    //   if (!val) {
    //     bond.value = 0;
    //   } else {
    //     bond.value = friendlyNumber(divide(val, fromData.value.leverage));
    //   }
};
const changeSlide = (val) => {
    fromData.value.amount = friendlyNumber(
        divide(
            divide(multiply(val, getContractBalance.value), 100),
            100
        )
    );
};
// 调整杠杆
const anchors = [0, Math.round(0.6 * window.innerHeight)];
const height = ref(anchors[0]);
const levelList = computed(() => [
    {
        name: t("contractOpe.level.tab.tab1"),
        id: "crossed",
    },
    {
        name: t("contractOpe.level.tab.tab2"),
        id: "isolated",
    },
]);
const levelValue = ref(100);
const levelActiveTab = ref("crossed");
const levelActiveTabName = ref("");
const levelChange = (item) => {
    if (item.isDisabled) {
        return;
    }
    levelActiveTab.value = item.id;
    levelActiveTabName.value = item.name;
};
const sureLevel = () => {
    height.value = 0;
    slider.value = 0;
    changeSlide(0);
    fromData.value.amount = "";
    checkFrom.value = {
        sl: "",
        tp: "",
    };

    fromData.value.leverage = levelValue.value;
    fromData.value.leverLabel = `${levelActiveTabName.value}${levelValue.value}x`;
    fromData.value.margin_type = levelActiveTab.value;
};

// 确认订单
const showOut = ref(false);
const suerShow = computed(() => {
    const _amount = String(fromData.value.amount).replace(".", '');
    return [
        {
            name: t("contractOpe.orderSure.info.label1"),
            value: `≈ ${fromData.value.price} USD`,
        },
        {
            name: t("contractOpe.orderSure.info.label2"),
            value: `${t('unit.lots')}  ${_amount} = ${friendlyNumber(multiply(_amount, 100))} USD`,
        },
        {
            name: t("contractOpe.orderSure.info.label3"),
            value: fromData.value.leverLabel,
        },
        {
            name: t("contractOpe.orderSure.info.label4"),
            value: `${checkFrom.value.tp || "-"}/${checkFrom.value.sl || "-"}`,
        },
        {
            name: t("contractOpe.orderSure.info.label5"),
            value: clickType.value === 1 ? t("contractOpe.btn.btn1") : t("contractOpe.btn.btn2"),
        },
    ];
});
// 提交买卖
const isRefresh = ref(false);
const clickType = ref(1);
const preSubmit = (type) => {
    clickType.value = type;
    showOut.value = true;
};
// type 1 多  2 空
const loading = ref(false);
const submitHandle = () => {
    if (loading.value) {
        return;
    }
    let params = {
        futures_id: spotId2.value,
        side: clickType.value === 1 ? "buy" : "sell", // 买卖方向
        lots: fromData.value.amount, // 手数
        // trade_volume: fromData.value.amount, // 数量
        trade_type: fromData.value.document_type, // 交易类型
        leverage: fromData.value.leverage, // 杠杆
        price: fromData.value.price, // 价格
        margin_type: fromData.value.margin_type, // 保证金类型
    };
    if (checked.value) {
        params = {
            ...params,
            ...checkFrom.value,
        };
    }
    loading.value = true;
    showLoadingToast({
        forbidClick: true,
        loadingType: 'spinner',
        duration: 0,
    })
    return addContractOrderApi(params)
        .then(() => {
            showSuccessToast(t("contractOpe.Success"));
            initFromHandle();
            getWalletData(2);
            showOut.value = false;
            isRefresh.value = !isRefresh.value;
        })
        .finally(() => {
            setTimeout(() => {
                closeToast();
                loading.value = false;
            }, 1000);
        });
};
const levelSelectList = ref([
    {
        name: "25X",
        value: 25,
    },
    {
        name: "50X",
        value: 50,
    },
    {
        name: "75X",
        value: 75,
    },
    {
        name: "100X",
        value: 100,
    },
]);

const levelSelectActiveTab = ref(100);
const levelSelectChange = (val) => {
    const findItem = leverList.value.find((el) => el.value === val);
    if (findItem.isDisabled) {
        return;
    }
    levelSelectActiveTab.value = val;
    levelValue.value = val;
};
// 输入的数量 * 100 / 价格
const tradeVolume = computed(() => {
    const _amount = String(fromData.value.amount).replace(",", '');
    const _price = String(fromData.value.price).replace(",", '');
    return friendlyNumber(divide(multiply(multiply(_amount, 100), fromData.value.leverage), _price))
});
const showLength = computed(() => {
    // 市价的时候5 限价的时候7 如果止盈止损话 再加上2
    let limit = 8
    if (fromData.value.document_type === 'limit') {
        limit = 9
    }
    if (checked.value) {
        limit += 2
    }
    return limit
})

const tabActive = ref(2)
const chartRef = ref(null)
const tabChange = (val) => {
    tabActive.value = val
    // 当切换到第一个tab时，立即触发NewChart组件的重新渲染
    if (val === 1 && chartRef.value) {
        chartRef.value.initChart()
    }
}
</script>
<!--  -->
<template>
    <!-- <OpeTop :defaultValue="{ symbol, symbolId, name, bLogo }" :setSub="setSub" @bChange="bChange"
        @dataChange="dataChange" :isSpots="false"></OpeTop> -->
    <NewOpeTop :isSpots="true" @optionsList="getOptions" :defaultValue="{ symbol, symbolId, name, bLogo }"
        :setSub="setSub" @bChange="bChange" @tabChange="tabChange"></NewOpeTop>

    <div v-show="tabActive === 1">
        <div class="p-4 pb-0">
            <NewOpeData :isSpots="true" :defaultValue="{ symbol, symbolId, name, bLogo }" :setSub="setSub"
                @bChange="bChange" @dataChange="dataChange" :websocketData="nowData" :notData="false"></NewOpeData>
        </div>
        <NewChart :symbolId="symbolId" ref="chartRef"></NewChart>
        <div class="p-4 pt-0">
            <NewOpeBuy :optionList="optionList" :symbolId="symbolId"></NewOpeBuy>
        </div>
    </div>

    <div v-show="tabActive === 2">
        <div class="p-4 pb-4 flex flex-shrink-0">
            <div class="flex flex-col">
                <NewOpeData :isSpots="true"
                    :defaultValue="{ symbol: symbol2, symbolId: symbolId2, name: name2, bLogo: bLogo2 }"
                    :setSub="setSub" @bChange="bChange2" @dataChange="dataChange" ref="opeData" :notData="true"
                    :websocketData="nowData2"></NewOpeData>
                <BookList :nowData="nowData2" :name="name2" :symbol="symbol2" :setSub="setSub"
                    :unsubscribeChannel="unsubscribeChannel" :isSpots="false" :showLength="showLength"></BookList>
            </div>
            <div class="from-box">
                <MyInput readonly :modelValue="fromData.leverLabel" :errorObj="errorObj" propName="leverage" isSmall
                    isLast @click="changeLever">
                    <template #right>
                        <!-- <img src="../../assets/img/arrow-down.svg" class="w-2" alt="" /> -->
						<svg  class="lang-icon" width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path id="Polygon 5" d="M3.37814 6.23756C3.7876 6.7369 4.55151 6.7369 4.96098 6.23756L8.14411 2.35578C8.60063 1.79906 8.20456 0.962061 7.48459 0.962061L0.854525 0.962061C0.134554 0.96206 -0.261519 1.79906 0.195007 2.35578L3.37814 6.23756Z" fill="currentColor"/>
						</svg>
                    </template>
                </MyInput>
                <!-- <div class="type-select">
                <div
                    class="type-item"
                    v-for="item in searchList"
                    :key="item.id"
                    :class="{ active: activeTab === item.id }"
                    @click="searchChange(item.id)"
                >
                    {{ item.name }}
                </div>
            </div> -->
                <MyInput :modelValue="fromData.document_type_label" :errorObj="errorObj" propName="document_type"
                    readonly isSelect :dataList="dataList" @selectChange="selectChange" isSmall class="mt-2"></MyInput>
                <MyInput v-if="isLimit" v-model="fromData.price" :placeholder="$t('contractOpe.price')"
                    :errorObj="errorObj" propName="price" isSmall></MyInput>
                <MyInput v-model="fromData.amount" :placeholder="$t('contractOpe.amount')" :errorObj="errorObj"
                    propName="amount" isSmall @input="changeAmount">
                    <template #right>
                        {{ $t('unit.lots') }}
                    </template>
                </MyInput>
                <div class="pl-3 pr-3 pt-3 pb-3 relative">
                    <van-slider
                        v-model="slider"
                        active-color="#1EB576"
                        inactive-color="#38444D"
                        @update:model-value="changeSlide"
                        step="25"
                    >
                        <template #button>
                            <div class="custom-button">{{ slider }}%</div>
                        </template>
                    </van-slider>
                    <div class="spot-box">
                        <div class="spot"></div>
                        <div class="spot" style="left: 50%"></div>
                        <div class="spot" style="left: 75%"></div>
                    </div>
                </div>
                <div class="c-show-info mb-3">
                    <div class="c-label">
                        1{{ $t('unit.lots') }}
                    </div>
                    <div class="c-value text-xs">100 USD</div>
                </div>
                <div v-show="activeTab === 1" class="mb-3">
                    <van-checkbox v-model="checked" checked-color="#1EB576">
                        <template #icon="props">
                            <img class="w-4 h-4" v-if="props.checked" src="./img/check.svg" />
                            <img class="w-4 h-4" v-if="!props.checked" src="./img/check-no.svg" />
                        </template>
                        {{ $t("contractOpe.check.checkTxt") }}
                    </van-checkbox>
                    <div v-if="checked" class="mt-3">
                        <MyInput v-model="checkFrom.tp" :placeholder="$t('contractOpe.check.label1')"
                            :errorObj="errorObj" propName="tp" isSmall>
                        </MyInput>
                        <MyInput v-model="checkFrom.sl" :placeholder="$t('contractOpe.check.label2')"
                            :errorObj="errorObj" propName="sl" isSmall isLast>
                        </MyInput>
                    </div>
                </div>

                <MyInput :modelValue="tradeVolume" :placeholder="$t('unit.tradeAmount')" :errorObj="errorObj"
                    propName="amount" isSmall readonly>
                    <template #right>
                        {{ usdcToUsd(baseAsset) }}
                    </template>
                </MyInput>
                <div class="c-show-info" v-show="isOpen">
                    <div class="c-label">{{ $t("unit.available") }}</div>
                    <div class="c-value text-xs">{{ getContractBalance || 0 }} {{ usdcToUsd(quoteAsset) }}</div>
                </div>
                <div class="c-show-info mt-3 mb-3" v-show="isOpen">
                    <div class="c-label">{{ $t("contractOpe.label.label2") }}</div>
                    <div class="c-value text-xs">{{ bond }} {{ usdcToUsd(quoteAsset) }}</div>
                </div>
                <div class="mt-auto overflow-auto">
                    <MyButton type="green" class="c-is-num ope-btn-css flex-auto" :disabled="!fromData.amount"
                        @click="preSubmit(1)">
                        {{ isOpen ? $t("contractOpe.btn.btn1") : $t("contractOpe.btn.btn3") }}
                    </MyButton>
                    <MyButton type="danger" class="c-is-num ope-btn-css flex-auto mt-4 " :disabled="!fromData.amount"
                        @click="preSubmit(2)">
                        {{ isOpen ? $t("contractOpe.btn.btn2") : $t("contractOpe.btn.btn4") }}
                    </MyButton>
                </div>
            </div>
        </div>
        <div class="after-line"></div>

        <ContractOrderCom :isRefresh="isRefresh" :spotId="spotId2" @cancel="getWalletData(2)"
            :contractBalance="Number(getContractBalance) || 0" :recordMap="recordMap" :setSub="setSub">
        </ContractOrderCom>
    </div>

    <!-- 杠杆调整 -->
    <van-overlay :show="height > 0">
        <van-floating-panel v-model:height="height" :anchors="anchors">
            <div class="p-4 h-full flex flex-col pb-16">
                <div class="c-normal-title">{{ $t("contractOpe.level.title") }}</div>
                <div class="level-select">
                    <div class="level-item" v-for="item in levelList" :key="item.id"
                        :class="{ active: levelActiveTab === item.id }" @click="levelChange(item)">
                        {{ item.name }}
                    </div>
                </div>
                <div class="mt-4 pt-3 pb-3 flex justify-around">
                    <!-- <van-slider
                        v-model="levelValue"
                        active-color="#1EB576"
                        inactive-color="#38444D"
                    >
                        <template #button>
                            <div class="level-custom-button"></div>
                        </template>
                    </van-slider> -->
                    <div class="level-select-item" v-for="item in leverList" :key="item.id"
                        :class="{ active: levelSelectActiveTab === item.value, disabled: item.isDisabled }"
                        @click="levelSelectChange(item.value)">
                        {{ item.name }}
                    </div>
                </div>
                <MyButton size="large" class="mt-auto" @click="sureLevel">{{
                    $t("contractOpe.level.btn1")
                }}</MyButton>
            </div>
        </van-floating-panel>
    </van-overlay>
    <MyConfirm v-model="showOut" @confirm="submitHandle" btnType="primary" :title="t('contractOpe.orderSure.title')"
        titleColor="#fff">
        <div class="flex items-center justify-between mt-4" v-for="(item, index) in suerShow" :key="index">
            <div class="bond-label">{{ item.name }}</div>
            <div class="bond-value">{{ item.value }}</div>
        </div>
    </MyConfirm>
</template>

<style scoped lang="scss">
	.lang-icon {
		color: var(--text-color);
		/* 黑夜白、日间黑 */
	}
.from-box {
    width: 52%;
    flex: auto;
    margin-left: 10px;
    display: flex;
    flex-direction: column;
}

.type-select {
    display: flex;
    justify-content: space-between;

    .type-item {
        font-family: DIN;
        min-width: 60px;
        padding: 9px;
        background: #8b939a;
        border-radius: 6px;
        font-weight: 500;
        font-size: 15px;
        color: #ffffff;
        line-height: 18px;
        text-align: center;
        margin-right: 16px;
        flex: auto;

        &:last-child {
            margin-right: 0;

            &.active {
                background: #e34646;
            }
        }

        &.active {
            background: #00b481;
        }
    }
}

.ope-btn-css {
    font-weight: 500 !important;
}

.top-info {
    flex: auto;
    width: 200px;
    margin-left: 20px;
    font-weight: 400;
    font-size: 12px;
    color: #8b939a;
    line-height: 14px;
    text-align: right;
}

.after-line {
    content: "";
    width: 100%;
    height: 10px;
    // background: #14171c;
	background-color: var(--surface-bg);
    flex-shrink: 0;
}

.level-select {
    display: flex;
    justify-content: space-between;

    .level-item {
        font-family: DIN;
        min-width: 60px;
        padding: 15px;
        font-size: 18px;
        color: #ffffff;
        line-height: 18px;
        text-align: center;
        margin-right: 16px;
        background: rgba(139, 147, 154, 0.3);
        flex: auto;
        border-radius: 8px;

        &:last-child {
            margin-right: 0;
        }

        &.active {
            background: #1EB576;
        }
    }
}

:deep(.my-input) {
    margin-bottom: 12px;
}

:deep(.van-stepper) {
    width: 100%;
    display: flex;
    border: 1px solid rgba(255, 255, 255, 0.1);
    height: 40px;
    align-items: center;
    margin-top: 16px;
    padding: 0 16px;

    .van-stepper__input {
        flex: auto;
        background-color: #1a1e26;
        color: #fff;
        font-family: PingFang SC;
        font-weight: 500;
        font-size: 15px;
        color: #ffffff;
        line-height: 18px;
    }

    .van-stepper__minus,
    .van-stepper__plus {
        background-color: #1a1e26;
        color: #8b939a;
    }
}

.level-custom-button {
    width: 20px;
    height: 20px;
    background: #1c1e27;
    border-radius: 50%;
    border: 2px solid #1EB576;
}

.bond-label {
    font-family: PingFang SC;
    font-weight: 400;
    font-size: 14px;
    color: #8b939a;
    line-height: 24px;
}

.bond-value {
    font-family: PingFang SC;
    font-weight: 400;
    font-size: 14px;
    color: #ffffff;
    line-height: 24px;
    word-break: break-all;
}

.bond-box {
    width: 30%;
    flex: auto;

    .bond-label,
    .bond-value {
        margin-top: 14px;
    }
}

.level-select-item {
    width: 80px;
    height: 32px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    font-family: DIN, DIN;
    font-weight: 500;
    font-size: 14px;
    color: #ffffff;
    line-height: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 8px;

    &.active {
        background: #fff;
        color: #1c1e27;
    }

    &.disabled {
        background: rgba(255, 255, 255, 0.13);
        color: #8b939a;
    }
}

:deep(.price-ul) {
    width: 100%;
}
</style>
