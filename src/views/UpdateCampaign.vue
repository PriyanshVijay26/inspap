<template>
  <div class="update-campaign-container">
    <h1 class="heading">Update Campaign</h1>

    <form @submit.prevent="updateCampaign" class="campaign-form">
      <div class="form-group">
        <label for="title" class="form-label">Title:</label>
        <input type="text" id="title" v-model="campaignData.title" readonly class="form-input readonly">
      </div>

      <div class="form-group">
        <label for="description" class="form-label">Description:</label>
        <textarea id="description" v-model="campaignData.description" required class="form-input"></textarea>
      </div>

      <div class="form-group">
        <label for="start_date" class="form-label">Start Date:</label>
        <input type="date" id="start_date" v-model="campaignData.start_date" required class="form-input">
      </div>

      <div class="form-group">
        <label for="end_date" class="form-label">End Date:</label>
        <input type="date" id="end_date" v-model="campaignData.end_date" required class="form-input">
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

      <button type="submit" class="submit-button">Update Campaign</button>
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
    };
  },
  async mounted() {
    try {
      await this.fetchCampaign();
    } catch (error) {
      this.handleError(error, 'Error fetching campaign');
    }
  },
  methods: {
    async fetchCampaign() {
      const campaignId = this.$route.params.campaignId;
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}`, {
        headers: {
          'Authentication-token': token,
        },
      });

      if (!response.ok) {
        const message = `Error fetching campaign: ${response.status} ${response.statusText}`;
        throw new Error(message);
      }

      const data = await response.json();
      this.campaignData = { ...data };
    },
    async updateCampaign() {
      try {
        const campaignId = this.$route.params.campaignId;
        const token = localStorage.getItem('auth_token');

        const startDate = new Date(this.campaignData.start_date);
        const endDate = new Date(this.campaignData.end_date);
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-token': token,
          },
          body: JSON.stringify({
            ...this.campaignData,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
          }),
        });

        if (!response.ok) {
          const message = `Error updating campaign: ${response.status} ${response.statusText}`;
          throw new Error(message);
        }

        alert('Campaign updated successfully!');
        this.$router.push('/brand-dashboard');
      } catch (error) {
        this.handleError(error, 'Error updating campaign');
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
.update-campaign-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 40px;
  background: linear-gradient(135deg, #ffffff, #f0f4ff);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.update-campaign-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.heading {
  text-align: center;
  font-size: 2.4em;
  font-weight: 700;
  margin-bottom: 30px;
  background: linear-gradient(45deg, #7d7dff, #5c5cff, #4a4ae6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.campaign-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 1.2em;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-input {
  padding: 12px;
  font-size: 1.1em;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #333;
}

.form-input:focus {
  border-color: #7d7dff;
  box-shadow: 0 0 10px rgba(125, 125, 255, 0.3);
  outline: none;
}

.form-input.readonly {
  background-color: #e9ecef;
  color: #6c757d;
}

textarea.form-input {
  resize: vertical;
  height: 100px;
}

.submit-button {
  padding: 12px;
  font-size: 1.2em;
  font-weight: 600;
  color: #fff;
  background-color: #5c5cff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.submit-button:hover {
  background-color: #7d7dff;
  transform: scale(1.05);
}

.submit-button:active {
  background-color: #4a4ae6;
}

.error {
  color: #ff4d4f;
  font-size: 1.1em;
  text-align: center;
  margin-top: 20px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .update-campaign-container {
    padding: 25px;
  }

  .form-input, .submit-button {
    font-size: 1em;
  }
}
</style>
