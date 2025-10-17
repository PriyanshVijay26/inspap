import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { authenticatedFetch } from '../utils/api';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [proposalDetails, setProposalDetails] = useState(null);
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { campaignId, proposalId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      setIsConnected(true);
      setErrorMessage('');
      
      // Join the chat room for this proposal
      socketRef.current.emit('join_chat', {
        campaign_id: campaignId,
        proposal_id: proposalId
      });
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setErrorMessage('Failed to connect to chat server. Retrying...');
    });

    socketRef.current.on('connected', (data) => {
      console.log('Server says:', data.message);
    });

    socketRef.current.on('joined_chat', (data) => {
      console.log('Joined chat room:', data.room);
    });

    socketRef.current.on('new_message', (messageData) => {
      console.log('New message received:', messageData);
      setMessages(prev => [...prev, messageData]);
      
      // Mark as read if I'm the recipient
      if (messageData.recipient_id === currentUser?.id) {
        setTimeout(() => {
          markMessagesAsRead([messageData.id]);
        }, 1000);
      }
    });

    socketRef.current.on('user_typing', (data) => {
      if (data.user_id !== currentUser?.id) {
        setIsTyping(data.is_typing);
        if (data.is_typing) {
          // Auto-hide typing indicator after 3 seconds
          setTimeout(() => setIsTyping(false), 3000);
        }
      }
    });

    socketRef.current.on('messages_read', (data) => {
      const { message_ids } = data;
      setMessages(prev => prev.map(msg => 
        message_ids.includes(msg.id) ? { ...msg, read: true } : msg
      ));
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
      setErrorMessage(error.message || 'An error occurred');
    });

    // Fetch initial data
    fetchChatData();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_chat', {
          campaign_id: campaignId,
          proposal_id: proposalId
        });
        socketRef.current.disconnect();
      }
    };
  }, [campaignId, proposalId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatData = async () => {
    try {
      // Get current user info
      const userResponse = await authenticatedFetch('/user');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setCurrentUser(userData);
      }

      // Get campaign details
      const campaignResponse = await authenticatedFetch(`/campaigns/${campaignId}`);
      if (campaignResponse.ok) {
        const campaignData = await campaignResponse.json();
        setCampaignDetails(campaignData);
      }

      // Get proposal details and messages
      const proposalResponse = await authenticatedFetch(`/campaigns/${campaignId}/proposals`);
      if (proposalResponse.ok) {
        const proposalData = await proposalResponse.json();
        const proposal = proposalData.proposals?.find(p => p.id === parseInt(proposalId));
        setProposalDetails(proposal);
      }

      // Fetch existing messages
      const messagesResponse = await authenticatedFetch(`/campaigns/${campaignId}/proposals/${proposalId}/chat`);
      if (messagesResponse.ok) {
        const data = await messagesResponse.json();
        setMessages(data.messages || data || []);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading chat data:', error);
      setErrorMessage('Error loading chat data');
      setIsLoading(false);
    }
  };

  const markMessagesAsRead = (messageIds) => {
    if (socketRef.current && isConnected && messageIds.length > 0) {
      socketRef.current.emit('mark_read', {
        message_ids: messageIds,
        user_id: currentUser?.id,
        campaign_id: campaignId,
        proposal_id: proposalId
      });
    }
  };

  const handleTyping = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', {
        campaign_id: campaignId,
        proposal_id: proposalId,
        user_id: currentUser?.id,
        is_typing: true
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing', {
          campaign_id: campaignId,
          proposal_id: proposalId,
          user_id: currentUser?.id,
          is_typing: false
        });
      }, 2000);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File too large. Maximum size is 10MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return null;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await authenticatedFetch('/chat/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('File upload error:', error);
      setErrorMessage('Failed to upload file');
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedFile) || !socketRef.current || !isConnected) {
      return;
    }

    if (!currentUser?.id) {
      setErrorMessage('User not authenticated');
      return;
    }

    let fileData = null;
    if (selectedFile) {
      fileData = await uploadFile();
      if (!fileData) {
        return; // Upload failed
      }
    }

    // Send message via WebSocket
    socketRef.current.emit('send_message', {
      campaign_id: campaignId,
      proposal_id: proposalId,
      message: newMessage.trim() || null,
      sender_id: currentUser.id,
      file_url: fileData?.file_url,
      file_name: fileData?.file_name,
      file_type: fileData?.file_type,
      file_size: fileData?.file_size
    });

    setNewMessage('');
    clearFileSelection();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'image') return 'fa-image';
    if (fileType === 'pdf') return 'fa-file-pdf';
    return 'fa-file';
  };

  const isMyMessage = (message) => {
    return message.sender_id === currentUser?.id;
  };

  const renderFileAttachment = (message) => {
    if (!message.file_url) return null;

    if (message.file_type === 'image') {
      return (
        <div className="message-image">
          <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${message.file_url}`} target="_blank" rel="noopener noreferrer">
            <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${message.file_url}`} alt={message.file_name} />
          </a>
          <div className="file-info">
            <span className="file-name">{message.file_name}</span>
            <span className="file-size">{formatFileSize(message.file_size)}</span>
          </div>
        </div>
      );
    }

    return (
      <a 
        href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${message.file_url}`} 
        className="file-attachment" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <i className={`fas ${getFileIcon(message.file_type)}`}></i>
        <div className="file-details">
          <span className="file-name">{message.file_name}</span>
          <span className="file-size">{formatFileSize(message.file_size)}</span>
        </div>
        <i className="fas fa-download"></i>
      </a>
    );
  };

  if (isLoading) {
    return (
      <div className="chat-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <i className="fas fa-arrow-left"></i>
          Back
        </button>
        <div className="chat-info">
          <div className="chat-title-row">
            <h2>
              <i className="fas fa-comments"></i>
              Negotiation Chat
            </h2>
            <div className="connection-status">
              {isConnected ? (
                <span className="status-online">
                  <i className="fas fa-circle"></i> Online
                </span>
              ) : (
                <span className="status-offline">
                  <i className="fas fa-circle"></i> Offline
                </span>
              )}
            </div>
          </div>
          <div className="chat-details">
            <p><strong>Campaign:</strong> {campaignDetails?.title}</p>
            <p><strong>Bid:</strong> ${proposalDetails?.bid_amount}</p>
            <p><strong>Status:</strong> 
              <span className={`status-badge status-${proposalDetails?.status}`}>
                {proposalDetails?.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div 
              key={message.id || index} 
              className={`message ${isMyMessage(message) ? 'message-sent' : 'message-received'}`}
            >
              <div className="message-content">
                {message.message && <p>{message.message}</p>}
                {renderFileAttachment(message)}
                <div className="message-footer">
                  <small className="message-time">
                    {formatTimestamp(message.timestamp)}
                  </small>
                  {isMyMessage(message) && (
                    <span className="read-receipt">
                      {message.read ? (
                        <i className="fas fa-check-double" title="Read"></i>
                      ) : (
                        <i className="fas fa-check" title="Sent"></i>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages">
            <i className="fas fa-comment-slash"></i>
            <p>No messages yet. Start the conversation!</p>
            <small>Messages will appear here in real-time</small>
          </div>
        )}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <small>typing...</small>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {selectedFile && (
        <div className="file-preview-container">
          <div className="file-preview">
            {filePreview ? (
              <img src={filePreview} alt="Preview" />
            ) : (
              <div className="file-preview-icon">
                <i className={`fas ${getFileIcon(selectedFile.type.startsWith('image/') ? 'image' : selectedFile.name.endsWith('.pdf') ? 'pdf' : 'document')}`}></i>
              </div>
            )}
            <div className="file-preview-info">
              <span className="file-preview-name">{selectedFile.name}</span>
              <span className="file-preview-size">{formatFileSize(selectedFile.size)}</span>
            </div>
            <button 
              type="button" 
              className="remove-file-btn" 
              onClick={clearFileSelection}
              disabled={uploadingFile}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          style={{ display: 'none' }}
        />
        <div className="chat-input-container">
          <button
            type="button"
            className="attach-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected || uploadingFile}
            title="Attach file"
          >
            <i className="fas fa-paperclip"></i>
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            className="chat-input"
            disabled={!isConnected || uploadingFile}
          />
          <button 
            type="submit" 
            className="send-button" 
            disabled={(!newMessage.trim() && !selectedFile) || !isConnected || uploadingFile}
          >
            {uploadingFile ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className="error-toast">
          <i className="fas fa-exclamation-circle"></i>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Chat;
