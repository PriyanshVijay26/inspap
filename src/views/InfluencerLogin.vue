// influencer_login.vue
<template>
  <div class="login-card">
    <h2>Influencer Login</h2>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="email"><i class="fas fa-envelope"></i> Email:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="password"><i class="fas fa-lock"></i> Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit">Login</button>
      <div v-if="error" class="error">{{ error }}</div>
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
        const response = await axios.post('http://localhost:5000/api/login/influencer', {
          email: this.email,
          password: this.password
        });

        // Store the authentication token and role
        localStorage.setItem('auth_token', response.data.auth_token);
        localStorage.setItem('role', 'influencer'); // Store the role

        // Redirect to the influencer dashboard
        this.$router.push('/influencer-dashboard'); 

      } catch (error) {
        this.error = error.response?.data?.message || 'An error occurred during login.';
      }
    }
  }
};
</script>


<style scoped>
.login-card {
  background: linear-gradient(to right, #40e0d0, #ff8c00); /* Example gradient */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 400px;
  margin: 50px auto;
  text-align: center;
  color: #fff; /* White text for contrast */
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button[type="submit"] {
  background-color: #ff8c00; /* Orange button color */
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  background-color: #ff6f00; /* Darker orange on hover */
}

.error {
  color: #d9534f; /* Red error message */
  margin-top: 10px;
}

/* Font Awesome icons */
.form-group i {
  margin-right: 5px;
}
</style>

