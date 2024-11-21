<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-left">
        <!-- Logo and App Name -->
        <img src="/logo.jpeg" alt="Logo" class="navbar-logo" />
        <span class="navbar-brand">Influencer Sponsorship App</span>
      </div>
      <!-- Logout Button -->
      <div class="navbar-right">
        <button v-if="isLoggedIn" @click="logout" class="btn btn-outline-danger">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      isLoggedIn: false,
    };
  },
  mounted() {
    this.isLoggedIn = localStorage.getItem('auth_token') !== null;
  },
  methods: {
    logout() {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('role');
      this.isLoggedIn = false;
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between; /* Ensures the left and right sections are spaced apart */
  align-items: center;
  padding: 10px 20px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #ddd;
}

.container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.navbar-logo {
  height: 40px;
  margin-right: 10px;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.navbar-right {
  margin-left: auto; /* Pushes the logout button to the extreme right */
}

.btn-outline-danger {
  border-color: #ff5a5f;
  color: #ff5a5f;
}

.btn-outline-danger:hover {
  background-color: #ff5a5f;
  color: white;
}
</style>
