<template>
  <div class="create-campaign-container">
    <h1 class="heading">Create New Campaign</h1>

    <form @submit.prevent="createCampaign" class="campaign-form">
      <div class="form-group">
        <label for="title" class="form-label">Title:</label>
        <input type="text" id="title" v-model="campaignData.title" required class="form-input">
      </div>

      <div class="form-group">
        <label for="description" class="form-label">Description:</label>
        <textarea id="description" v-model="campaignData.description" required class="form-input"></textarea>
      </div>

      <div class="form-group">
        <label for="start_date" class="form-label">Start Date:</label>
        <input type="date" id="start_date" v-model="campaignData.start_date" required class="form-input" :min="today">
      </div>

      <div class="form-group">
        <label for="end_date" class="form-label">End Date:</label>
        <input type="date" id="end_date" v-model="campaignData.end_date" required class="form-input" :min="minEndDate">
      </div>

      <div class="form-group">
        <label for="budget" class="form-label">Budget:</label>
        <input type="number" id="budget" v-model="campaignData.budget" required class="form-input">
      </div>

      <div class="form-group">
        <label for="campaign_goals" class="form-label">Campaign Goals:</label>
        <textarea id="campaign_goals" v-model="campaignData.campaign_goals" required class="form-input"></textarea>
      </div>

      <div class="form-group">
        <label for="target_audience" class="form-label">Target Audience:</label>
        <textarea id="target_audience" v-model="campaignData.target_audience" required class="form-input"></textarea>
      </div>

      <button type="submit" class="submit-button">Create Campaign</button>
    </form>

    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      campaignData: {
        title: '',
        description: '',
        start_date: null,
        end_date: null,
        budget: null,
        campaign_goals: '',
        target_audience: '',
      },
      errorMessage: null,
      token: null, 
      role: localStorage.getItem('role'),
    };
  },
  computed: {
    today() {
      const today = new Date();
      const year = today.getFullYear();
      const month = ('0' + (today.getMonth() + 1)).slice(-2);
      const day = ('0' + today.getDate()).slice(-2);
      return `${year}-${month}-${day}`; 

    },
    startDate() { 
      return this.campaignData.start_date;
    },
    minEndDate() {
      if (!this.campaignData.start_date) return this.today; // Fallback if start date not selected

      const startDate = new Date(this.campaignData.start_date);
      const minEndDate = new Date(startDate);
      minEndDate.setDate(startDate.getDate() + 7); // Add 7 days

      const year = minEndDate.getFullYear();
      const month = ('0' + (minEndDate.getMonth() + 1)).slice(-2);
      const day = ('0' + minEndDate.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    }
  },
  mounted() {
    this.token = localStorage.getItem('auth_token'); 
  },
  methods: {
    async createCampaign() {
      try {
        const startDate = this.campaignData.start_date ? new Date(this.campaignData.start_date) : null;
        const endDate = this.campaignData.end_date ? new Date(this.campaignData.end_date) : null;
        const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : null;
        const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : null;

        const response = await fetch('http://localhost:5000/api/campaigns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-token': this.token, 
          },
          body: JSON.stringify({
            ...this.campaignData,
            start_date: formattedStartDate,
            end_date: formattedEndDate
          }),
        });

        if (!response.ok) {
          const message = `Error creating campaign: ${response.status} ${response.statusText}`;
          throw new Error(message);
        }

        alert('Campaign created successfully!');
        this.$router.push('/brand-dashboard'); 
      } catch (error) {
        this.handleError(error, 'Error creating campaign');
      }
    },
    handleError(error, defaultMessage) {
      console.error(error);
      this.errorMessage = error.message || defaultMessage;
    },
  },
};
</script>

<style scoped>
.create-campaign-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px;
  background: linear-gradient(145deg, #e2e6f0, #ffffff);
  border-radius: 15px;
  box-shadow: 8px 8px 20px #bfc3cd, -8px -8px 20px #ffffff;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.create-campaign-container:hover {
  transform: scale(1.02);
  box-shadow: 12px 12px 30px #b0b4bf, -12px -12px 30px #ffffff;
}

.heading {
  text-align: center;
  font-size: 2.4em;
  font-weight: 600;
  margin-bottom: 30px;
  background: linear-gradient(45deg, #7d7dff, #5c5cff, #4a4ae6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.campaign-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 25px;
  position: relative;
}

.form-label {
  font-size: 1.3em;
  font-weight: 600;
  color: #5a6175;
  margin-bottom: 8px;
  display: block;
  transition: color 0.3s ease;
}

.form-input {
  padding: 15px;
  font-size: 1.1em;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: #f9faff;
  box-shadow: inset 4px 4px 8px #c3c8d0, inset -4px -4px 8px #ffffff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #8f94fb;
  box-shadow: 0 0 10px rgba(143, 148, 251, 0.4);
  background-color: #f0f4ff;
}

textarea.form-input {
  resize: vertical;
  height: 130px;
}

.submit-button {
  padding: 15px 25px;
  font-size: 1.2em;
  color: #fff;
  background: linear-gradient(135deg, #4e54c8, #8f94fb);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.2);
}

.submit-button:hover {
  background: linear-gradient(135deg, #3b43a4, #6f75d4);
  transform: scale(1.05);
}

.submit-button:active {
  background: linear-gradient(135deg, #3b43a4, #5c61af);
  transform: scale(0.98);
}

.error {
  color: #ff4d4f;
  font-size: 1.1em;
  text-align: center;
  margin-top: 20px;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}

@media (max-width: 768px) {
  .create-campaign-container {
    padding: 20px;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .form-input, .submit-button {
    font-size: 1em;
  }
}
</style>
