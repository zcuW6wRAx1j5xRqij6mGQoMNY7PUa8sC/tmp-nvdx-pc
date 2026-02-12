import { createRouter, createWebHistory } from 'vue-router'
import { VITE_IMAGE_PATH } from '@build/index'
const routes = [
    {
        path: '/',
        component: () => import('@/layout/Index.vue'),
        children: [
            {
                path: '/',
                name: 'Home',
                component: () => import('@/views/home/Home.vue'),
                meta: {
                    title: '首页',
                },
            },
            {
                path: '/Transaction',
                name: 'Transaction',
                component: () => import('@/views/transaction/Transaction.vue'),
                meta: {
                    title: '交易页面',
                },
            },
            {
                path: '/SpotOpe',
                name: 'SpotOpe',
                component: () => import('@/views/transaction/SpotOpe.vue'),
                meta: {
                    title: '现货买卖',
                },
            },
            {
                path: '/ContractOpe',
                name: 'ContractOpe',
                component: () => import('@/views/transaction/ContractOpe.vue'),
                meta: {
                    title: '合约买卖',
                },
            },
            {
                path: '/My',
                name: 'My',
                component: () => import('@/views/my/My.vue'),
                meta: {
                    title: '我的',
                },
            },
        ],
    },
    {
        path: '/Login',
        name: 'Login',
        component: () => import('@/views/login/Login.vue'),
        meta: {
            title: '登录',
        },
    },
    {
        path: '/Register',
        name: 'Register',
        component: () => import('@/views/login/Register.vue'),
        meta: {
            title: '登录',
        },
    },
    {
        path: '/ForgetPwd',
        name: 'ForgetPwd',
        component: () => import('@/views/login/ForgetPwd.vue'),
        meta: {
            title: '忘记密码',
        },
    },
    {
        path: '/NoticeDetail',
        name: 'NoticeDetail',
        component: () => import('@/views/home/NoticeDetail.vue'),
        meta: {
            title: '通知详情',
        },
    },
    {
        path: '/DetailPage',
        name: 'DetailPage',
        component: () => import('@/views/transaction/DetailPage.vue'),
        meta: {
            title: '详情',
        },
    },
    {
        path: '/ContractOrder',
        name: 'ContractOrder',
        component: () => import('@/views/transaction/ContractOrder.vue'),
        meta: {
            title: '合约历史订单',
        },
    },
    {
        path: '/OptionsOrder',
        name: 'OptionsOrder',
        component: () => import('@/views/transaction/OptionsOrder.vue'),
        meta: {
            title: '期权历史订单',
        },
    },
    {
        path: '/SpotOrder',
        name: 'SpotOrder',
        component: () => import('@/views/transaction/SpotOrder.vue'),
        meta: {
            title: '现货历史列表',
        },
    },
    {
        path: '/SetInfo',
        name: 'SetInfo',
        component: () => import('@/views/my/SetInfo.vue'),
        meta: {
            title: '编辑资料',
        },
    },
    {
        path: '/RealName',
        name: 'RealName',
        component: () => import('@/views/my/RealName.vue'),
        meta: {
            title: '实名认证',
        },
    },
    {
        path: '/ChangePwd',
        name: 'ChangePwd',
        component: () => import('@/views/my/ChangePwd.vue'),
        meta: {
            title: '修改密码',
        },
    },
    {
        path: '/SetEmail',
        name: 'SetEmail',
        component: () => import('@/views/my/SetEmail.vue'),
        meta: {
            title: 'Email绑定',
        },
    },
    {
        path: '/SetPhone',
        name: 'SetPhone',
        component: () => import('@/views/my/SetPhone.vue'),
        meta: {
            title: '手机号绑定',
        },
    },
    {
        path: '/SetPhone',
        name: 'SetPhone',
        component: () => import('@/views/my/SetPhone.vue'),
        meta: {
            title: '手机号绑定',
        },
    },
    {
        path: '/OrderHis',
        name: 'OrderHis',
        component: () => import('@/views/transaction/OrderHis.vue'),
        meta: {
            title: '历史订单',
        },
    },
    {
        path: '/WalletDetail',
        name: 'WalletDetail',
        component: () => import('@/views/my/WalletDetail.vue'),
        meta: {
            title: '资金明细',
        },
    },
    {
        path: '/TradingOne',
        name: 'TradingOne',
        component: () => import('@/views/my/TradingOne.vue'),
        meta: {
            title: '现货账户-交易详情',
        },
    },
    {
        path: '/TradingTwo',
        name: 'TradingTwo',
        component: () => import('@/views/my/TradingTwo.vue'),
        meta: {
            title: '合约账户-交易详情',
        },
    },
    {
        path: '/FinancialDetail',
        name: 'FinancialDetail',
        component: () => import('@/views/my/FinancialDetail.vue'),
        meta: {
            title: '资金明细',
        },
    },
    {
        path: '/Recharge',
        name: 'Recharge',
        component: () => import('@/views/my/Recharge.vue'),
        meta: {
            title: '充值',
        },
    },
    {
        path: '/Withdrawal',
        name: 'Withdrawal',
        component: () => import('@/views/my/Withdrawal.vue'),
        meta: {
            title: '提现',
        },
    },
    {
        path: '/WithdrawalHistory',
        name: 'WithdrawalHistory',
        component: () => import('@/views/my/WithdrawalHistory.vue'),
        meta: {
            title: '提现历史',
        },
    },
    {
        path: '/RechargeHistory',
        name: 'RechargeHistory',
        component: () => import('@/views/my/RechargeHistory.vue'),
        meta: {
            title: '充值历史',
        },
    },
    {
        path: '/Transform',
        name: 'Transform',
        component: () => import('@/views/my/Transform.vue'),
        meta: {
            title: '转换',
        },
    },
    {
        path: '/TransformTwo',
        name: 'TransformTwo',
        component: () => import('@/views/my/TransformTwo.vue'),
        meta: {
            title: '资产转移',
        },
    },
    {
        path: '/Invite',
        name: 'Invite',
        component: () => import('@/views/my/Invite.vue'),
        meta: {
            title: '邀请码',
        },
    },
    {
        path: '/Msg',
        name: 'Msg',
        component: () => import('@/views/my/Msg.vue'),
        meta: {
            title: '站内信',
        },
    },
    {
        path: '/MsgDetail',
        name: 'MsgDetail',
        component: () => import('@/views/my/MsgDetail.vue'),
        meta: {
            title: '站内信详情',
        },
    },
    {
        path: '/Success',
        name: 'Success',
        component: () => import('@/views/common/Success.vue'),
        meta: {
            title: '成功',
        },
    },

    {
        path: '/Agree',
        name: 'Agree',
        component: () => import('@/views/home/Agree.vue'),
        meta: {
            title: '协议',
        },
    },
    {
        path: '/OTC',
        name: 'OTC',
        component: () => import('@/views/home/OTC.vue'),
        meta: {
            title: 'OTC',
        },
    },
    {
        path: '/NewsDetail',
        name: 'NewsDetail',
        component: () => import('@/views/home/NewsDetail.vue'),
        meta: {
            title: '新闻详情',
        },
    },
    {
        path: '/NewB',
        name: 'NewB',
        component: () => import('@/views/home/NewB.vue'),
        meta: {
            title: '新币',
        },
    },
    {
        path: '/IEO',
        name: 'IEO',
        component: () => import('@/views/home/IEO.vue'),
        meta: {
            title: 'IEO',
        },
    },
    {
        path: '/IEOHis',
        name: 'IEOHis',
        component: () => import('@/views/home/IEOHis.vue'),
        meta: {
            title: 'IEOHis',
        },
    },
    {
        path: '/RedPlan',
        name: 'RedPlan',
        component: () => import('@/views/home/RedPlan.vue'),
        meta: {
            title: '红利计划',
        },
    },
    {
        path: '/Vote',
        name: 'Vote',
        component: () => import('@/views/home/Vote.vue'),
        meta: {
            title: '投票',
        },
    },
    {
        path: '/AI',
        name: 'AI',
        component: () => import('@/views/ai/AI.vue'),
        meta: {
            title: 'AI量化',
        },
    },
    {
        path: '/AIHis',
        name: 'AIHis',
        component: () => import('@/views/ai/AIHis.vue'),
        meta: {
            title: 'AI历史',
        },
    },
    {
        path: '/AIBuy',
        name: 'AIBuy',
        component: () => import('@/views/ai/Buy.vue'),
        meta: {
            title: 'AI申购',
        },
    },
    {
        path: '/Defn',
        name: 'Defn',
        component: () => import('@/views/defn/Defn.vue'),
        meta: {
            title: '质押',
        },
    },
    {
        path: '/DefnHis',
        name: 'DefnHis',
        component: () => import('@/views/defn/DefnHis.vue'),
        meta: {
            title: '质押历史',
        },
    },
    {
        path: '/OTCHis',
        name: 'OTCHis',
        component: () => import('@/views/home/OTCHis.vue'),
        meta: {
            title: 'OTC历史',
        },
    },
    {
        path: '/WebView',
        name: 'WebView',
        component: () => import('@/views/common/Webview.vue'),
    },
    {
        path: '/Setting',
        name: 'Setting',
        component: () => import('@/views/my/Setting.vue'),
        meta: {
            title: '设置',
        },
    },
    {
        path: '/TransformHis',
        name: 'TransformHis',
        component: () => import('@/views/my/TransformHis.vue'),
        meta: {
            title: '转账历史',
        },
    },
]
const router = createRouter({
    history: createWebHistory(),
    routes: routes,
    scrollBehavior: () => ({ left: 0, top: 0 }),
})
router.addRoute({
    path: '/:pathMatch(.*)',
    redirect: '/',
})
router.beforeEach((to, _from, next) => {
    window.scrollTo(0, 0)
    let baseUrl = VITE_IMAGE_PATH
    localStorage.setItem('imgBaseUrl', baseUrl)
    if (
        to.path.includes('Login') ||
        to.path.includes('Register') ||
        to.path.includes('ForgetPwd') || 
        to.path.includes('Agree')
    ) {
        next()
        return
    }
    const token = localStorage.getItem('token')
    if (!to.path.includes('Login') && !token) {
        next('/Login')
        return
    }

    // _MEIQIA('metadata', {
    //     name: localStorage.getItem('uid'),
    // })

    next()
})
export default router
