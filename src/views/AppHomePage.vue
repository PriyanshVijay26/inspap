<template>
  <div style="display: flex; justify-content: center;"> 
    <img src="@/assets/homepage.png" alt="Registration Banner" style="max-width: 500px; width: 80%; height: auto;"> 
  </div>
  <div class="homepage">
    <div class="hero">
      <h1>Welcome to Our Influencer Sponsor App</h1>
      <p>Where influencers and sponsors connect and collaborate.</p>
    </div>

    <div class="actions">
      <router-link to="/brand-register" class="btn btn-primary">Sponsor Register</router-link>
      <router-link to="/influencer-register" class="btn btn-secondary">Influencer Register</router-link>
      <router-link to="/admin-login" class="btn btn-outline">Admin Login</router-link>
      <router-link to="/brand-login" class="btn btn-outline">Sponsor Login</router-link>
      <router-link to="/influencer-login" class="btn btn-outline">Influencer Login</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Homepage',
};
</script>

<style scoped>
.homepage {
  text-align: center;
  padding: 50px 20px;
  font-family: sans-serif;
}

.hero {
  margin-bottom: 30px;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 10px;
}

.hero p {
  font-size: 1.5rem;
  color: #666;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
}

.btn {
  padding: 12px 20px;
  border-radius: 5px;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #007bff; /* Blue */
  color: white;
  border: none;
}

.btn-secondary {
  background-color: #6c757d; /* Gray */
  color: white;
  border: none;
}

.btn-outline {
  background-color: transparent;
  color: #007bff; /* Blue */
  border: 2px solid #007bff;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>