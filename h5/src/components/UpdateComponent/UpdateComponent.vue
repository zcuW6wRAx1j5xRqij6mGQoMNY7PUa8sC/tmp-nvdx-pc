<template>
    <van-overlay :show="show" @click="show = false">
        <div class="wrapper" @click.stop>
            <div class="block">
                <h3 class="new-version">{{ $t('common.AppUpdate') }}</h3>
                <div class="version">{{ $t('common.newVersion') }} : {{latestVersion}}</div>
                <p class="content">
                    {{updateNotice}}
                </p>
                <van-progress v-if="show" :percentage="downloadProcess" color="#166d4a" class="progress" />
                <div class='download-info'>{{ $t('common.downloading' )}}...</div>
            </div>
        </div>
    </van-overlay>
</template>

<script>
import { Overlay, Progress } from 'vant'
export default {
    name: 'update-component',
    components: {
        [Overlay.name]: Overlay,
        [Progress.name]: Progress,
    },
    props: {
        updateNotice: {
            type: String,
            default: '',
        },
        latestVersion : {
            type: String,
        },
        currentVersion: {
            type: String,
        },
        downloadProcess: {
            type: Number,
            default: 0
        },
        show: {
            type: Boolean
        },
    },
    data() {
        return {}
    },
    methods: { },
    mounted() {},
}
</script>

<style lang="scss" scoped>
$base: 2;
.wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.download-info{
    margin-top: 20px;
    color: #9e9e9e;
    text-align: center;
}

.block {
    width: 300px;
    background-color: #ffffff;
    border-radius: 12px;
    padding: 20px;
}
.new-version {
    text-align: center;
    font-size: 20px;
    color: #166d4a;
}
.version {
    font-size: 12px;
    color: #9e9e9e;
    margin-top: 10px;
}
.content {
    margin-top: 12px;
}
.progress {
    margin-top: 30px;
    margin-bottom: 30px;
}
</style>