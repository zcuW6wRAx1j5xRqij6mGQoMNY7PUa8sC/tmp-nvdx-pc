<script lang="ts" setup>
defineProps({
    msg: String,
})
const emit = defineEmits(['reUpload'])
const reUpload = () => {
    emit('reUpload')
}
</script>
<!--  -->
<template>
    <div class="flex flex-col justify-center items-center h-screen">
        <img src="../img/refuse.svg" class="refuse" alt="" />
        <div class="success-txt">{{ $t('my.nameFail') }}</div>
        <div class="content">{{ msg }}</div>
        <MyButton @click="reUpload" class="mt-10 min-w-32">{{ $t('my.reUpload') }}</MyButton>
    </div>
</template>

<style scoped>
.success {
    width: 196.865px;
    height: 112.044px;
    flex-shrink: 0;
}
.success-txt {
    color: #e34646;
    text-align: center;
    font-variant-numeric: lining-nums proportional-nums;
    font-family: 'PingFang SC';
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: 32px; /* 177.778% */
    margin-top: 20px;
}
.msg {
    color: #fff;
    text-align: center;
    font-variant-numeric: lining-nums proportional-nums;
    font-family: 'PingFang SC';
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: 32px; /* 213.333% */
}
</style>
