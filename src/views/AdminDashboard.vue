<template>
  <div class="admin-dashboard">
    <h2>Admin Dashboard</h2>

    <div class="section">

      <canvas id="userChart"></canvas> 

      <h3>Brand Professionals</h3>
      <input type="text" v-model="brandSearch" placeholder="Search by username or brand name..." />
      <table class="professional-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Brand Name</th>
            <th>Website</th>
            <th>Industry</th>
            <th>Verified</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="brand in filteredBrandProfessionals" :key="brand.id">
            <td>{{ brand.user?.username }}</td> 
            <td>{{ brand.name }}</td>
            <td>{{ brand.website }}</td>
            <td>{{ brand.industry }}</td>
            <td>
              <span v-if="brand.verified" class="verified-badge">Verified</span>
              <span v-else>Not Verified</span>
            </td>
            <td>
              <span v-if="brand.active" class="active-badge">Active</span> 
              <span v-else class="inactive-badge">Inactive</span>
            </td>
            <td>
              <button v-if="!brand.verified" @click="verifyBrand(brand.id)" class="action-button verify-button">
                Verify
              </button>
              <button v-if="!brand.active" @click="activateUser(brand.user?.id)" class="action-button activate-button"> 
                Activate
              </button>
              <button v-if="brand.active" @click="deactivateUser(brand.user?.id)" class="action-button deactivate-button"> 
                Deactivate
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <h3>Influencer Professionals</h3>
      <input type="text" v-model="influencerSearch" placeholder="Search by username or niche..." />
      <table class="professional-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Niche</th>
            <th>Followers</th>
            <th>Bio</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="influencer in filteredInfluencerProfessionals" :key="influencer.id">
            <td>{{ influencer.user?.username }}</td> 
            <td>{{ influencer.niche }}</td>
            <td>{{ influencer.followers }}</td>
            <td>{{ influencer.bio }}</td>
            <td>
              <span v-if="influencer.active" class="active-badge">Active</span> 
              <span v-else class="inactive-badge">Inactive</span>
            </td>
            <td>
              <button v-if="!influencer.active" @click="activateUser(influencer.user?.id)" class="action-button activate-button"> 
                Activate
              </button>
              <button v-if="influencer.active" @click="deactivateUser(influencer.user?.id)" class="action-button deactivate-button"> 
                Deactivate
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <h3>Campaigns</h3>
      <input type="text" v-model="campaignSearch" placeholder="Search by title or brand name..." />
      <table class="campaign-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Brand</th>
            <th>Description</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Budget</th>
            <th>Status</th>
            <th>Visibility</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="campaign in filteredCampaigns" :key="campaign.id">
            <td>{{ campaign.title }}</td>
            <td>{{ campaign.brand?.name }}</td>  
            <td>{{ campaign.description }}</td>
            <td>{{ campaign.start_date }}</td>
            <td>{{ campaign.end_date }}</td>
            <td>{{ campaign.budget }}</td>
            <td>{{ campaign.status }}</td>
            <td> 
              <span v-if="campaign.private" class="private-badge">Private</span>
              <span v-else class="public-badge">Public</span>
            </td>
            <td>
              <button @click="toggleCampaignVisibility(campaign)" class="action-button visibility-button">
                {{ campaign.private ? 'Make Public' : 'Make Private' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div><button type="button" class="btn btn-outline-success" @click="download">Download</button></div>
  </div>
</template>

<script>
import axios from 'axios';
import Chart from 'chart.js/auto'; 

export default {
  data() {
    return {
      brandProfessionals: [],
      influencerProfessionals: [],
      campaigns: [],
      brandSearch: '',
      influencerSearch: '',
      campaignSearch: ''
    };
  },
  async mounted() {
    await this.loadData(); // Call the data loading method in mounted
  },
  computed: {
    filteredBrandProfessionals() {
      const searchTerm = this.brandSearch.toLowerCase();
      return this.brandProfessionals.filter(brand => {
        return (brand.user?.username?.toLowerCase().includes(searchTerm) ?? false) ||
               (brand.name?.toLowerCase().includes(searchTerm) ?? false);
      });
    },
    filteredInfluencerProfessionals() {
      const searchTerm = this.influencerSearch.toLowerCase();
      return this.influencerProfessionals.filter(influencer => {
        return (influencer.user?.username?.toLowerCase().includes(searchTerm) ?? false) ||
               (influencer.niche?.toLowerCase().includes(searchTerm) ?? false);
      });
    },
    filteredCampaigns() {
      const searchTerm = this.campaignSearch.toLowerCase();
      return this.campaigns.filter(campaign => {
        return (campaign.title?.toLowerCase().includes(searchTerm) ?? false) ||
               (campaign.brand?.name?.toLowerCase().includes(searchTerm) ?? false); 
      });
    }
  },
  methods: {
    async loadData() {
      try {
        const [brandResponse, influencerResponse, campaignsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/brand_professionals'),
          axios.get('http://localhost:5000/api/admin/influencer_professionals'),
          axios.get('http://localhost:5000/api/admin/campaigns')
        ]);

        this.brandProfessionals = brandResponse.data;
        this.influencerProfessionals = influencerResponse.data;
        this.campaigns = campaignsResponse.data;

        this.createUserChart(); // Recreate the chart after reloading data
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    async verifyBrand(brandId) {
      try {
        await axios.post(`http://localhost:5000/api/admin/verify_brand/${brandId}`);
        const brand = this.brandProfessionals.find(b => b.id === brandId);
        await this.loadData();
        if (brand) {
          brand.verified = true;
        }
      } catch (error) {
        console.error('Error verifying brand:', error);
      }
    },
    async activateUser(userId) {
      try {
        await axios.post(`http://localhost:5000/api/admin/activate_user/${userId}`);
        this.updateUserActiveStatus(userId, true);
        await this.loadData();
      } catch (error) {
        console.error('Error activating user:', error);
      }
    },
    async deactivateUser(userId) {
      try {
        await axios.post(`http://localhost:5000/api/admin/deactivate_user/${userId}`);
        this.updateUserActiveStatus(userId, false);
        await this.loadData();
      } catch (error) {
        console.error('Error deactivating user:', error);
      }
    },
    updateUserActiveStatus(userId, isActive) {
      const brand = this.brandProfessionals.find(b => b.user_id === userId);
      if (brand) {
        brand.user.active = isActive; 
      }
      const influencer = this.influencerProfessionals.find(i => i.user_id === userId);
      if (influencer) {
        influencer.user.active = isActive; 
      }
    },
    async toggleCampaignVisibility(campaign) {
      try {
        const newVisibility = !campaign.private;
        await axios.put(`http://localhost:5000/api/admin/campaigns/${campaign.id}`, { private: newVisibility });
        campaign.private = newVisibility;
        await this.loadData();
      } catch (error) {
        console.error('Error toggling campaign visibility:', error);
      }
    },
    async download() {
  try {
    alert("Downloading will start soon");
    const response = await fetch('http://localhost:5000/api/csv', { method: 'POST' });

    if (!response.ok) {
      throw new Error(`Failed to start download: ${response.status} - ${response.statusText}`);
    }

    const response_data = await response.json();
    const taskid = response_data['task_id'];

    let timeoutId; 
    const intv = setInterval(async () => {
      const checkResponse = await fetch(`http://localhost:5000/api/csv/${taskid}`, { method: 'GET' });

      if (checkResponse.ok) {
        clearInterval(intv);
        clearTimeout(timeoutId); 
        window.location.href = `http://localhost:5000/api/csv/${taskid}`; 
      } else {
        const errorData = await checkResponse.json();
        let errorMessage = "An error occurred.";

        if (checkResponse.status === 404) {
          errorMessage = "File not found. Please try again later.";
        } else if (checkResponse.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (errorData.message) { 
          errorMessage = `Error: ${errorData.message}`;
        }

        alert(errorMessage);
        clearInterval(intv);
        clearTimeout(timeoutId); 
      }
    }, 5000); // Increased polling interval

    // Set a timeout of 60 seconds (adjust as needed)
    timeoutId = setTimeout(() => {
      clearInterval(intv);
      alert("Download timed out. Please try again later.");
    }, 60000);

  } catch (error) {
    console.error("Download error:", error);
    alert(`An error occurred: ${error.message}`);
  }
},
    createUserChart() {
  const ctx = document.getElementById('userChart').getContext('2d');
  this.userChart = new Chart(ctx, {
    type: 'bar', 
    data: {
      labels: ['Brands', 'Influencers'],
      datasets: [{
        label: 'Number of Users',
        data: [
          this.brandProfessionals.length, 
          this.influencerProfessionals.length  
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.2)', 
          'rgba(255, 99, 132, 0.2)'  
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',  
          'rgba(255, 99, 132, 1)'   
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Users'
          }
        },
        x: {
          title: {
            display: true,
            text: 'User Type'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Brand vs Influencer Users',
          font: {
            size: 16
          }
        },
        legend: {
          display: true,
          position: 'bottom' 
        }
      }
    }
  });
}
  }
};
</script>


  
  <style scoped>
  .public-badge {
  background-color: #4CAF50; /* Green */
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}


  .admin-dashboard {
    font-family: 'Roboto', sans-serif; /* Example font */
    margin: 20px;
  }
  
  .section {
    margin-bottom: 40px;
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
  }
  
  h3 {
    color: #333;
    margin-bottom: 15px;
  }
  
  input[type="text"] {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  .professional-table,
  .campaign-table {
    width: 100%;
    border-collapse: collapse;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #e9ecef; /* Lighter gray */
    font-weight: bold;
    color: #333;
  }
  
  tbody tr:nth-child(even) {
    background-color: #f2f2f2; /* Very light gray */
  }
  
  tbody tr:hover {
    background-color: #e0e0e5; /* Light blue on hover */
  }
  .verified-badge {
  background-color: #4CAF50; /* Green */
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.action-button {
  background-color: #008CBA; /* Blue */
  border: none;
  color: white;
  padding: 8px 16px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size:  14px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease; /* Smooth transition for hover effect */
}

.action-button:hover {
  background-color: #005f80; /* Darker blue on hover */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Add a subtle shadow on hover */
}

.verify-button {
  background-color: #4CAF50; /* Green */
}

.verify-button:hover {
  background-color: #367c39; /* Darker green on hover */
}

.flag-button {
  background-color: #f44336; /* Red */
}

.flag-button:hover {
  background-color: #b71c1c; /* Darker red on hover */
}

/* Add more advanced CSS effects as needed */
.action-button:active {
  transform: translateY(1px); /* Slight downward shift on click */
}

.professional-table tbody tr:hover {
  background-color: #f0f0f5; /* Even lighter blue on hover */
  transform: scale(1.01); /* Slightly scale up the row on hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* More pronounced shadow on hover */
}
  </style>