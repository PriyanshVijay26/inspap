<template>
  <div id="app">
    <NavBar /> 
    <router-view /> 
  </div>
</template>

<script>
import NavBar from './views/NavBar.vue'; // Import with the correct name

export default {
  components: {
    NavBar, // Register with the correct name
  }
};

</script>