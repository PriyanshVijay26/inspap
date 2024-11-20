from datetime import datetime
from werkzeug.security import generate_password_hash
from flask_sqlalchemy import SQLAlchemy
from flask_security.utils import hash_password, verify_password

import secrets

# Import models
from models import User, Role, Influencer, Brand, Campaign, Proposal, ChatMessage,Niche, db

def initialize_sample_data():
    from main import app  # Import your Flask app instance
    with app.app_context():
        # Create all tables
        db.create_all()

        # Add roles if they don't exist
        influencer_role = Role.query.filter_by(name='influencer').first()
        if not influencer_role:
            influencer_role = Role(name='influencer', description='Influencer Role')
            db.session.add(influencer_role)

        brand_role = Role.query.filter_by(name='brand').first()
        if not brand_role:
            brand_role = Role(name='brand', description='Brand Role')
            db.session.add(brand_role)

        admin_role = Role.query.filter_by(name='admin').first()
        if not admin_role:
            admin_role = Role(name='admin', description='Admin Role')
            db.session.add(admin_role)

        # Add users
        influencer_user = User.query.filter_by(username='influencer1').first()
        if not influencer_user:
            influencer_user = User(
                username='influencer1',
                email='influencer1@example.com',
                password=hash_password('password'),
                type='influencer',
                active=True,
                fs_uniquifier=secrets.token_urlsafe(16)
            )
            influencer_user.roles.append(influencer_role)
            db.session.add(influencer_user)

        brand_user = User.query.filter_by(username='brand1').first()
        if not brand_user:
            brand_user = User(
                username='brand1',
                email='brand1@example.com',
                password=hash_password('password'),
                type='brand',
                active=True,
                fs_uniquifier=secrets.token_urlsafe(16)
            )
            brand_user.roles.append(brand_role)
            db.session.add(brand_user)

        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            admin_user = User(
                username='admin',
                email='admin@example.com',
                password=hash_password('adminpassword'),
                type='admin',
                active=True,
                fs_uniquifier=secrets.token_urlsafe(16)
            )
            admin_user.roles.append(admin_role)
            db.session.add(admin_user)

        # Add influencer details
        influencer1 = Influencer.query.filter_by(user=influencer_user).first()
        if not influencer1:
            influencer1 = Influencer(
                user=influencer_user,
                bio='Sample bio for influencer 1',
                niche='Technology',
                followers=10000,
                date_of_birth=datetime(1990, 5, 15),
                facebook_link='https://facebook.com/influencer1',
                instagram_link='https://instagram.com/influencer1',
                twitter_link='https://twitter.com/influencer1'
            )
            db.session.add(influencer1)

        # Add brand details
        brand1 = Brand.query.filter_by(user=brand_user).first()
        if not brand1:
            brand1 = Brand(
                user=brand_user,
                name='Brand 1',
                website='https://www.brand1.com',
                contact_email='contact@brand1.com',
                company_description='Sample description for Brand 1',
                industry='Technology'
            )
            db.session.add(brand1)

        # Add a campaign
        campaign1 = Campaign.query.filter_by(title='Campaign 1').first()
        if not campaign1:
            campaign1 = Campaign(
                brand=brand1,
                title='Campaign 1',
                description='Sample campaign description',
                start_date=datetime(2024, 10, 1),
                end_date=datetime(2024, 10, 31),
                budget=1000.0,
                status='open'
            )
            db.session.add(campaign1)

        # Add a proposal
        proposal1 = Proposal.query.filter_by(campaign=campaign1, influencer=influencer1).first()
        if not proposal1:
            proposal1 = Proposal(
                campaign=campaign1,
                influencer=influencer1,
                status='pending',
                proposal_details='Sample proposal details',
                bid_amount=500.0
            )
            db.session.add(proposal1)

        # Add chat messages
        chat_message1 = ChatMessage.query.filter_by(proposal=proposal1, message='Hello from brand!').first()
        if not chat_message1:
            chat_message1 = ChatMessage(
                sender=brand_user,
                recipient=influencer_user,
                proposal=proposal1,
                message='Hello from brand!',
                timestamp=datetime.utcnow()
            )
            db.session.add(chat_message1)

        chat_message2 = ChatMessage.query.filter_by(proposal=proposal1, message='Hi brand, thanks for reaching out!').first()
        if not chat_message2:
            chat_message2 = ChatMessage(
                sender=influencer_user,
                recipient=brand_user,
                proposal=proposal1,
                message='Hi brand, thanks for reaching out!',
                timestamp=datetime.utcnow()
            )
            db.session.add(chat_message2)

        niches = [
            "Technology", 
            "Beauty", 
            "Gaming", 
            "Travel", 
            "Food", 
            "Fitness"
        ]

        for niche_name in niches:
            existing_niche = Niche.query.filter_by(name=niche_name).first()
            if not existing_niche:
                new_niche = Niche(name=niche_name)
                db.session.add(new_niche)
        # Commit the session to save all changes
        db.session.commit()
        print("Sample data added successfully.")

if __name__ == '__main__':
    initialize_sample_data()
