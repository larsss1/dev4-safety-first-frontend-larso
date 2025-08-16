<script>
    export default {
        props: {
            username: String,
            picture: String
        }
    }
</script>

<template>
    <div class="user">
        <div class="profilePic" :style="{ backgroundImage: `url(${picture})` }" >
        </div>
        <h4>{{ username }}</h4>
    </div>
</template>

<style scoped>
    .user {
        display: flex;
        align-items: center;
    }

    .user > * {
        padding: 12px;
    }
    .profilePic {
        width: 40px;
        height: 40px;
        border-radius: 20px;
        background-size: cover;
        background-position: center;
    }
</style>