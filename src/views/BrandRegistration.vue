<template>
  <div class="brand-registration-card">
    <h2>Brand Registration</h2>
    <form @submit.prevent="registerBrand" enctype="multipart/form-data">
      <div class="form-grid">
        <div class="form-group">
          <label for="username"><i class="fas fa-user"></i> Username:</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <div class="form-group">
          <label for="email"><i class="fas fa-envelope"></i> Email:</label>
          <input type="email" id="email" 
 v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password"><i class="fas fa-lock"></i> Password:</label>
          <input type="password" id="password" 
 v-model="password" required>
        </div>
        <div class="form-group">
          <label for="name"><i class="fas fa-building"></i> Brand Name:</label>
          <input type="text" id="name" v-model="name" required>
        </div>
        <div class="form-group">
          <label for="website"><i class="fas fa-globe"></i> Website:</label>
          <input type="text" id="website" v-model="website">
        </div>
        <div class="form-group">
          <label for="contact_email"><i class="fas fa-envelope"></i> Contact Email:</label>
          <input type="email" id="contact_email" v-model="contact_email">
        </div>
        <div class="form-group">
          <label for="company_description"><i class="fas fa-pen"></i> Company Description:</label>
          <textarea id="company_description" v-model="company_description"></textarea>
        </div>
        <div class="form-group">
          <label for="industry"><i class="fas fa-industry"></i> Industry:</label>
          <select id="industry" v-model="industry" class="form-control">
            <option value="" disabled selected>Select an industry</option>
            <option v-for="niche in niches" :key="niche.id" :value="niche.name">
              {{ niche.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="profile_image"><i class="fas fa-image"></i> Profile Image:</label>
          <input type="file" id="profile_image" @change="onFileSelected">
        </div>
      </div>
      <button type="submit" class="submit-button">Register</button>
      <div v-if="error" class="error">{{ error }}</div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      name: '',           // Brand name
      website: '',
      contact_email: '',
      company_description: '',
      industry: '',
      profile_image: null,
      error: null,
      niches: []
    };
  },
  async mounted() {
    try {
      const response = await axios.get('http://localhost:5000/api/niches'); // Fetch niches from your API
      this.niches = response.data;
    } catch (error) {
      console.error('Error fetching niches:', error);
      // Handle the error, e.g., show an error message to the user
    }
  },
  methods: {
    onFileSelected(event) {
      this.profile_image = event.target.files[0];
    },
    async registerBrand() {
      this.error = null;
      try {
        const formData = new FormData();
        formData.append('username', this.username);
        formData.append('email', this.email);
        formData.append('password', this.password);
        formData.append('name', this.name);        // Send as 'name' 
        formData.append('website', this.website);
        formData.append('contact_email', this.contact_email);
        formData.append('company_description', this.company_description);
        formData.append('industry', this.industry); 

        if (this.profile_image) {
          formData.append('profile_image', this.profile_image);
        }

        const response = await fetch(`http://localhost:5000/api/register/brand`, {  // Adjust URL if needed
          method: 'POST',
          body: formData 
        });

        if (!response.ok) { 
          const errorData = await response.json(); 
          throw new Error(errorData.message || 'Registration failed.');
        }

        // Successful registration
        this.$router.push('/login');  // Redirect to login

      } catch (error) {
        this.error = error.message || 'An error occurred during registration.';
      }
    }
  }
};
</script>

<style scoped>
.brand-registration-card {
  background-color: #f8f9fa; /* Light background */
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 600px;
  margin: 50px auto;
  text-align: center;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two columns */
  gap: 20px;
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da; /* Light gray border */
  border-radius: 6px;
  box-sizing: border-box;
}

.submit-button {
  background-color: #28a745; /* Green button color */
  color: white;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 600;
}

.submit-button:hover {
  background-color: #218838; /* Darker green on hover */
}

.error {
  color: #dc3545; /* Red error message */
  margin-top: 10px;
}

/* Font Awesome icons */
.form-group i {
  margin-right: 8px;
}

.form-control { 
  width: 100%;
  padding: 12px; /* Increased padding */
  border: 1px solid #ced4da;
  border-radius: 6px;
  box-sizing: border-box;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #fff;
  color: #333;
}
</style>