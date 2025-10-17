from flask import Flask, send_from_directory, render_template
from flask_security import Security
from flask_login import LoginManager
from flask_cors import CORS
import secrets
from flask_sqlalchemy import SQLAlchemy
import os
from flask_restful import Api
from worker import celery_init_app
from tasks import monthly_reminder, daily_reminder
from flask_socketio import SocketIO
import pytz

# Initialize SQLAlchemy
db = SQLAlchemy()
from resources import api
# Import models and resources
from models import *
from datastorefile import datastore
from sample_data import initialize_sample_data

def create_app():
    app = Flask(__name__)

    login_manager = LoginManager(app)
    login_manager.login_view = 'login'  # Specify the login view

    # User loader function for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Flask configuration  
    # Use environment variable for database URL, fallback to SQLite for development
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///appdb.sqlite3')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(16))
    app.config['SECURITY_PASSWORD_SALT'] = os.getenv('SECURITY_PASSWORD_SALT', 'dev-salt-change-in-production')
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config['WTF_CSRF_ENABLED'] = False
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads/')  # For image uploads
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit

    # Ensure the upload folder exists
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    # CORS configuration for React frontend
    CORS(app, resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",  # React development server
                "http://localhost:8080",  # Vue development server (legacy)
                "http://127.0.0.1:3000",  # Alternative React URL
                "http://127.0.0.1:8080",   # Alternative Vue URL
                "https://inspap.vercel.app"  # Vercel deployed frontend
            ],
            "supports_credentials": True,
            "allow_headers": ["Content-Type", "Authorization", "Authentication-Token"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
        }
    })

    # Initialize components
    db.init_app(app)
    api.init_app(app)
    app.security = Security(app, datastore)

    # Route to serve uploaded files
    @app.route('/uploads/<path:filename>')
    def download_file(filename):
        filename = filename.replace('uploads/images/', '')
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # React frontend will be served by Vercel separately
    # Only serve API endpoints from Flask backend
    @app.route('/')
    def api_info():
        return {"message": "Influencer-Sponsor API Backend", "status": "running"}

    return app

# Create Flask app instance
app = create_app()
celery_app = celery_init_app(app)

# Initialize Socket.IO with the app
socketio = SocketIO(app, 
    cors_allowed_origins="*",  # Allow all origins for development
    async_mode='eventlet',  # Use eventlet for better performance
    logger=False,
    engineio_logger=False
)

@celery_app.on_after_configure.connect
def celery_job(sender, **kwargs):
    # for testing
    sender.add_periodic_task(60, monthly_reminder.s())
    sender.add_periodic_task(40, daily_reminder.s())

# Socket.IO event handlers
from flask_socketio import join_room, leave_room, emit

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('connected', {'message': 'Successfully connected to chat server'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected')

@socketio.on('join_chat')
def handle_join_chat(data):
    """Join a chat room for a specific proposal"""
    campaign_id = data.get('campaign_id')
    proposal_id = data.get('proposal_id')
    room = f'chat_{campaign_id}_{proposal_id}'
    join_room(room)
    print(f'User joined room: {room}')
    emit('joined_chat', {'room': room, 'message': 'Joined chat successfully'}, room=room)

@socketio.on('leave_chat')
def handle_leave_chat(data):
    """Leave a chat room"""
    campaign_id = data.get('campaign_id')
    proposal_id = data.get('proposal_id')
    room = f'chat_{campaign_id}_{proposal_id}'
    leave_room(room)
    print(f'User left room: {room}')
    emit('left_chat', {'room': room}, room=room)

@socketio.on('typing')
def handle_typing(data):
    """Handle typing indicator"""
    campaign_id = data.get('campaign_id')
    proposal_id = data.get('proposal_id')
    user_id = data.get('user_id')
    is_typing = data.get('is_typing', False)
    
    room = f'chat_{campaign_id}_{proposal_id}'
    emit('user_typing', {
        'user_id': user_id,
        'is_typing': is_typing
    }, room=room, include_self=False)

@socketio.on('mark_read')
def handle_mark_read(data):
    """Mark messages as read"""
    try:
        message_ids = data.get('message_ids', [])
        user_id = data.get('user_id')
        
        from models import ChatMessage
        
        # Mark messages as read
        messages = ChatMessage.query.filter(
            ChatMessage.id.in_(message_ids),
            ChatMessage.recipient_id == user_id,
            ChatMessage.read == False
        ).all()
        
        for message in messages:
            message.read = True
        
        db.session.commit()
        
        # Notify sender about read receipts
        if messages:
            campaign_id = data.get('campaign_id')
            proposal_id = data.get('proposal_id')
            room = f'chat_{campaign_id}_{proposal_id}'
            emit('messages_read', {
                'message_ids': message_ids,
                'read_by': user_id
            }, room=room)
        
    except Exception as e:
        print(f'❌ Error marking messages as read: {e}')
        import traceback
        traceback.print_exc()

@socketio.on('send_message')
def handle_send_message(data):
    """Handle incoming chat messages"""
    campaign_id = data.get('campaign_id')
    proposal_id = data.get('proposal_id')
    message = data.get('message')
    sender_id = data.get('sender_id')
    file_url = data.get('file_url')
    file_name = data.get('file_name')
    file_type = data.get('file_type')
    file_size = data.get('file_size')
    
    room = f'chat_{campaign_id}_{proposal_id}'
    
    # Save message to database
    try:
        from models import ChatMessage, Proposal, Influencer, Brand, User
        
        # Get the proposal
        proposal = Proposal.query.filter_by(id=proposal_id, campaign_id=campaign_id).first()
        if not proposal:
            emit('error', {'message': 'Proposal not found'})
            return
        
        # Get sender user
        sender = User.query.get(sender_id)
        if not sender:
            emit('error', {'message': 'Sender not found'})
            return
        
        # Determine if sender is influencer or brand
        influencer = Influencer.query.filter_by(user_id=sender_id).first()
        brand = Brand.query.filter_by(user_id=sender_id).first()
        
        if not influencer and not brand:
            emit('error', {'message': 'User not found'})
            return
        
        # Determine recipient based on sender role
        # If sender is influencer, recipient is the brand
        # If sender is brand, recipient is the influencer
        if influencer:
            recipient_id = proposal.campaign.brand.user_id
        else:
            recipient_id = proposal.influencer.user_id
        
        # Create and save message
        ist = pytz.timezone('Asia/Kolkata')
        new_message = ChatMessage(
            proposal_id=proposal_id,
            sender_id=sender_id,
            recipient_id=recipient_id,
            message=message,
            timestamp=datetime.now(ist),
            file_url=file_url,
            file_name=file_name,
            file_type=file_type,
            file_size=file_size
        )
        db.session.add(new_message)
        db.session.commit()
        
        print(f'✅ Message saved: ID={new_message.id}, From={sender_id}, To={recipient_id}, Proposal={proposal_id}')
        
        # Broadcast to room
        message_data = {
            'id': new_message.id,
            'sender_id': sender_id,
            'recipient_id': recipient_id,
            'message': message,
            'timestamp': new_message.timestamp.isoformat(),
            'read': False,
            'file_url': file_url,
            'file_name': file_name,
            'file_type': file_type,
            'file_size': file_size
        }
        emit('new_message', message_data, room=room)
        
    except Exception as e:
        print(f'❌ Error saving message: {e}')
        import traceback
        traceback.print_exc()
        emit('error', {'message': f'Failed to send message: {str(e)}'})

# Run the Flask app with Socket.IO
if __name__ == '__main__':
    initialize_sample_data()
    # Use PORT environment variable for Render deployment
    port = int(os.getenv('PORT', 5000))
    socketio.run(app, debug=False, host='0.0.0.0', port=port)