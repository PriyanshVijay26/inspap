from flask_restful import Api, Resource, reqparse
from models import db, User, Influencer, Brand
from flask_security.utils import hash_password,verify_password
import os
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from datastorefile import datastore
from flask import jsonify, request, make_response,Response,stream_with_context,json,send_file
from flask_security import auth_required, roles_required, current_user
from models import *
from flask_restful import Api, Resource, reqparse, fields, marshal_with,marshal
from flask_login import LoginManager,login_required,current_user,UserMixin,login_user, logout_user, login_required
from flask_socketio import emit
#from main import api, socketio  # Import api from main.py
import time
import secrets
#from flask_socketio import emit, join_room, leave_room
from tasks import *
from celery.result import AsyncResult
from werkzeug.utils import safe_join
from cache import cache


api = Api() 


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS




class InfluencerRegistration(Resource):
    def post(self):
        print("Influencer registration endpoint reached")
        try:
            data = request.form.to_dict()
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            bio = data.get('bio')
            niche = data.get('niche')
            followers = data.get('followers')
            facebook_link = data.get('facebook_link')
            instagram_link = data.get('instagram_link')
            twitter_link = data.get('twitter_link')
            youtube_link = data.get('youtube_link')
            date_of_birth_str = data.get('date_of_birth')

            try:
                date_of_birth = datetime.strptime(date_of_birth_str, '%Y-%m-%d')
            except ValueError:
                return make_response(jsonify({'message': 'Invalid date format. Please use YYYY-MM-DD'}), 400)

            if 'profile_image' not in request.files:
                return make_response(jsonify({'message': 'No profile image provided'}), 400)

            file = request.files['profile_image']
            if file.filename == '':
                return make_response(jsonify({'message': 'No profile image selected'}), 400)

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                from main import app  # Import app here to avoid circular imports
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                profile_image_path = filepath
            else:
                return make_response(jsonify({'message': 'Invalid image file type'}), 400)

            existing_user = datastore.find_user(email=email)
            if existing_user:
                return make_response(jsonify({'message': 'User with this email already exists'}), 400)

            # Create the user
            new_user = datastore.create_user(
                username=username,
                email=email,
                password=hash_password(password),
                type='influencer'
            )
            db.session.commit()  # Commit to get the user's ID

            # Assign the "influencer" role
            influencer_role = Role.query.filter_by(name='influencer').first()
            if influencer_role:
                new_user.roles.append(influencer_role)
                db.session.commit()
            else:
                return make_response(jsonify({'message': 'Influencer role not found'}), 500)

            # Create the influencer (store user_id instead of the user object)
            influencer = Influencer(
                user_id=new_user.id,
                bio=bio,
                niche=niche,
                followers=followers,
                facebook_link=facebook_link,
                instagram_link=instagram_link,
                twitter_link=twitter_link,
                youtube_link=youtube_link,
                date_of_birth=date_of_birth,
                profile_image=profile_image_path
            )
            db.session.add(influencer)
            db.session.commit()

            return make_response(jsonify({'message': 'Influencer registered successfully!'}), 201)

        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': 'An error occurred', 'error': str(e)}), 500)
class BrandRegistration(Resource):
    def post(self):
        try:
            data = request.form.to_dict()
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            name = data.get('name')
            website = data.get('website')
            contact_email = data.get('contact_email')
            company_description = data.get('company_description')
            industry = data.get('industry')

            if 'profile_image' not in request.files:
                return make_response(jsonify({'message': 'No profile image provided'}), 400)

            file = request.files['profile_image']
            if file.filename == '':
                return make_response(jsonify({'message': 'No profile image selected'}), 400)

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                from main import app  # Import your app instance here
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                profile_image_path = filepath
            else:
                return make_response(jsonify({'message': 'Invalid image file type'}), 400)

            existing_user = datastore.find_user(email=email)
            if existing_user:
                return make_response(jsonify({'message': 'User with this email already exists'}), 400)

            new_user = datastore.create_user(
                username=username,
                email=email,
                password=hash_password(password),  
                type='brand'
            )
            db.session.commit() 

            # Get the 'brand' role
            brand_role = Role.query.filter_by(name='brand').first()
            if brand_role:
                new_user.roles.append(brand_role) 
                db.session.commit()

            brand = Brand(
                user_id=new_user.id,  
                name=name,
                website=website,
                contact_email=contact_email,
                company_description=company_description,
                industry=industry,
                profile_image=profile_image_path
            )
            db.session.add(brand)
            db.session.commit()

            return make_response(jsonify({'message': 'Brand registered successfully!'}), 201) 

        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': 'An error occurred', 'error': str(e)}), 500)

class InfluencerLogin(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Find the user by email
        user = datastore.find_user(email=email)
        
        # Check if user exists and if password is correct
        if not user or not verify_password(password, user.password):
            return make_response(jsonify({'message': 'Invalid credentials'}), 401)

        # Check if user is an influencer
        if user.type != 'influencer':
            return make_response(jsonify({'message': 'User is not an influencer'}), 403)
        
        # Check if the user's account is active
        if not user.active:
            return make_response(jsonify({'message': 'Your account is blocked. Please contact support.'}), 403)

        # Generate and store the auth token
        auth_token = user.get_auth_token()
        user.auth_token = auth_token
        db.session.commit()

        # Get the user's roles
        roles = [role.name for role in user.roles]

        return make_response(jsonify({'auth_token': auth_token, 'role': roles}), 200)

    
    

class BrandLogin(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        print(f"Received login request for email: {email}")  # Print the received email

        # Find the user by email
        user = datastore.find_user(email=email) 

        if not user:
            print(f"User with email {email} not found.")
            return make_response(jsonify({'message': 'Invalid credentials'}), 401)

        # Verify the user's password
        if not verify_password(password, user.password):
            print(f"Incorrect password for email {email}.")
            return make_response(jsonify({'message': 'Invalid credentials'}), 401)

        # Check if user is a brand
        if user.type != 'brand':
            print(f"User {email} is not a brand.")
            return make_response(jsonify({'message': 'User is not a brand'}), 403)

        # Check if the user's account is active
        if not user.active:
            return make_response(jsonify({'message': 'Your account is blocked. Please contact support.'}), 403)

        # Check if the brand is verified
        brand = user.brand  # Assuming a one-to-one relationship between user and brand
        if not brand or not brand.verified:
            return make_response(jsonify({'message': 'Your brand is not verified. Please verify your account.'}), 403)

        # Generate the auth token for successful login
        auth_token = user.get_auth_token()
        user.auth_token = auth_token
        db.session.commit()

        # Log the user in
        login_user(user)

        # Get the user's roles
        roles = [role.name for role in user.roles]

        print(current_user)  # Print current_user after successful login

        return make_response(jsonify({'auth_token': auth_token, 'roles': roles}), 200)


class AdminLogin(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = datastore.find_user(email=email)  
        if not user or not verify_password(password, user.password):
            return make_response(jsonify({'message': 'Invalid credentials'}), 401)

        if not user.has_role('admin'):
            return make_response(jsonify({'message': 'User is not an admin'}), 403)

        # Get the user's auth token and roles
        auth_token = user.get_auth_token()
        roles = [role.name for role in user.roles]

        return make_response(jsonify({'auth_token': auth_token, 'role': roles}), 200)




class CreateCampaign(Resource):
    @auth_required('token')
    def get(self):
        # Get the Brand associated with the current user
        brand = Brand.query.filter_by(user_id=current_user.id).first()
        
        if not brand:
            return make_response(jsonify({'message': 'Brand not found'}), 404) 

        # Filter campaigns by the brand's ID
        campaigns = Campaign.query.filter_by(brand_id=brand.id).all()
        
        campaign_list = []
        for campaign in campaigns:
            campaign_data = {
                'id': campaign.id,
                'brand_id': campaign.brand_id,
                'title': campaign.title,
                'description': campaign.description,
                'start_date': campaign.start_date.strftime('%Y-%m-%d') if campaign.start_date else None,
                'end_date': campaign.end_date.strftime('%Y-%m-%d') if campaign.end_date else None,
                'budget': campaign.budget,
                'status': campaign.status,
                'campaign_goals': campaign.campaign_goals,
                'target_audience': campaign.target_audience,
                'private': campaign.private,
                # ... add other fields as needed
            }
            campaign_list.append(campaign_data)

        return make_response(jsonify({'campaigns': campaign_list}), 200)
    @auth_required('token')
    @roles_required('brand')
    def post(self):
        """
        Create a new campaign.
        """
        print(current_user)
        user = current_user  

        brand = Brand.query.filter_by(user_id=user.id).first()  
        if not brand:
            return make_response(jsonify({'message': 'Brand not found'}), 404)

        data = request.get_json() 

        title = data.get('title')
        description = data.get('description')
        start_date_str = data.get('start_date')
        end_date_str = data.get('end_date')
        budget = data.get('budget')
        campaign_goals = data.get('campaign_goals')
        target_audience = data.get('target_audience')
        # ... get other fields from data as needed ...

        if not all([title, description, start_date_str, end_date_str, budget, campaign_goals, target_audience]):
            return make_response(jsonify({'message': 'Missing required fields'}), 400)

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        except ValueError:
            return make_response(jsonify({'message': 'Invalid date format. Please use YYYY-MM-DD'}), 400)

        new_campaign = Campaign(
            brand_id=brand.id, 
            title=title,
            description=description,
            start_date=start_date,
            end_date=end_date,
            budget=budget,
            campaign_goals=campaign_goals,
            target_audience=target_audience,
            # ... other campaign fields
        )

        db.session.add(new_campaign)
        db.session.commit()

        return make_response(jsonify({'message': 'Campaign created successfully', 'campaign_id': new_campaign.id}), 201)



class CampaignResource(Resource):
    @auth_required('token')
    @roles_required('brand')
    def get(self, campaign_id):
        """
        Get a specific campaign by ID.
        """
        user = current_user
        brand = Brand.query.filter_by(user_id=user.id).first()
        if not brand:
            return make_response(jsonify({'message': 'Brand not found'}), 404)

        campaign = Campaign.query.filter_by(id=campaign_id, brand_id=brand.id).first()
        if not campaign:
            return make_response(jsonify({'message': 'Campaign not found'}), 404)

        campaign_data = {
            'id': campaign.id,
            'brand_id': campaign.brand_id,
            'title': campaign.title,
            'description': campaign.description,
            'start_date': campaign.start_date.strftime('%Y-%m-%d'),
            'end_date': campaign.end_date.strftime('%Y-%m-%d'),
            'budget': campaign.budget,
            'status': campaign.status,
            'campaign_goals': campaign.campaign_goals,
            'target_audience': campaign.target_audience,
            # ... add other fields as needed
        }
        return make_response(jsonify(campaign_data), 200)

    @auth_required('token')
    @roles_required('brand')
    def put(self, campaign_id):
        """
        Update a campaign.
        """
        user = current_user
        brand = Brand.query.filter_by(user_id=user.id).first()
        if not brand:
            return make_response(jsonify({'message': 'Brand not found'}), 404)

        campaign = Campaign.query.filter_by(id=campaign_id, brand_id=brand.id).first()
        if not campaign:
            return make_response(jsonify({'message': 'Campaign not found'}), 404)

        data = request.get_json()

        # Update campaign attributes
        campaign.title = data.get('title', campaign.title)
        campaign.description = data.get('description', campaign.description)
        campaign.campaign_goals = data.get('campaign_goals', campaign.campaign_goals)
        campaign.target_audience = data.get('target_audience', campaign.target_audience)

        try:
            start_date_str = data.get('start_date')
            if start_date_str:
                campaign.start_date = datetime.strptime(start_date_str, '%Y-%m-%d')

            end_date_str = data.get('end_date')
            if end_date_str:
                campaign.end_date = datetime.strptime(end_date_str, '%Y-%m-%d')

        except ValueError:
            return make_response(jsonify({'message': 'Invalid date format. Please use YYYY-MM-DD'}), 400)

        # ... update other fields as needed ...

        db.session.commit()
        return make_response(jsonify({'message': 'Campaign updated successfully'}), 200)

    @auth_required('token')
    @roles_required('brand')
    def delete(self, campaign_id):
        """
        Delete a campaign.
        """
        user = current_user
        brand = Brand.query.filter_by(user_id=user.id).first()
        if not brand:
            return make_response(jsonify({'message': 'Brand not found'}), 404)

        campaign = Campaign.query.filter_by(id=campaign_id, brand_id=brand.id).first()
        if not campaign:
            return make_response(jsonify({'message': 'Campaign not found'}), 404)

        db.session.delete(campaign)
        db.session.commit()
        return make_response(jsonify({'message': 'Campaign deleted successfully'}), 200)


proposal_fields = {
    'id': fields.Integer,
    'campaign_id': fields.Integer,
    'influencer_id': fields.Integer,
    'status': fields.String,
    'proposal_details': fields.String,
    'bid_amount': fields.Float,
    'proposed_by': fields.String
    # ... add other fields as needed
}



class InfluencerCampaignResource(Resource):
    @roles_required('influencer') 
    @auth_required('token')
    def get(self):
        # Get the current influencer's niche
        influencer = Influencer.query.filter_by(user_id=current_user.id).first()
        if not influencer:
            return make_response(jsonify({'message': 'Influencer not found'}), 404)
        
        # Query campaigns based on the influencer's niche
        campaigns = Campaign.query.join(Brand).filter(Brand.industry == influencer.niche).all()

        # Serialize the campaigns (convert to JSON format)
        result = []
        for campaign in campaigns:
            campaign_data = {
                'id': campaign.id,
                'brand_name': campaign.brand.name,  # Include brand name
                'title': campaign.title,
                'description': campaign.description,
                'start_date': campaign.start_date.isoformat() if campaign.start_date else None,
                'end_date': campaign.end_date.isoformat() if campaign.end_date else None,
                'budget': campaign.budget,
                'status': campaign.status,
                'campaign_goals': campaign.campaign_goals,
                'target_audience': campaign.target_audience,
                'private': campaign.private,
                # ... other fields you want to include
            }
            result.append(campaign_data)

        return make_response(jsonify(result), 200) 







class ProposalResource(Resource):
    @auth_required('token')
    @roles_required('influencer')
    @marshal_with(proposal_fields)
    def post(self, campaign_id):
        """
        Create a new proposal for a campaign (from influencer side).
        """
        user = current_user
        influencer = Influencer.query.filter_by(user_id=user.id).first()
        if not influencer:
            return make_response(jsonify({'message': 'Influencer not found'}), 404)

        campaign = Campaign.query.filter_by(id=campaign_id).first()
        if not campaign:
            return make_response(jsonify({'message': 'Campaign not found'}), 404)

        data = request.get_json()
        proposal_details = data.get('proposal_details')
        bid_amount = data.get('bid_amount')
        # ... get other fields from data as needed ...

        # Validate required fields
        if not all([proposal_details, bid_amount]):
            return make_response(jsonify({'message': 'Missing required fields'}), 400)

        new_proposal = Proposal(
            campaign_id=campaign_id,
            influencer_id=influencer.id,
            status='pending',  # Set status to pending by default
            proposal_details=proposal_details,
            bid_amount=bid_amount,
            proposed_by='influencer'
            # ... other proposal fields
        )

        db.session.add(new_proposal)
        db.session.commit()

        return make_response(jsonify(marshal(new_proposal, proposal_fields)), 201) 

class BrandProposalResource(Resource):
    @auth_required('token')
    @roles_required('brand')
    @marshal_with(proposal_fields)
    def post(self, campaign_id, influencer_id):
        """
        Create a new proposal for a campaign (from brand side).
        """
        user = current_user
        brand = Brand.query.filter_by(user_id=user.id).first()
        if not brand:
            return jsonify({'message': 'Brand not found'}), 404

        campaign = Campaign.query.filter_by(id=campaign_id, brand_id=brand.id).first()
        if not campaign:
            return jsonify({'message': 'Campaign not found'}), 404

        influencer = Influencer.query.filter_by(id=influencer_id).first()
        if not influencer:
            return jsonify({'message': 'Influencer not found'}), 404

        data = request.get_json()
        status = data.get('status')
        proposal_details = data.get('proposal_details')
        bid_amount = data.get('bid_amount')
        # ... get other fields from data as needed ...

        # Validate required fields
        if not all([status, proposal_details, bid_amount]):
            return jsonify({'message': 'Missing required fields'}), 400

        new_proposal = Proposal(
            campaign_id=campaign_id,
            influencer_id=influencer_id,
            status=status,
            proposal_details=proposal_details,
            bid_amount=bid_amount,
            proposed_by='brand' 
            # ... other proposal fields
        )

        db.session.add(new_proposal)
        db.session.commit()

        return new_proposal, 201

class UserDetails(Resource):
    @auth_required('token')
    def get(self):
        """
        Get user details (Influencer or Brand).
        """
        user = current_user

        if user.type == 'influencer':
            influencer = Influencer.query.filter_by(user_id=user.id).first()
            if not influencer:
                return make_response(jsonify({'message': 'Influencer details not found'}), 404)

            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'type': user.type,
                'bio': influencer.bio,
                'niche': influencer.niche,
                'followers': influencer.followers,
                'profile_image': influencer.profile_image,
                # ... add other influencer fields as needed
            }

        elif user.type == 'brand':
            brand = Brand.query.filter_by(user_id=user.id).first()
            if not brand:
                return make_response(jsonify({'message': 'Brand details not found'}), 404)

            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'type': user.type,
                'name': brand.name,
                'website': brand.website,
                'contact_email': brand.contact_email,
                'profile_image': brand.profile_image,
                # ... add other brand fields as needed
            }

        else:
            return make_response(jsonify({'message': 'Invalid user type'}), 400)

        return make_response(jsonify(user_data), 200)

class ProposalResourceUpdate(Resource):
    @auth_required('token')
    def put(self, campaign_id, proposal_id):
        """
        Update the status of a proposal (accept/reject/negotiate).
        """
        user = current_user
        
        # Determine if the user is an influencer or a brand
        influencer = Influencer.query.filter_by(user_id=user.id).first()
        brand = Brand.query.filter_by(user_id=user.id).first()

        if not influencer and not brand:
            return make_response(jsonify({'message': 'User not found'}), 404)

        proposal = Proposal.query.filter_by(id=proposal_id, campaign_id=campaign_id).first()
        if not proposal:
            return make_response(jsonify({'message': 'Proposal not found'}), 404)

        # Check if the user is authorized to update this proposal
        if (influencer and proposal.influencer_id != influencer.id) and \
           (brand and proposal.campaign.brand_id != brand.id):
            return make_response(jsonify({'message': 'Unauthorized'}), 403)

        data = request.get_json()
        action = data.get('action')  # Get the action type from the request

        if action not in ['accept', 'reject', 'negotiate']:
            return make_response(jsonify({'message': 'Invalid action value'}), 400)

        if action == 'accept':
            proposal.status = 'accepted'
        elif action == 'reject':
            proposal.status = 'rejected'
        elif action == 'negotiate':
            # Here you can add logic to handle negotiation, e.g.,
            #  - Update the proposal status to 'negotiating'
            #  - Send a notification to the influencer
            #  - Store negotiation messages, etc.
            proposal.status = 'negotiating' 
            # ... (add your negotiation logic here) ...

        db.session.commit()

        return make_response(jsonify({'message': 'Proposal updated successfully'}), 200)



class ProposalsResource(Resource):
    @auth_required('token')
    def get(self):
        user_type = current_user.type  # Get the user type ('influencer' or 'brand')

        if user_type == 'influencer':
            # Fetch proposals for the influencer
            influencer = Influencer.query.filter_by(user_id=current_user.id).first()
            if not influencer:
                return make_response(jsonify({'message': 'Influencer not found'}), 404)
            proposals = Proposal.query.filter_by(influencer_id=influencer.id).all()

        elif user_type == 'brand':
            # Fetch proposals for the brand
            brand = Brand.query.filter_by(user_id=current_user.id).first()
            if not brand:
                return make_response(jsonify({'message': 'Brand not found'}), 404)
            proposals = Proposal.query.join(Campaign).filter(Campaign.brand_id == brand.id).all()

        else:
            return make_response(jsonify({'message': 'Invalid user type'}), 400)

        proposal_list = []
        for proposal in proposals:
            proposal_data = {
                'id': proposal.id,
                'campaign_id': proposal.campaign_id,
                'campaign_title': proposal.campaign.title,  # Include campaign title
                'influencer_id': proposal.influencer_id,
                'influencer_name': proposal.influencer.user.username,  # Include influencer name
                'status': proposal.status,
                'proposal_details': proposal.proposal_details,
                'bid_amount': proposal.bid_amount,
                'proposed_by': proposal.proposed_by
            }
            proposal_list.append(proposal_data)

        return make_response(jsonify({'proposals': proposal_list}), 200)
    




class CampaignProposalsResource(Resource):
    @auth_required('token')
    def get(self, campaign_id):
        # Get the campaign
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return make_response(jsonify({'message': 'Campaign not found'}), 404)

        # Get the proposals associated with the campaign
        proposals = Proposal.query.filter_by(campaign_id=campaign_id).all()

        proposal_list = []
        for proposal in proposals:
            proposal_data = {
                'id': proposal.id,
                'influencer_name': proposal.influencer.user.username,
                'status': proposal.status,
                'proposal_details': proposal.proposal_details,
                'bid_amount': proposal.bid_amount,
                'proposed_by': proposal.proposed_by,
                'campaign_id': campaign_id,
                # ... add other fields as needed
            }
            proposal_list.append(proposal_data)

        # Include campaign budget and name in the response
        response_data = {
            'proposals': proposal_list,
            'campaign_budget': campaign.budget,
            'campaign_title': campaign.title  # Add campaign title
        }

        return make_response(jsonify(response_data), 200)


# In your API setup (e.g., in your app.py or where you define your API endpoints)
api.add_resource(CampaignProposalsResource, '/api/campaigns/<int:campaign_id>/proposals')


# Output fields for ChatMessage (if you want to use marshal_with)
chat_message_fields = {
    'id': fields.Integer,
    'sender_id': fields.Integer,
    'recipient_id': fields.Integer,
    'proposal_id': fields.Integer,
    'message': fields.String,
    'timestamp': fields.DateTime
}



# ... (your imports for auth_required, Influencer, Brand, ChatMessage, db, etc.) ...

chat_message_fields = {
    'id': fields.Integer,
    'message': fields.String,
    'sender_id': fields.Integer,
    'timestamp': fields.DateTime(dt_format='iso8601'),  # Use ISO 8601 format
    # ... other fields ...
}

class ChatMessageResource(Resource):
    @auth_required('token')
    def post(self, campaign_id, proposal_id):
        """
        Send a new chat message for a proposal (with Socket.IO).
        """
        user = current_user

        # Get the proposal to access related data
        proposal = Proposal.query.filter_by(id=proposal_id, campaign_id=campaign_id).first()
        if not proposal:
            return make_response(jsonify({'message': 'Proposal not found'}), 404)

        # Determine if the user is an influencer or a brand
        influencer = Influencer.query.filter_by(user_id=user.id).first()
        brand = Brand.query.filter_by(user_id=user.id).first()

        if not influencer and not brand:
            return make_response(jsonify({'message': 'User not found'}), 404) 

        # Check if the user is authorized to send a message for this proposal
        if (influencer and proposal.influencer_id != influencer.id) and \
           (brand and proposal.campaign.brand_id != brand.id):
            return make_response(jsonify({'message': 'Unauthorized'}), 403)

        data = request.get_json()
        message = data.get('message')

        if not message:
            return make_response(jsonify({'message': 'Message body is required'}), 400)

        # Determine recipient based on sender role
        recipient_id = proposal.campaign.brand.user_id if influencer else proposal.influencer.user_id

        new_message = ChatMessage(
            sender_id=user.id,
            recipient_id=recipient_id,
            proposal_id=proposal_id,
            message=message
        )
        db.session.add(new_message)
        db.session.commit()

        # Use make_response with jsonify:
        return make_response(jsonify({
            'id': new_message.id,
            'sender_id': new_message.sender_id,
            'recipient_id': new_message.recipient_id,
            'proposal_id': new_message.proposal_id,
            'message': new_message.message,
            'timestamp': new_message.timestamp.isoformat()
        }), 201)


    
    @auth_required('token')
    def get(self, campaign_id, proposal_id):
        """
        Fetch all chat messages for a proposal (for WebSocket chat).
        """
        print(f"📨 GET request for chat messages - Campaign: {campaign_id}, Proposal: {proposal_id}")
        
        try:
            user = current_user
            print(f"User: {user.email}")

            # Get the proposal
            proposal = Proposal.query.filter_by(id=proposal_id, campaign_id=campaign_id).first()
            if not proposal:
                print(f"❌ Proposal not found")
                return make_response(jsonify({'message': 'Proposal not found'}), 404)

            # Check authorization
            influencer = Influencer.query.filter_by(user_id=user.id).first()
            brand = Brand.query.filter_by(user_id=user.id).first()

            if not influencer and not brand:
                print("❌ User not found (neither influencer nor brand)")
                return make_response(jsonify({'message': 'User not found'}), 404)

            # Verify user has access to this proposal's chat
            if (influencer and proposal.influencer_id != influencer.id) and \
               (brand and proposal.campaign.brand_id != brand.id):
                print("❌ Unauthorized access to proposal")
                return make_response(jsonify({'message': 'Unauthorized'}), 403)

            # Fetch all messages for this proposal
            messages = ChatMessage.query.filter_by(proposal_id=proposal_id).order_by(ChatMessage.timestamp).all()
            
            print(f"✅ Found {len(messages)} messages")
            
            # Format messages for response
            messages_data = [
                {
                    'id': msg.id,
                    'sender_id': msg.sender_id,
                    'recipient_id': msg.recipient_id,
                    'message': msg.message,
                    'timestamp': msg.timestamp.isoformat(),
                    'read': msg.read if hasattr(msg, 'read') else False,
                    'file_url': msg.file_url if hasattr(msg, 'file_url') else None,
                    'file_name': msg.file_name if hasattr(msg, 'file_name') else None,
                    'file_type': msg.file_type if hasattr(msg, 'file_type') else None,
                    'file_size': msg.file_size if hasattr(msg, 'file_size') else None
                }
                for msg in messages
            ]

            return make_response(jsonify({'messages': messages_data}), 200)
            
        except Exception as e:
            print(f"❌ Error fetching messages: {e}")
            import traceback
            traceback.print_exc()
            return make_response(jsonify({'message': 'Internal Server Error'}), 500)
        



class NicheAPI(Resource):
    def get(self):
        """Get all niches."""
        try:
            niches = Niche.query.all()
            niche_list = [{'id': niche.id, 'name': niche.name} for niche in niches]
            return make_response(jsonify(niche_list), 200) 
        except Exception as e:
            error_message = {'message': 'Error fetching niches'}
            return make_response(jsonify(error_message), 500) 





class BrandProfessionalsAPI(Resource):
    #@roles_required('admin')  # Requires admin role
    def get(self):
        brands = Brand.query.all()
        brand_list = []
        for brand in brands:
            brand_data = {
                'id': brand.id,
                'user_id': brand.user_id,
                'name': brand.name,
                'website': brand.website,
                'contact_email': brand.contact_email,
                'profile_image': brand.profile_image,
                'company_description': brand.company_description,
                'industry': brand.industry,
                'verified': brand.verified,
                'active': brand.user.active,  # Access user's active status directly
                'user': {
                    'id': brand.user.id,
                    'username': brand.user.username,
                    'email': brand.user.email,
                    # Add other user attributes as needed
                }
            }
            brand_list.append(brand_data)
        return jsonify(brand_list)

class InfluencerProfessionalsAPI(Resource):
    #@roles_required('admin')  # Requires admin role
    def get(self):
        influencers = Influencer.query.all()
        influencer_list = []
        for influencer in influencers:
            influencer_data = {
                'id': influencer.id,
                'user_id': influencer.user_id,
                'bio': influencer.bio,
                'niche': influencer.niche,
                'followers': influencer.followers,
                'profile_image': influencer.profile_image,
                'active': influencer.user.active,  # Access user's active status directly
                'user': {
                    'id': influencer.user.id,
                    'username': influencer.user.username,
                    'email': influencer.user.email,
                    # Add other user attributes as needed
                }
            }
            influencer_list.append(influencer_data)
        return jsonify(influencer_list)



class CampaignsAPI(Resource):
    #@cache.cached(timeout=50)
    def get(self):
        """Get all campaigns with details."""
        try:
            campaigns = []
            all_campaigns = Campaign.query.all()
            for campaign in all_campaigns:
                campaigns.append({
                    'id': campaign.id,
                    'title': campaign.title,
                    'brand_name': campaign.brand.name,
                    'description': campaign.description,
                    'start_date': campaign.start_date.strftime('%Y-%m-%d') if campaign.start_date else None,
                    'end_date': campaign.end_date.strftime('%Y-%m-%d') if campaign.end_date else None,
                    'budget': campaign.budget,
                    'status': campaign.status,
                    'campaign_goals': campaign.campaign_goals,
                    'target_audience': campaign.target_audience,
                    'private': campaign.private  # Add the 'private' attribute
                })

            return make_response(jsonify(campaigns), 200)

        except Exception as e:
            error_message = {'message': 'Error fetching campaigns'}
            return make_response(jsonify(error_message), 500)







class ProposalBidResource(Resource):
    def put(self, proposal_id):
        proposal = Proposal.query.get_or_404(proposal_id)
        data = request.get_json()

        if 'bid_amount' in data:
            proposal.bid_amount = data['bid_amount']
            db.session.commit()

            # Create the JSON response manually
            response_data = {
                'id': proposal.id,
                'campaign_id': proposal.campaign_id,
                'influencer_id': proposal.influencer_id,
                'status': proposal.status,
                'proposal_details': proposal.proposal_details,
                'bid_amount': proposal.bid_amount,
                'proposed_by': proposal.proposed_by
            }
            return make_response(jsonify(response_data), 200)  # Use make_response
        else:
            return make_response(jsonify({'error': 'bid_amount is required'}), 400)  # Use make_response

api.add_resource(ProposalBidResource, '/proposals/<int:proposal_id>/bid')








api.add_resource(CampaignsAPI, '/api/admin/campaigns')






api.add_resource(BrandProfessionalsAPI, '/api/admin/brand_professionals')
api.add_resource(InfluencerProfessionalsAPI, '/api/admin/influencer_professionals')











api.add_resource(NicheAPI, '/api/niches')   
'''
@socketio.on('join')
@auth_required('token')
def on_join(data):
    
    """
    Handles a user joining a chat room.
    """
    user = current_user
    proposal_id = data['proposal_id']

    # Get the influencer and brand related to the proposal
    proposal = Proposal.query.get(proposal_id)
    if not proposal:
        emit('error', {'message': 'Proposal not found'})
        return

    influencer = proposal.influencer
    brand = proposal.campaign.brand

    # Check if the user is authorized to join the room
    # (i.e., if they are the influencer or the brand for this proposal)
    if (influencer and influencer.user_id != user.id) and (brand and brand.user_id != user.id):
        emit('error', {'message': 'Unauthorized to join this room'})
        return

    room_name = f'proposal_{proposal_id}'
    join_room(room_name)
    emit('joined', {'message': f'User {user.id} joined room {room_name}'}, room=room_name)

@socketio.on('leave')
@auth_required('token')
def on_leave(data):
    """
    Handles a user leaving a chat room.
    """
    user = current_user
    proposal_id = data['proposal_id']

    # Get the influencer and brand related to the proposal
    proposal = Proposal.query.get(proposal_id)
    if not proposal:
        emit('error', {'message': 'Proposal not found'})
        return

    influencer = proposal.influencer
    brand = proposal.campaign.brand


    # Check if the user is authorized to leave the room
    # (i.e., if they are the influencer or the brand for this proposal)
    if (influencer and influencer.user_id != user.id) and (brand and brand.user_id != user.id):
        emit('error', {'message': 'Unauthorized to leave this room'})
        return

    room_name = f'proposal_{proposal_id}'
    leave_room(room_name)
    emit('left', {'message': f'User {user.id} left room {room_name}'}, room=room_name)
'''




class VerifyBrand(Resource):
    # @roles_required('admin')
    def post(self, brand_id):
        brand = Brand.query.get_or_404(brand_id)
        brand.verified = True
        db.session.commit()
        
        response_data = {'message': 'Brand verified successfully'}
        response = make_response(jsonify(response_data), 200)
        return response

class DeactivateUser(Resource):
    # @roles_required('admin')  # Only admin can deactivate users
    def post(self, user_id):
        user = User.query.get_or_404(user_id)
        user.active = False 
        db.session.commit()

        response_data = {'message': f'User {user.username} deactivated'}
        response = make_response(jsonify(response_data), 200)
        return response




class ActivateUser(Resource):
    # @roles_required('admin')
    def post(self, user_id):
        user = User.query.get_or_404(user_id)
        user.active = True
        db.session.commit()

        response_data = {'message': f'User {user.username} activated'}
        response = make_response(jsonify(response_data), 200)
        return response



class CampaignResourcePrivate(Resource):
    # @roles_required('admin')
    def put(self, campaign_id):
        campaign = Campaign.query.get_or_404(campaign_id)
        data = request.get_json()
        campaign.private = data.get('private', campaign.private)  # Update 'private' if provided, otherwise keep the same
        db.session.commit()
        response = make_response(jsonify({'message': 'Campaign updated successfully'}), 200)
        return response


class CsvCreate(Resource):
    def post(self):
        """Trigger the CSV creation task."""
        try:
            task = create_resource_csv.delay()
            response = make_response(jsonify({'task_id': task.id}), 202)
            return response

        except Exception as e:
            logging.error(f"Error triggering CSV creation task: {e}")
            response = make_response(jsonify({'message': 'Failed to trigger CSV creation'}), 500)
            return response


class CsvDownload(Resource):
    def get(self, task_id):
        """
        Get the status of the CSV download task or download the CSV file if ready.
        """
        try:
            res = AsyncResult(task_id)

            if res.state == 'PENDING':
                response = make_response(jsonify({'message': 'Task is pending'}), 202)
                return response
            elif res.state == 'FAILURE':
                response = make_response(jsonify({'message': 'Task failed'}), 500)
                return response
            elif res.state == 'SUCCESS':
                filename = res.result
                if filename:
                    # Construct the full file path using the custom directory
                    csv_files_dir = 'csv_files' 
                    filepath = safe_join(csv_files_dir, filename)  # Use safe_join

                    if os.path.exists(filepath):
                        response = make_response(send_file(filepath, as_attachment=True))
                        return response
                    else:
                        response = make_response(jsonify({'message': 'File not found'}), 404)
                        return response
                else:
                    response = make_response(jsonify({'message': 'Task did not return a filename'}), 500)
                    return response
            else:
                response = make_response(jsonify({'message': 'Task status unknown'}), 202)
                return response

        except Exception as e:
            logging.error(f"Error in CsvDownload route: {e}")
            response = make_response(jsonify({'message': 'Internal server error'}), 500)
            return response
# Add the resources to the API

api.add_resource(CsvCreate, '/api/csv')
api.add_resource(CsvDownload, '/api/csv/<string:task_id>')

api.add_resource(CampaignResourcePrivate, '/api/admin/campaigns/<int:campaign_id>')


api.add_resource(ActivateUser, '/api/admin/activate_user/<int:user_id>')

api.add_resource(DeactivateUser, '/api/admin/deactivate_user/<int:user_id>')

api.add_resource(VerifyBrand, '/api/admin/verify_brand/<int:brand_id>')
api.add_resource(ChatMessageResource, '/api/campaigns/<int:campaign_id>/proposals/<int:proposal_id>/chat','/api/campaigns/<int:campaign_id>/proposals/<int:proposal_id>/chat/stream')







api.add_resource(ProposalResourceUpdate, '/api/campaigns/<int:campaign_id>/proposals/<int:proposal_id>')

api.add_resource(ProposalResource, '/api/campaigns/<int:campaign_id>/proposals')  # For influencers
api.add_resource(BrandProposalResource, '/api/campaigns/<int:campaign_id>/influencers/<int:influencer_id>/proposals')  # For brands
api.add_resource(CampaignResource, '/api/campaigns/<int:campaign_id>')

api.add_resource(CreateCampaign, '/api/campaigns')

# Password Reset Resources
class ForgotPasswordResource(Resource):
    def post(self):
        try:
            data = request.get_json()
            email = data.get('email')
            
            if not email:
                return {'message': 'Email is required'}, 400
            
            user = User.query.filter_by(email=email).first()
            
            # Always return success to prevent email enumeration
            if not user:
                return {'message': 'If this email exists, a reset link will be sent'}, 200
            
            # Generate reset token
            reset_token = secrets.token_urlsafe(32)
            reset_expires = datetime.utcnow() + timedelta(hours=1)
            
            # Store token (you might want to add reset_token and reset_expires columns to User model)
            # For now, we'll store in fs_uniquifier temporarily (NOT PRODUCTION READY)
            user.fs_uniquifier = f"reset_{reset_token}_{reset_expires.timestamp()}"
            db.session.commit()
            
            # TODO: Send email with reset link
            # For now, we'll just print the link (development only)
            reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
            print(f"Password reset link for {email}: {reset_link}")
            
            return {'message': 'Password reset link sent to your email'}, 200
            
        except Exception as e:
            print(f"Error in forgot password: {str(e)}")
            return {'message': 'An error occurred'}, 500


class VerifyResetTokenResource(Resource):
    def get(self):
        try:
            token = request.args.get('token')
            
            if not token:
                return {'message': 'Token is required'}, 400
            
            # Find user with this token
            users = User.query.all()
            for user in users:
                if user.fs_uniquifier and user.fs_uniquifier.startswith(f'reset_{token}_'):
                    # Extract expiration from fs_uniquifier
                    try:
                        expires_timestamp = float(user.fs_uniquifier.split('_')[2])
                        expires_datetime = datetime.fromtimestamp(expires_timestamp)
                        
                        if datetime.utcnow() > expires_datetime:
                            return {'message': 'Token has expired'}, 400
                        
                        return {'message': 'Token is valid'}, 200
                    except:
                        return {'message': 'Invalid token'}, 400
            
            return {'message': 'Invalid token'}, 400
            
        except Exception as e:
            print(f"Error verifying token: {str(e)}")
            return {'message': 'An error occurred'}, 500


class ResetPasswordResource(Resource):
    def post(self):
        try:
            data = request.get_json()
            token = data.get('token')
            new_password = data.get('password')
            
            if not token or not new_password:
                return {'message': 'Token and password are required'}, 400
            
            # Find user with this token
            users = User.query.all()
            for user in users:
                if user.fs_uniquifier and user.fs_uniquifier.startswith(f'reset_{token}_'):
                    # Extract expiration
                    try:
                        expires_timestamp = float(user.fs_uniquifier.split('_')[2])
                        expires_datetime = datetime.fromtimestamp(expires_timestamp)
                        
                        if datetime.utcnow() > expires_datetime:
                            return {'message': 'Token has expired'}, 400
                        
                        # Reset password
                        user.password = hash_password(new_password)
                        # Clear the reset token
                        user.fs_uniquifier = secrets.token_urlsafe(16)
                        db.session.commit()
                        
                        return {'message': 'Password reset successful'}, 200
                    except Exception as e:
                        print(f"Error parsing token: {str(e)}")
                        return {'message': 'Invalid token'}, 400
            
            return {'message': 'Invalid token'}, 400
            
        except Exception as e:
            print(f"Error resetting password: {str(e)}")
            return {'message': 'An error occurred'}, 500


class ChatFileUploadResource(Resource):
    def post(self):
        """Handle file uploads for chat"""
        try:
            if 'file' not in request.files:
                return {'message': 'No file provided'}, 400
            
            file = request.files['file']
            if file.filename == '':
                return {'message': 'No file selected'}, 400
            
            # Extended allowed file types for chat
            CHAT_ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx', 'txt', 'zip'}
            
            def allowed_chat_file(filename):
                return '.' in filename and filename.rsplit('.', 1)[1].lower() in CHAT_ALLOWED_EXTENSIONS
            
            if not allowed_chat_file(file.filename):
                return {'message': 'File type not allowed'}, 400
            
            # Check file size (max 10MB)
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)  # Reset file pointer
            
            if file_size > 10 * 1024 * 1024:  # 10MB
                return {'message': 'File too large. Maximum size is 10MB'}, 400
            
            # Generate unique filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            original_name = secure_filename(file.filename)
            file_extension = original_name.rsplit('.', 1)[1].lower()
            unique_filename = f"chat_{timestamp}_{secrets.token_hex(8)}.{file_extension}"
            
            # Create chat uploads directory if it doesn't exist
            from main import app
            chat_upload_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'chat')
            if not os.path.exists(chat_upload_dir):
                os.makedirs(chat_upload_dir)
            
            # Save file
            filepath = os.path.join(chat_upload_dir, unique_filename)
            file.save(filepath)
            
            # Determine file type
            file_type = 'document'
            if file_extension in ['png', 'jpg', 'jpeg', 'gif']:
                file_type = 'image'
            elif file_extension == 'pdf':
                file_type = 'pdf'
            
            # Return file info
            file_url = f"/uploads/chat/{unique_filename}"
            
            return {
                'file_url': file_url,
                'file_name': original_name,
                'file_type': file_type,
                'file_size': file_size
            }, 200
            
        except Exception as e:
            print(f"Error uploading file: {str(e)}")
            import traceback
            traceback.print_exc()
            return {'message': f'File upload failed: {str(e)}'}, 500


api.add_resource(InfluencerCampaignResource, '/influencer-campaigns') 
api.add_resource(InfluencerLogin, '/api/login/influencer')
api.add_resource(BrandLogin, '/api/login/brand')
api.add_resource(AdminLogin, '/api/login/admin')
api.add_resource(UserDetails, '/api/user') 
api.add_resource(InfluencerRegistration, '/api/register/influencer',methods=['GET', 'POST', 'OPTIONS', 'HEAD'])
api.add_resource(BrandRegistration, '/api/register/brand',methods=['GET', 'POST', 'OPTIONS', 'HEAD'])
api.add_resource(ProposalsResource, '/api/proposals')
api.add_resource(ForgotPasswordResource, '/api/auth/forgot-password')
api.add_resource(VerifyResetTokenResource, '/api/auth/verify-reset-token')
api.add_resource(ResetPasswordResource, '/api/auth/reset-password')
api.add_resource(ChatFileUploadResource, '/api/chat/upload')