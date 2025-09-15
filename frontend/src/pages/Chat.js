import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChatWindow from '../components/ChatWindow';
import { MessageCircle, Search, Users } from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const [availableUsers, setAvailableUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('conversations');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableUsers();
    loadConversations();
  }, []);

  const loadAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/available-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAvailableUsers(data);
    } catch (error) {
      console.error('Error loading available users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const filteredUsers = availableUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.senderInfo?.[0]?._id === user.id 
      ? conv.receiverInfo?.[0] 
      : conv.senderInfo?.[0];
    return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const startChat = (chatUser) => {
    setSelectedUser(chatUser);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'student': return 'bg-green-500';
      case 'faculty': return 'bg-purple-500';
      case 'recruiter': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex h-96 md:h-[600px]">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('conversations')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'conversations'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageCircle size={16} className="inline mr-1" />
                  Chats
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'users'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Users size={16} className="inline mr-1" />
                  People
                </button>
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'conversations' ? (
                <div className="p-2">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle size={48} className="mx-auto mb-2 text-gray-300" />
                      <p>No conversations yet</p>
                      <p className="text-sm">Start a new chat from the People tab</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv, index) => {
                      const otherUser = conv.senderInfo?.[0]?._id === user.id 
                        ? conv.receiverInfo?.[0] 
                        : conv.senderInfo?.[0];
                      
                      return (
                        <div
                          key={index}
                          onClick={() => startChat(otherUser)}
                          className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <div className={`w-10 h-10 ${getRoleColor(otherUser?.role)} rounded-full flex items-center justify-center text-white font-semibold mr-3`}>
                            {otherUser?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{otherUser?.name}</p>
                            <p className="text-sm text-gray-500 truncate">{conv.lastMessage?.content}</p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="p-2">
                  {filteredUsers.map((chatUser) => (
                    <div
                      key={chatUser._id}
                      onClick={() => startChat(chatUser)}
                      className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <div className={`w-10 h-10 ${getRoleColor(chatUser.role)} rounded-full flex items-center justify-center text-white font-semibold mr-3`}>
                        {chatUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{chatUser.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{chatUser.role}</p>
                        {chatUser.department && (
                          <p className="text-xs text-gray-400">{chatUser.department}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1">
            {selectedUser ? (
              <ChatWindow
                currentUser={user}
                selectedUser={selectedUser}
                onClose={() => setSelectedUser(null)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p>Choose a user from the sidebar to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
