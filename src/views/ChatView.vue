<script>
    import Users from '../components/Users.vue'
    import Chat from '../components/Chat.vue';

    export default {
        components: {
            Chat, Users
        }
    }
</script>

<template>
  <main>
    <div class="chatContainer">
        <Chat/>
        <form id="chatForm">
            <input type="text" id="chatInput" placeholder="Send a message" />
            <input type="hidden" id="chatRoomname" name="chatroomName" value="chatroom1">
            <input type="hidden" id="userID" name="userID" value="1">
            <input id="submit" type="submit" value="submit" class="button" />
        </form>
    </div>
    <div class="usersContainer">
        <Users/>
    </div>
  </main>
</template>

<style scoped>
    main {
        display: flex;
        height: 100%;
    }

    .chatContainer {
        width: 66%;
        height: 80vh;
    }

    .usersContainer {
        width: 33%;
        border-left: 1px solid gray;
    }
</style>
