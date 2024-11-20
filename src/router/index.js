// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import AppHomePage from '../views/AppHomePage.vue';
import BrandRegistration from '../views/BrandRegistration.vue';
import InfluencerRegistration from '../views/InfluencerRegistration.vue';
import InfluencerDashboard from '../views/InfluencerDashboard.vue';
import BrandLogin from '../views/BrandLogin.vue';
import InfluencerLogin from '../views/InfluencerLogin.vue'; 
import AdminLogin from '../views/AdminLogin.vue'; 
import BrandDashboard from '../views/BrandDashboard.vue';
import CreateCampaign from '../views/CreateCampaign.vue';
import UpdateCampaign from '../views/UpdateCampaign.vue'; 
import CampaignProposals from '../views/CampaignProposals.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
const routes = [
  {
    path: '/',
    name: 'AppHomePage',
    component: AppHomePage
  },
  {
    path: '/brand-register',
    name: 'BrandRegistration',
    component: BrandRegistration
  },
  {
    path: '/campaign/:campaignId/proposals', 
    name: 'CampaignProposals',
    component: CampaignProposals,
    props: true // This will pass the campaignId as a prop to the component
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard
  }
  ,
  {
    path: '/influencer-dashboard',
    name: 'InfluencerDashboard',
    component: InfluencerDashboard
  },

  {
    path: '/influencer-register',
    name: 'InfluencerRegistration',
    component: InfluencerRegistration
  },
  {
    path: '/brand-login',
    name: 'BrandLogin',
    component: BrandLogin
  },
  {
    path: '/influencer-login',
    name: 'InfluencerLogin',
    component: InfluencerLogin
  },
  {
    path: '/admin-login',
    name: 'AdminLogin', 
    component: AdminLogin
  },
  {
    path: '/brand-dashboard',
    name: 'BrandDashboard',
    component: BrandDashboard
  },
  {
    path: '/create-campaign',
    name: 'CreateCampaign',
    component: CreateCampaign
  },
  {
    path: '/update-campaign/:campaignId',
    name: 'UpdateCampaign',
    component: UpdateCampaign
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;