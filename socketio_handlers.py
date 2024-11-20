from main import socketio, auth_required, current_user  # Import necessary objects
from models import Proposal  # Im
from flask_socketio import emit, join_room, leave_room

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

    #@auth_required('token')
    #@auth_required('token')
    def get(self, campaign_id, proposal_id):
        """
        Get chat messages for a proposal using Server-Sent Events (SSE).
        """
        
        
        #token = request.args.get('auth_token')
        #print(token) 
        #print(current_user.get_auth_token())

        #if not token or token != current_user.get_auth_token():
#            return make_response(jsonify({'message': 'Invalid authentication token!'}), 401)

        # Get the proposal to access related data
        proposal = Proposal.query.filter_by(id=proposal_id, campaign_id=campaign_id).first()
        if not proposal:
            return make_response(jsonify({'message': 'Proposal not found'}), 404)

        # Determine if the user is an influencer or a brand
        #influencer = Influencer.query.filter_by(user_id=user.id).first()
        #brand = Brand.query.filter_by(user_id=user.id).first()

        #if not influencer and not brand:
         #   return make_response(jsonify({'message': 'User not found'}), 404)

        # Check if the user is authorized to access messages for this proposal
        #if (influencer and proposal.influencer_id != influencer.id) and \
        #   (brand and proposal.campaign.brand_id != brand.id):
         #   return make_response(jsonify({'message': 'Unauthorized'}), 403)
#
        @stream_with_context
        def event_stream():
            last_message_id = None
            while True:
                messages = ChatMessage.query.filter(
                    ChatMessage.proposal_id == proposal_id,
                    ChatMessage.id > last_message_id if last_message_id else True
                ).order_by(ChatMessage.timestamp).all()

                if messages:
                    last_message_id = messages[-1].id
                    for message in messages:
                        message_data = marshal_with(chat_message_fields)(message)
                        event_str = (
                            "event: new_message\n"
                            f"id: {message_data['id']}\n"
                            f"data: {json.dumps(message_data)}\n\n"
                        )
                        yield event_str
                yield ": keep-alive\n\n"
                time.sleep(5)

        response = Response(event_stream(), mimetype="text/event-stream")
        response.headers["Cache-Control"] = "no-cache"
        response.headers["Connection"] = "keep-alive"
        response.headers["Access-Control-Allow-Credentials"] = "true"  
        return response
    

'''