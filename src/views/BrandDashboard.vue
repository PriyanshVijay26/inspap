<template>
  <div>
    <h1>Brand Dashboard</h1>
    <div v-if="userData" class="brand-info">
      <h2>Welcome, {{ userData.name }}</h2>
      <p>Email: <span>{{ userData.email }}</span></p>
      <p>Contact: <span>{{ userData.contact_email }}</span></p>
      <p>Website: <a :href="userData.website" target="_blank">{{ userData.website }}</a></p>
      <img :src="profileImageURL" alt="Profile Image" v-if="profileImageURL" class="profile-image" >


      <button @click="createCampaign" class="create-campaign-button">Create New Campaign</button>
    </div>  

    <h2>Your Campaigns</h2>
    <ul id="campaign-list">
      <li v-for="campaign in campaigns" :key="campaign.id">
        <h3>{{ campaign.title }}</h3>
        <p>{{ campaign.description }}</p>
        <button @click="editCampaign(campaign.id)">Edit</button>
        <button @click="deleteCampaign(campaign.id)">Delete</button>
        <router-link :to="`/campaign/${campaign.id}/proposals`"> 
          <button>View Proposals</button>
        </router-link>
      </li>
    </ul>

    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userData: null,
      campaigns: [],
      errorMessage: null,
      token: null,
      baseURL: 'http://localhost:5000'
    };
  },
  computed: {
    profileImageURL() {
      if (this.userData && this.userData.profile_image) {
        // Construct the full image URL using the baseURL
        return this.baseURL + '/'+this.userData.profile_image; 
      } else {
        return null; // Or a default image URL
      }
    }
  }, 
  async mounted() {
    try {
      this.token = localStorage.getItem('auth_token');
      await this.fetchCampaigns();
      await this.fetchUserDetails();
    } catch (error) {
      this.handleError(error, 'Error fetching campaigns');
    }
  },
  methods: {
    async fetchUserDetails() {
      const response = await fetch('http://localhost:5000/api/user', {
        method: 'GET',
        headers: {
          'Authentication-token': this.token
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching user details: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.userData = data; // Set the user data
    },
    async fetchCampaigns() {
      const response = await fetch(`http://localhost:5000/api/campaigns`, { // Replace with your API URL
        method: 'GET',
        headers: {
          'Authentication-token': this.token,
        }
      });

      if (!response.ok) {
        const message = `Error fetching campaigns: ${response.status} ${response.statusText}`;
        throw new Error(message);
      }
      const data = await response.json();
      this.campaigns = data.campaigns.map(campaign => ({
        ...campaign,
        showProposals: false, // Add showProposals property to each campaign
        proposals: [] // Initialize proposals to an empty array
      }));
    },
    createCampaign() {
      this.$router.push('/create-campaign');
    },
    editCampaign(campaignId) {
      this.$router.push(`/update-campaign/${campaignId}`);
    },
    async deleteCampaign(campaignId) {
      if (confirm('Are you sure you want to delete this campaign?')) {
        try {
          const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}`, { // Replace with your API URL
            method: 'DELETE',
            headers: {
              'Authentication-token': this.token, // Include token in headers
            }
          });
          if (!response.ok) {
            const message = `Error deleting campaign: ${response.status} ${response.statusText}`;
            throw new Error(message);
          }
          alert('Campaign deleted successfully!');
          await this.fetchCampaigns(); // Refresh the campaign list
        } catch (error) {
          this.handleError(error, 'Error deleting campaign');
        }
      }
    },
    handleError(error, defaultMessage) {
      console.error(error);
      this.errorMessage = error.message || defaultMessage;
    },
    async toggleProposals(campaign) {
      campaign.showProposals = !campaign.showProposals;
      if (campaign.showProposals && !campaign.proposals.length) { // Fetch only if not already fetched
        try {
          const response = await fetch(`http://localhost:5000/api/campaigns/${campaign.id}/proposals`, { // Replace with your API URL
            headers: {
              'Authentication-token': this.token,
            }
          });
          if (!response.ok) {
            const message = `Error fetching proposals: ${response.status} ${response.statusText}`;
            throw new Error(message);
          }
          const data = await response.json();
          campaign.proposals = data.proposals; 
        } catch (error) {
          this.handleError(error, 'Error fetching proposals');
        }
      }
    }
  },
};
</script>


<style scoped>
/* Main Dashboard Container */
.brand-dashboard {
  text-align: center;
}

.brand-info {
  display: inline-block;
  padding: 20px;
  margin: 20px auto;
  width: 80%;
  max-width: 400px;
  background: linear-gradient(135deg, #4b79a1, #283e51);
  border-radius: 15px;
  color: #fff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  text-align: left;
  transition: transform 0.3s, box-shadow 0.3s;
}

.brand-info:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.brand-info h2 {
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: bold;
}

.brand-info p {
  margin: 8px 0;
  font-size: 16px;
  line-height: 1.6;
}

.brand-info p span {
  font-weight: bold;
  color: #ffdd57;
}

.brand-info a {
  color: #ffdd57;
  text-decoration: none;
}

.brand-info a:hover {
  text-decoration: underline;
}

.profile-image {
  display: block;
  width: 100px;
  height: 100px;
  margin: 15px auto;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.create-campaign-button {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background: #ff5722;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.create-campaign-button:hover {
  background: #e64a19;
}

.error {
  color: red;
  margin-top: 20px;
}
div {
  font-family: 'Arial', sans-serif;
  color: #333;
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
}

/* Header Styling */
h1 {
  color: #5a20d6;
  font-size: 32px;
  text-align: center;
  margin-bottom: 20px;
}

/* Button Styling */
button {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 12px 20px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin: 5px;
}

button:hover {
  background-color: #357abd;
}

/* Campaign List Styling */
#campaign-list {
  list-style: none;
  padding: 0;
}

#campaign-list li {
  background: #ffe4f2;
  border: 2px solid #e9c2d3;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

#campaign-list li:hover {
  transform: scale(1.02);
}

/* Campaign Title */
#campaign-list h3 {
  color: #c13584;
  font-size: 24px;
}

/* Campaign Description */
#campaign-list p {
  color: #6d6d6d;
  font-size: 16px;
}

/* Proposal Button Styling */
#campaign-list button {
  background-color: #f77737;
  color: white;
  font-size: 14px;
  border-radius: 5px;
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 10px;
}

#campaign-list button:hover {
  background-color: #d6631b;
}

/* View Proposals Button with Router-Link */
.router-link-active button {
  background-color: #6b5b95;
}

.router-link-active button:hover {
  background-color: #533d7a;
}

/* Error Message Styling */
.error {
  color: #ff0033;
  margin-top: 10px;
  background-color: #ffe6e6;
  padding: 10px;
  border-radius: 5px;
}

/* Add Campaign Button */
button[title="Create New Campaign"] {
  background-color: #00b894;
  font-size: 16px;
  margin-top: 15px;
}

button[title="Create New Campaign"]:hover {
  background-color: #008e72;
}

/* Campaign Proposal List */
.proposal-list {
  background: #e0f7fa;
  border-radius: 6px;
  padding: 10px 15px;
  margin-top: 15px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

.proposal-list li {
  padding: 8px 0;
  color: #00796b;
}
</style>
