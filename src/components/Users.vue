<script>
    import User from './User.vue';

    export default {
        data() {
            return {
                users: []
            }
        },
        methods: {
            getData() {
                
            }
        },
        mounted() {
            //This function runs when your component is mounted
            console.log(`Im the users component!`);
        },
        components: {
            User
        }
    }
</script>

<template>
  <div>
    <h3>
        <ul>
            
        </ul>
    </h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

@media (min-width: 1024px) {
}
</style>
