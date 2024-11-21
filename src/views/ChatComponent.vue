<template>
  <div class="modal-overlay" @click.self="$emit('close-chat')">
    <div class="chat-container">
      <div class="chat-header">
        <h3>Negotiation Chat</h3>
        <button @click="$emit('close-chat')">Close</button>
      </div>
      <div class="chat-messages" ref="chatMessages">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message', message.sender_id === currentUserId ? 'my-message' : 'received-message']"
        >
          <div class="message-content">
            {{ message.content }}
          </div>
          <small v-if="isValidDate(message.timestamp)" class="message-timestamp">
            {{ convertToIST(message.timestamp) }}
          </small>
        </div>
      </div>
      <div class="chat-input">
        <input type="text" v-model="newMessage" @keyup.enter="sendMessage" />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['proposal'],
  data() {
    return {
      newMessage: '',
      messages: [],
      currentUserId: null,
      token: localStorage.getItem('auth_token'),
      eventSource: null,
    };
  },
  async mounted() {
    this.token = localStorage.getItem('auth_token');
    this.currentUserId = await this.getCurrentUserId();
    this.setupEventSource(); // Set up SSE stream
  },
  beforeUnmount() {
    if (this.eventSource) {
      this.eventSource.close(); // Close SSE connection on unmount
    }
  },
  methods: {
    async getCurrentUserId() {
      try {
        const response = await fetch('http://localhost:5000/api/user', {
          headers: {
            'Authentication-token': this.token,
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.id;
      } catch (error) {
        console.error('Error fetching user ID:', error);
        return null;
      }
    },
    setupEventSource() {
      const token = this.token;
      const url = `http://localhost:5000/api/campaigns/${this.proposal.campaign_id}/proposals/${this.proposal.id}/chat/stream?auth_token=${token}`;

      this.eventSource = new EventSource(url);

      this.eventSource.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        this.messages.push(messageData);
        this.scrollToBottom(); // Append new message to messages array
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        this.eventSource.close();
      };
    },
    sendMessage() {
      if (this.newMessage.trim() !== '') {
        fetch(
          `http://localhost:5000/api/campaigns/${this.proposal.campaign_id}/proposals/${this.proposal.id}/chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-token': this.token,
            },
            body: JSON.stringify({
              message: this.newMessage,
            }),
          }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            this.newMessage = ''; // Clear input field after sending
          })
          .catch((error) => {
            console.error('Error sending message:', error);
          });
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatMessagesContainer = this.$refs.chatMessages;
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
      });
    },
    isValidDate(dateString) {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    },
    convertToIST(dateString) {
      const utcDate = new Date(dateString);
      if (isNaN(utcDate.getTime())) return ''; // Return empty if the date is invalid

      // Convert UTC date to IST (UTC+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
      const istDate = new Date(utcDate.getTime() + istOffset);

      // Format IST date as a readable string
      return istDate.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata', // Ensures IST timezone
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5); /* Overlay background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Ensure it appears on top */
}

.chat-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Contain the overflow for scroll */
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
}

.chat-header h3 {
  margin: 0; /* Remove default h3 margin */
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 10px;
}

.my-message {
  align-self: flex-end;
  max-width: 45%;
}

.received-message {
  align-self: flex-start;
  max-width: 45%;
}

.message-content {
  background-color: #cec6f8; /* Light purple for your messages */
  padding: 8px 12px;
  border-radius: 8px;
  word-wrap: break-word;
}

.received-message .message-content {
  background-color: #eee; /* Light gray for received messages */
}

.message-timestamp {
  display: block;
  font-size: smaller;
  color: #777;
  margin-top: 2px;
}

.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ccc;
}

.chat-input input[type='text'] {
  flex-grow: 1;
  margin-right: 5px;
  padding: 5px;
  border: 1px solid #ccc;
}

.chat-input button {
  padding: 5px 10px;
  background-color: #0084ff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
