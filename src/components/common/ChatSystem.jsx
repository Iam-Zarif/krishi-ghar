import { useState, useEffect, useRef } from "react";
import { FiX, FiSend, FiMessageSquare } from "react-icons/fi";
import { RiCustomerService2Line } from "react-icons/ri";
import {
  createOrGetChat,
  sendMessage as sendMessageAPI,
  getUserChats,
  getChatMessages,
  closeChat,
} from "../../api/chat";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const ChatSystem = ({ isOpen, onClose, initialSubject = "সাধারণ সহায়তা", category = "general" }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const bottomRef = useRef();

  const token = Cookies.get("token") || localStorage.getItem("token");

  const readChats = (response) => {
    const chats = response?.data?.chats || response?.chats || [];
    return Array.isArray(chats) ? chats : [];
  };

  const readMessages = (response) => {
    const loadedMessages = response?.data?.messages || response?.messages || [];
    return Array.isArray(loadedMessages) ? loadedMessages : [];
  };

  const readMessage = (response) => {
    const message = response?.data || response?.message;
    return message && typeof message === "object" ? message : null;
  };

  const readChat = (response) => response?.chat || response?.data?.chat || response?.data || null;

  // Load user chats
  useEffect(() => {
    if (!isOpen || !token) return;

    const loadChats = async () => {
      try {
        const response = await getUserChats({}, token);
        if (response.success) {
          const loadedChats = readChats(response);
          setChats(loadedChats);
          setActiveChat((current) => current || loadedChats[0] || null);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    };

    loadChats();
  }, [isOpen, token]);

  // Load messages when active chat changes
  useEffect(() => {
    if (!activeChat || !token) return;

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const response = await getChatMessages(activeChat._id, {}, token);
        if (response.success) {
          setMessages(readMessages(response));
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [activeChat, token]);

  useEffect(() => {
    if (!isOpen || !activeChat?._id || !token) return undefined;
    const intervalId = setInterval(async () => {
      try {
        const response = await getChatMessages(activeChat._id, { page: 1, limit: 50 }, token);
        if (response.success) {
          setMessages(readMessages(response));
        }
      } catch {
        // REST polling is a fallback; avoid noisy UI while the user types.
      }
    }, 12000);

    return () => clearInterval(intervalId);
  }, [activeChat?._id, isOpen, token]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create new chat
  const createNewChat = async () => {
    if (!token) {
      toast.error("চ্যাট করতে লগইন করুন");
      return;
    }

    try {
      const chatData = {
        subject: initialSubject,
        priority: "medium",
        category: category,
        chatType: "user_to_admin"
      };

      const response = await createOrGetChat(chatData, token);
      if (response.success) {
        const chat = readChat(response);
        if (!chat?._id) {
          toast.error("চ্যাট তথ্য পাওয়া যায়নি");
          return;
        }
        setChats(prev => [chat, ...prev.filter((item) => item._id !== chat._id)]);
        setActiveChat(chat);
        setShowChatList(false);
        toast.success('নতুন চ্যাট তৈরি করা হয়েছে');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      if (error.response?.data?.message) {
        toast.error("চ্যাট তৈরি করতে ব্যর্থ");
      } else {
        toast.error('চ্যাট তৈরি করতে ব্যর্থ');
      }
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!text.trim() || !activeChat || !token) return;

    try {
      const messageData = {
        chatId: activeChat._id,
        content: text,
        messageType: "text"
      };

      const response = await sendMessageAPI(messageData, token);
      if (response.success) {
        const message = readMessage(response);
        if (message) {
          setMessages(prev => [...prev, message]);
        }
        setText("");

        // Update chat list
        setChats(prev => prev.map(chat =>
          chat._id === activeChat._id
            ? { ...chat, lastMessage: message, updatedAt: new Date() }
            : chat
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('বার্তা পাঠাতে ব্যর্থ');
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Close chat
  const handleCloseChat = async () => {
    if (!activeChat || !token) return;

    try {
      await closeChat(activeChat._id, token);
      setChats(prev => prev.map(chat =>
        chat._id === activeChat._id
          ? { ...chat, status: 'closed', closedAt: new Date() }
          : chat
      ));
      toast.success('চ্যাট বন্ধ করা হয়েছে');
    } catch (error) {
      console.error('Error closing chat:', error);
      toast.error('চ্যাট বন্ধ করতে ব্যর্থ');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 w-[calc(100vw-1.5rem)] sm:w-[800px] h-[min(640px,calc(100vh-1.5rem))] sm:h-[640px] bg-white shadow-2xl rounded-2xl border border-gray-200 flex z-50 overflow-hidden">
      {/* Chat List Sidebar */}
      {showChatList && (
        <div className="w-full sm:w-80 border-r border-gray-200 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-emerald-50 rounded-t-2xl sm:rounded-l-2xl">
            <span className="font-semibold text-gray-800 flex items-center gap-2">
              <FiMessageSquare className="text-emerald-600 text-lg" />
              আমার চ্যাট
            </span>
            <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded">
              <FiX />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <button
                onClick={createNewChat}
                className="w-full bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition text-sm font-medium"
              >
                + নতুন চ্যাট শুরু করুন
              </button>
            </div>

            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => {
                    setActiveChat(chat);
                    setShowChatList(false);
                  }}
                  className={`p-3 mx-2 rounded-xl cursor-pointer transition ${
                    activeChat?._id === chat._id ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{chat.subject}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {chat.lastMessage ? (
                          <span className="truncate block">
                            {chat.lastMessage.senderRole === 'admin' ? 'এডমিন: ' : 'আপনি: '}
                            {chat.lastMessage.content}
                          </span>
                        ) : (
                          'কোনো বার্তা নেই'
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        chat.status === 'open' ? 'bg-green-100 text-green-700' :
                        chat.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                        chat.status === 'resolved' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {chat.status === 'open' && 'খোলা'}
                        {chat.status === 'in_progress' && 'প্রসেসিং'}
                        {chat.status === 'resolved' && 'সমাধান'}
                        {chat.status === 'closed' && 'বন্ধ'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(chat.updatedAt || chat.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {chats.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  কোনো চ্যাট নেই
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {!showChatList && activeChat && (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-emerald-50">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowChatList(true)}
                className="sm:hidden hover:bg-gray-100 p-1 rounded"
              >
                ←
              </button>
              <RiCustomerService2Line className="text-emerald-600 text-lg" />
              <div>
                <div className="font-semibold text-gray-800">{activeChat.subject}</div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    activeChat.status === 'open' ? 'bg-green-500' :
                    activeChat.status === 'in_progress' ? 'bg-yellow-500' :
                    activeChat.status === 'resolved' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}></span>
                  {activeChat.status === 'open' && 'এডমিন খুঁজছেন'}
                  {activeChat.status === 'in_progress' && 'এডমিন কাজ করছেন'}
                  {activeChat.status === 'resolved' && 'সমাধান হয়েছে'}
                  {activeChat.status === 'closed' && 'চ্যাট বন্ধ'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeChat.status !== 'closed' && activeChat.status !== 'resolved' && (
                <button
                  onClick={handleCloseChat}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  চ্যাট বন্ধ করুন
                </button>
              )}
              <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded">
                <FiX />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg._id}>
                    {msg.messageType === 'system' ? (
                      <div className="text-center text-xs text-gray-500 bg-gray-100 rounded-lg px-2 py-1">
                        {msg.content}
                      </div>
                    ) : msg.senderRole === 'admin' ? (
                      <div className="flex items-start gap-2 max-w-[85%]">
                        <div className="bg-emerald-100 text-emerald-700 p-2 rounded-full">
                          <RiCustomerService2Line size={16} />
                        </div>
                        <div className="bg-white border rounded-xl px-3 py-2 text-sm text-gray-800 shadow-sm">
                          {msg.content}
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString('bn-BD', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-500 text-white px-3 py-2 rounded-xl text-sm ml-auto max-w-[80%]">
                        {msg.content}
                        <div className="text-xs text-emerald-100 mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString('bn-BD', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input */}
          {activeChat.status !== 'closed' && (
            <div className="p-4 border-t flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="আপনার বার্তা লিখুন..."
                className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!text.trim() || isLoading}
                className="bg-emerald-500 text-white px-3 rounded-xl hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ChatSystem.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialSubject: PropTypes.string,
  category: PropTypes.string,
};

ChatSystem.defaultProps = {
  initialSubject: "সাধারণ সহায়তা",
  category: "general",
};

export default ChatSystem;
