// brand_login.vue
<template>
  <div class="login-card">
    <h2>Brand Login</h2>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="email"><i class="fas fa-envelope"></i> Email:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="password"><i class="fas fa-lock"></i> Password:</label>
        <input type="password" id="password" 
 v-model="password" required>
      </div>
      <button type="submit">Login</button>
      <div v-if="error"  
 class="error">{{ error }}</div>
    </form>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      password: '',
      error: null
    };
  },
  methods: {
    async login() {
      this.error = null;
      try {
        const response = await axios.post('http://localhost:5000/api/login/brand', {
          email: this.email,
          password: this.password
        });

        // Store the authentication token and role
        localStorage.setItem('auth_token', response.data.auth_token);
        localStorage.setItem('role', 'brand'); // Store the role

        // Redirect to the brand dashboard
        this.$router.push('/brand-dashboard'); 

      } catch (error) {
        this.error = error.response?.data?.message || 'An error occurred during login.';
      }
    }
  }
};
</script>
<style scoped>
.login-card {
  background-color: #f8f9fa; /* Light background */
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 400px;
  margin: 50px auto;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #343a40; /* Dark gray label color */
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da; /* Light gray border */
  border-radius: 6px;
  box-sizing: border-box;
}

button[type="submit"] {
  background-color: #007bff; /* Blue button color */
  color: white;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 600;
}

button[type="submit"]:hover {
  background-color: #0062cc; /* Darker blue on hover */
}

.error {
  color: #dc3545; /* Red error message */
  margin-top: 10px;
}

/* Font Awesome icons */
.form-group i {
  margin-right: 8px;
}
</style>