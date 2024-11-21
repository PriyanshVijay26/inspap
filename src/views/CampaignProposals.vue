<template>
  <div class="campaign-proposals">
    <h2>Proposals for Campaign {{ campaignId }}</h2>
    <div class="campaign-details">
      <p><strong>Campaign Budget:</strong> {{ campaignBudget }}</p>
      <p><strong>Campaign Title:</strong> {{ campaignTitle }}</p>
    </div>

  

    <h3>Proposed By Influencers</h3>
    <ul v-if="otherProposals.length > 0" class="proposal-list">
      <li v-for="proposal in otherProposals" :key="proposal.id" class="proposal-card">
        <p><strong>{{ proposal.influencer_name }}</strong></p>
        <p>Bid Amount: ${{ proposal.bid_amount }}</p>
        <p>Status: <span :class="`status-${proposal.status}`">{{ proposal.status }}</span></p>
        <div v-if="proposal.showChat" > 
          <ChatComponent class="chat-wrapper" :proposal="proposal" @close-chat="closeNegotiationChat(proposal)" />
        </div>

        <div v-if="proposal.status === 'pending'" class="action-buttons">
          <button @click="acceptProposal(proposal.id)" class="btn-accept">Accept</button>
          <button @click="rejectProposal(proposal.id)" class="btn-reject">Reject</button>
          <button @click="openNegotiationChat(proposal)" class="btn-negotiate">Negotiate</button>
        </div>

         
      </li>
    </ul>
    <p v-else class="no-proposals">No other proposals for this campaign yet.</p>
  </div>
</template>
  
  <script>
  import ChatComponent from './ChatComponent.vue'; // Import your chat component
  
  export default {
    components: {
      ChatComponent,
    },
    props: ['campaignId'],
    data() {
      return {
        proposals: [],
        myProposals: [], 
        otherProposals: [], 
        token: null,
        campaignBudget: null, // Add campaignBudget to data
        campaignTitle: null
      };
    },
    async mounted() {
      this.token = localStorage.getItem('auth_token');
      await this.fetchProposals();
    },
    methods: {
      async fetchProposals() {
        try {
          const response = await fetch(`http://localhost:5000/api/campaigns/${this.campaignId}/proposals`, { // Replace with your API URL
            headers: {
              'Authentication-token': this.token,
            }
          });
          if (!response.ok) {
            const message = `Error fetching proposals: ${response.status} ${response.statusText}`;
            throw new Error(message);
          }
          const data = await response.json();
          this.proposals = data.proposals;
          this.campaignBudget = data.campaign_budget; // Set campaignBudget from response
          this.campaignTitle = data.campaign_title
          this.filterProposals();
        } catch (error) {
          console.error('Error fetching proposals:', error);
          // Handle error (e.g., display an error message)
        }
      },
      filterProposals() {
        this.myProposals = this.proposals.filter(proposal => proposal.proposed_by === 'brand');
        this.otherProposals = this.proposals.filter(proposal => proposal.proposed_by === 'influencer');
      },
      async acceptProposal(proposalId) {
        try {
          const response = await fetch(`http://localhost:5000/api/campaigns/${this.campaignId}/proposals/${proposalId}`, { // Replace with your API URL
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-token': this.token,
            },
            body: JSON.stringify({ action: 'accept' }), 
          });
  
          if (!response.ok) {
            const message = `Error accepting proposal: ${response.status} ${response.statusText}`;
            throw new Error(message);
          }
  
          const proposalIndex = this.otherProposals.findIndex(p => p.id === proposalId);
          if (proposalIndex > -1) {
            this.otherProposals[proposalIndex].status = 'accepted';
          }
        } catch (error) {
          console.error('Error accepting proposal:', error);
          // Handle error (e.g., display an error message)
        }
      },
      async rejectProposal(proposalId) {
        try {
          const response = await fetch(`http://localhost:5000/api/campaigns/${this.campaignId}/proposals/${proposalId}`, { // Replace with your API URL
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-token': this.token,
            },
            body: JSON.stringify({ action: 'reject' }), 
          });
  
          if (!response.ok) {
            const message = `Error rejecting proposal: ${response.status} ${response.statusText}`;
            throw new Error(message);
          }
  
          const proposalIndex = this.otherProposals.findIndex(p => p.id === proposalId);
          if (proposalIndex > -1) {
            this.otherProposals[proposalIndex].status = 'rejected';
          }
        } catch (error) {
          console.error('Error rejecting proposal:', error);
          // Handle error (e.g., display an error message)
        }
      },
      openNegotiationChat(proposal) {
        proposal.showChat = true; 
        // You might want to update the proposal status to 'negotiating' here
        // and make an API call to notify the influencer
      },
      closeNegotiationChat(proposal) {
        proposal.showChat = false; 
      },
    },
  };
  </script>
  
  
<style scoped>
.campaign-proposals {
  text-align: center;
  max-width: 800px;
  margin: auto;
  font-family: Arial, sans-serif;
}

.campaign-details {
  margin: 10px 0 20px;
  font-size: 1.1rem;
}

.proposal-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.proposal-card {
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.proposal-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.proposal-card p {
  margin: 5px 0;
  font-size: 1rem;
  color: #333;
}

.status-pending {
  color: #ffa500;
  font-weight: bold;
}

.status-accepted {
  color: #28a745;
  font-weight: bold;
}

.status-rejected {
  color: #dc3545;
  font-weight: bold;
}

.no-proposals {
  font-size: 1rem;
  color: #666;
  margin-top: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

button {
  cursor: pointer;
  padding: 8px 12px;
  font-size: 0.9rem;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-accept {
  background-color: #28a745;
  color: white;
}

.btn-accept:hover {
  background-color: #218838;
  transform: translateY(-2px);
}

.btn-reject {
  background-color: #dc3545;
  color: white;
}

.btn-reject:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

.btn-negotiate {
  background-color: #007bff;
  color: white;
}

.btn-negotiate:hover {
  background-color: #0069d9;
  transform: translateY(-2px);
}

.chat-wrapper {
  /* Styles to override interference from parent component */
  all: unset; /* This resets all styles */ 

  /* Now add the specific styles you need for the chat component */
  background-color: white; 
  border: 1px solid #ccc; 
  border-radius: 5px;
  width: 100%; /* Or a specific width */
  max-width: 400px; 
  /* ... add more styles as needed ... */
}

.chat-wrapper .chat-messages {
  /* Target the nested .chat-messages */
  height: 200px; /* Or another height as needed */
  display: flex;
  flex-direction: column; 
}
.chat-wrapper .my-message {
  align-self: flex-end; /* Align your messages to the right */
}

.chat-wrapper .received-message {
  align-self: flex-start; /* Align received messages to the left */
}

</style>
