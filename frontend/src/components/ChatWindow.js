import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, Paperclip, Trash2, Trash } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';

const ChatWindow = ({ currentUser, selectedUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection with backend URL
    const socketURL = axios.defaults.baseURL || process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const newSocket = io(socketURL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    setSocket(newSocket);

    // Join user's room
    newSocket.emit('join', currentUser.id);

    // Listen for incoming messages
    newSocket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('message_sent', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user_typing', (data) => {
      if (data.senderId === selectedUser._id) {
        setIsTyping(data.isTyping);
      }
    });

    // Listen for message deletions
    newSocket.on('message_deleted', (data) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    });

    // Listen for conversation being cleared
    newSocket.on('conversation_cleared', (data) => {
      setMessages([]);
    });

    // Load conversation history
    loadConversationHistory();

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser.id, selectedUser._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversationHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/conversation/${selectedUser._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      senderId: currentUser.id,
      receiverId: selectedUser._id,
      content: newMessage.trim(),
      messageType: 'text'
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket) {
      socket.emit('typing', {
        senderId: currentUser.id,
        receiverId: selectedUser._id,
        isTyping: true
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          senderId: currentUser.id,
          receiverId: selectedUser._id,
          isTyping: false
        });
      }, 1000);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/message/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove the message from local state
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        
        // Emit socket event to notify other user about message deletion
        if (socket) {
          socket.emit('message_deleted', {
            messageId,
            conversationId: [currentUser.id, selectedUser._id].sort().join('_')
          });
        }
      } else {
        console.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear this entire conversation? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/conversation/${selectedUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Clear messages from local state
        setMessages([]);
        setShowMenu(false);
        
        // Emit socket event to notify other user
        if (socket) {
          const conversationId = [currentUser.id, selectedUser._id].sort().join('_');
          socket.emit('conversation_cleared', {
            conversationId,
            clearedBy: currentUser.id
          });
        }
      } else {
        console.error('Failed to clear conversation');
        alert('Failed to clear conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error clearing conversation:', error);
      alert('Error clearing conversation. Please try again.');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {selectedUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{selectedUser.role}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <Phone size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <Video size={20} />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={handleClearChat}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash size={18} />
                  <span>Clear Chat</span>
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            ×
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const senderId = message.sender?._id || message.sender;
          const isOwnMessage = senderId === currentUser.id;
          return (
            <div
              key={index}
              className={`flex group ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
                {isOwnMessage && (
                  <button
                    onClick={() => handleDeleteMessage(message._id)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-white hover:bg-opacity-20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title="Delete message"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
