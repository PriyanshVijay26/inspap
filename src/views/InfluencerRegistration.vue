<template>
  <div class="influencer-registration-card">
    <h2>Influencer Registration</h2>
    <form @submit.prevent="registerInfluencer" enctype="multipart/form-data">
      <div class="form-grid">
        <div class="form-group">
          <label for="username"><i class="fas fa-user"></i> Username:</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <div class="form-group">
          <label for="email"><i class="fas fa-envelope"></i> Email:</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password"><i class="fas fa-lock"></i> Password:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <div class="form-group">
          <label for="bio"><i class="fas fa-pen"></i> Bio:</label>
          <textarea id="bio" v-model="bio"></textarea>
        </div>
        <div class="form-group">
          <label for="niche"><i class="fas fa-hashtag"></i> Niche:</label>
          <select id="niche" v-model="niche" class="form-control"> 
            <option value="" disabled selected>Select a niche</option>
            <option v-for="niche in niches" :key="niche.id" :value="niche.name">
              {{ niche.name }}
            </option>
          </select>
        </div>
       
        <div class="form-group">
          <label for="followers"><i class="fas fa-users"></i> Followers:</label>
          <input type="number" id="followers" v-model="followers">
        </div>
        <div class="form-group">
          <label for="facebook_link"><i class="fab fa-facebook"></i> Facebook Link:</label>
          <input type="text" id="facebook_link" v-model="facebook_link">
        </div>
        <div class="form-group">
          <label for="instagram_link"><i class="fab fa-instagram"></i> Instagram Link:</label>
          <input type="text" id="instagram_link" v-model="instagram_link">
        </div>
        <div class="form-group">
          <label for="twitter_link"><i class="fab fa-twitter"></i> Twitter Link:</label>
          <input type="text" id="twitter_link" v-model="twitter_link">
        </div>
        <div class="form-group">
          <label for="youtube_link"><i class="fab fa-youtube"></i> YouTube Link:</label>
          <input type="text" id="youtube_link" v-model="youtube_link">
        </div>
        <div class="form-group">
          <label for="date_of_birth"><i class="fas fa-calendar-alt"></i> Date of Birth:</label>
          <input type="date" id="date_of_birth" v-model="date_of_birth">
        </div>
        <div class="form-group">
          <label for="profile_image"><i class="fas fa-image"></i> Profile Image:</label>
          <input type="file" id="profile_image" @change="onFileSelected">
        </div>
      </div>
      <button type="submit">Register</button>
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
      bio: '',
      followers: null,
      facebook_link: '',
      instagram_link: '',
      twitter_link: '',
      youtube_link: '',
      date_of_birth: null,
      profile_image: null,
      error: null,
      niche: '', // Initialize niche as an empty string
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
    async registerInfluencer() {
      this.error = null;
      try {
        const formData = new FormData();
        formData.append('username', this.username);
        formData.append('email', this.email);
        formData.append('password', this.password);
        formData.append('bio', this.bio);
        formData.append('niche', this.niche);
        formData.append('followers', this.followers);
        formData.append('facebook_link', this.facebook_link);
        formData.append('instagram_link', this.instagram_link);
        formData.append('twitter_link', this.twitter_link);
        formData.append('youtube_link', this.youtube_link);
        formData.append('date_of_birth', this.date_of_birth);
        if (this.profile_image) {
          formData.append('profile_image', this.profile_image);
        }

        const response = await axios.post(`http://localhost:5000/api/register/influencer`, formData);
        console.log(response.data.message); // "Influencer registered successfully!"

        // Redirect to the login page or home page
        this.$router.push('/');

      } catch (error) {
        this.error = error.response?.data?.message || 'An error occurred during registration.';
      }
    }
  }
};
</script>

<style scoped>
.influencer-registration-card {
  background: linear-gradient(to right, #40e0d0, #ff8c00); /* Example gradient */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 700px; 
  margin: 50px auto; 
  color: #fff; /* Text color for contrast */
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); 
  gap: 20px;
}

.form-group {
  margin-bottom: 15px; 
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button[type="submit"] {
  background-color: #ff8c00; /* Example button color */
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease; /* Smooth transition */
}

button[type="submit"]:hover {
  background-color: #ff6f00; /* Darker shade on hover */
}

.error {
  color: #d9534f; /* Example error color */
  margin-top: 10px;
}

/* Font Awesome icons - make sure you include Font Awesome in your project */
.form-group i {
  margin-right: 5px;
}


.form-control { /* New style for the select element */
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  appearance: none; /* This removes default styling in some browsers */
  -webkit-appearance: none; 
  -moz-appearance: none;
  background-color: #fff; /* Example background color */
  color: #333; /* Example text color */
}
</style>