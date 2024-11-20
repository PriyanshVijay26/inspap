<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Admin Login</h2>
      <form @submit.prevent="loginAdmin">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit">Login</button>
        <div v-if="error" class="error">{{ error }}</div>
      </form>
    </div>
    <div class="background-shapes">
      <div class="shape circle"></div>
      <div class="shape triangle"></div>
      <div class="shape square"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      error: null
    };
  },
  methods: {
    async loginAdmin() {
      this.error = null;
      try {
        const response = await fetch('http://localhost:5000/api/login/admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed.');
        }

        const data = await response.json();
        // Store auth_token and roles in localStorage
        localStorage.setItem('auth_token', data.auth_token);
        localStorage.setItem('role', 'admin');

        // Redirect to admin dashboard 
        this.$router.push('/admin/dashboard'); 

      } catch (error) {
        this.error = error.message || 'An error occurred during login.';
      }
    }
  }
};
</script>


<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
   /* Vibrant gradient */
  font-family: 'Poppins', sans-serif; /* Modern font */
  overflow: hidden; /* Keep shapes within container */
}

.login-box {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);
  text-align: center;
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555;
}

input[type="email"],
input[type="password"] 
 {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

button[type="submit"] {
  background-color: #f83600; /* Match gradient color */
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s; /* Smooth transition */
}

button[type="submit"]:hover {
  background-color: #f9d423; /* Match gradient color */
}

.error {
  color: red;
  margin-top: 10px;
}

/* Background shapes for visual interest */
.background-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; /* Place behind login box */
}

.shape {
  position: absolute;
  opacity: 0.2; /* Semi-transparent */
}

.circle {
  width: 200px;
  height: 200px;
  background-color: #f9d423;
  border-radius: 50%;
  top: 20%;
  left: 10%;
  animation: moveCircle 8s linear infinite;
}

.triangle {
  width: 0;
  height: 0;
  border-left: 150px solid transparent;
  border-right: 150px solid transparent;
  border-bottom: 260px solid #f83600;
  top: 60%;
  right: 20%;
  animation: rotateTriangle 10s linear infinite;
}

.square {
  width: 100px;
  height: 100px;
  background-color: #b6f800;
  bottom: 10%;
  left: 80%;
  animation: moveSquare 6s linear infinite;
}

/* Animations */
@keyframes moveCircle {
  0% { transform: translate(0, 0); }
  50% { transform: translate(50px, -50px); }
  100% { transform: translate(0, 0); }
}

@keyframes rotateTriangle {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes moveSquare {
  0% { transform: translate(0, 0); }
  50% { transform: translate(-30px, 30px); }
  100% { transform: translate(0, 0); }
}
</style>