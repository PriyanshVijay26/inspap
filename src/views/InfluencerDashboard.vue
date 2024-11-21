
<template>
  <div class="influencer-dashboard">
    <h1>Welcome, {{ influencer.username }}!</h1>

    <div class="influencer-profile">
      <!-- Adding localhost:5000 as the base URL -->
      <img :src="'http://localhost:5000/' + influencer.profile_image" alt="Influencer Profile Picture" class="profile-image" />
    </div>
    <h2>User Details</h2>
    <div class="user-details">
      <p><strong>Name:</strong> {{ influencer.username }}</p>
      <p><strong>Email:</strong> {{ influencer.email }}</p>
    </div>

    <h2>Available Campaigns</h2>
    <div class="campaign-list">
      <div v-for="campaign in campaigns" :key="campaign.id" class="campaign-card">
        <h3>{{ campaign.title }}</h3>
        <p>{{ campaign.description }}</p>
        <button @click="openModal(campaign)">Create Ad Request</button>
      </div>
    </div>

    <h2>Your Proposals</h2>
    <ul v-if="proposals.length > 0">
      <li v-for="proposal in proposals" :key="proposal.id" class="proposal-card">
        <div class="proposal-info">
          Campaign: {{ proposal.campaign_title }} - Bid: {{ proposal.bid_amount }} - {{ proposal.status }}
        </div>
        <div v-if="proposal.showChat">
          <ChatComponent :proposal="proposal" @close-chat="closeNegotiationChat(proposal)" />
        </div>
        <div class="proposal-actions">
          <button v-if="proposal.status === 'pending'" @click="openNegotiationChat(proposal)">Negotiate</button>
          <button v-if="proposal.status === 'pending'" @click="openUpdateBidModal(proposal)">Update Bid</button>
        </div>
      </li>
    </ul>
    <p v-else>You have not submitted any proposals yet.</p>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2>Create Ad Request for {{ selectedCampaign.title }}</h2>
        <form @submit.prevent="createAdRequest">
          <div class="form-group">
            <label for="bid_amount">Bid Amount:</label>
            <input type="number" id="bid_amount" v-model.number="bidAmount" required>
          </div>
          <div class="form-group">
            <label for="proposal_details">Proposal Details:</label>
            <textarea id="proposal_details" v-model="proposalDetails" required></textarea>
          </div>
          <button type="submit">Submit Proposal</button>
        </form>
      </div>
    </div>

    <div v-if="showUpdateBidModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeUpdateBidModal">&times;</span>
        <h2>Update Bid for {{ selectedProposal.campaign_title }}</h2>
        <form @submit.prevent="updateBid">
          <div class="form-group">
            <label for="new_bid_amount">New Bid Amount:</label>
            <input type="number" id="new_bid_amount" v-model.number="newBidAmount" required>
          </div>
          <button type="submit">Update Bid</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import ChatComponent from './ChatComponent.vue'; // Import your chat component

export default {
  components: {
    ChatComponent,
  },
  data() {
    return {
      apiUrl: 'http://localhost:5000',  // Replace with your API URL
      influencer: {},
      campaigns: [],
      proposals: [], 
      showModal: false,
      selectedCampaign: null,
      showUpdateBidModal: false,
      bidAmount: null,
      selectedProposal: null,
      proposalDetails: '',
      token: null,
      newBidAmount: null
    };
  },
  async mounted() {
    this.token = localStorage.getItem('auth_token');
    await this.fetchUserData();
    await this.fetchCampaigns();
    await this.fetchProposals(); 
  },
  methods: {
    async fetchUserData() {
      try {
        const response = await fetch(`${this.apiUrl}/api/user`, {
          headers: {
            'Authentication-token': this.token,
          }
        });
        const data = await response.json();
        this.influencer = data;
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },
    async fetchCampaigns() {
      try {
        const response = await fetch(`${this.apiUrl}/influencer-campaigns`, {
          headers: {
            'Authentication-token': this.token,
          }
        });
        const data = await response.json();
        this.campaigns = data.filter(campaign => !campaign.private);
        console.log(this.campaigns)
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    },
    async fetchProposals() {
      try {
        const response = await fetch(`${this.apiUrl}/api/proposals`, {
          headers: {
            'Authentication-token': this.token,
          }
        });
        const data = await response.json();
        this.proposals = data.proposals.map(proposal => ({ 
          ...proposal,
          showChat: false, 
        }));
        console.log(this.proposals);
      } catch (error) {
        console.error('Error fetching proposals:', error);
      }
    },
    openUpdateBidModal(proposal) {
      this.selectedProposal = proposal;
      this.showUpdateBidModal = true;
      this.newBidAmount = proposal.bid_amount; // Initialize with current bid
    },
    closeUpdateBidModal() {
      this.showUpdateBidModal = false;
      this.selectedProposal = null;
    },
    async updateBid() {
      try {
        const response = await fetch(`${this.apiUrl}/proposals/${this.selectedProposal.id}/bid`, { 
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-token': this.token,
          },
          body: JSON.stringify({ bid_amount: this.newBidAmount }),
        });

        if (response.ok) {
          console.log('Bid updated successfully');
          this.closeUpdateBidModal();
          this.fetchProposals(); // Refresh proposals list
        } else {
          const errorData = await response.json();
          console.error('Error updating bid:', errorData);
        }
      } catch (error) {
        console.error('Error updating bid:', error);
      }
    },

    openModal(campaign) {
      this.selectedCampaign = campaign;
      this.showModal = true;
      this.bidAmount = null;
      this.proposalDetails = '';
    },
    closeModal() {
      this.showModal = false;
      this.selectedCampaign = null;
    },
    async createAdRequest() {
      try {
        const response = await fetch(`${this.apiUrl}/api/campaigns/${this.selectedCampaign.id}/proposals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-token': this.token,
          },
          body: JSON.stringify({
            proposal_details: this.proposalDetails,
            bid_amount: this.bidAmount,
          }),
        });

        if (response.ok) {
          console.log('Proposal created successfully');
          this.closeModal();
          this.fetchProposals(); 
        } else {
          const errorData = await response.json();
          console.error('Error creating proposal:', errorData);
        }
      } catch (error) {
        console.error('Error creating proposal:', error);
      }
    },
    openNegotiationChat(proposal) {
      proposal.showChat = true;
    },
    closeNegotiationChat(proposal) {
      proposal.showChat = false;
    },
  },
};
</script>

<style scoped>
/* Main Container Styling */
.influencer-dashboard {
  font-family: 'Arial', sans-serif;
  color: #2d2d2d;
  background-color: #f3f7f9;
  padding: 20px;
  border-radius: 10px;
}

/* Header Styling */
h1 {
  color: #6a0dad;
  font-size: 32px;
  text-align: center;
  margin-bottom: 20px;
}

/* Section Headings */
h2 {
  color: #4d88ff;
  font-size: 24px;
  margin-top: 20px;
}

/* User Details Styling */
.user-details {
  background: #b3e6ff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.user-details p {
  color: #0066cc;
  font-weight: bold;
  margin: 5px 0;
}

/* Campaign Card Styling */
.campaign-card {
  background: #ffccff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.campaign-card h3 {
  color: #9900cc;
  font-size: 20px;
}

.campaign-card p {
  color: #3c3c3c;
  font-size: 16px;
}

.campaign-card button {
  background-color: #00b3b3;
  color: white;
  border: none;
  padding: 10px 20px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.campaign-card button:hover {
  background-color: #008080;
}

/* Modal Overlay */
.modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal Content Styling */
.modal-content {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 30px;
  width: 50%;
  position: relative;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}

/* Close Button Styling */
.close {
  position: absolute;
  right: 20px;
  top: 20px;
  color: #333333;
  font-size: 24px;
  cursor: pointer;
  font-weight: bold;
}

.close:hover {
  color: #0066cc;
}
.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin: 10px auto;
  display: block;
}
/* Form Styling */
.form-group {
  margin-bottom: 20px;
}

label {
  color: #0066cc;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

input[type="number"],
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #4d88ff;
  border-radius: 5px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

input[type="number"]:focus,
textarea:focus {
  border-color: #6a0dad;
  outline: none;
}

/* Button Styling */
button {
  background-color: #4d88ff;
  color: white;
  border: none;
  padding: 12px 20px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0066cc;
}

/* Proposal List Styling */
ul {
  list-style: none;
  padding: 0;
}

li {
  background-color: #e6f2ff;
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

li button {
  margin-left: 10px;
}
</style>
