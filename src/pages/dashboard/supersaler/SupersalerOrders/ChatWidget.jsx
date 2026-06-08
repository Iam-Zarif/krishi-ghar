import { useState, useEffect, useRef } from "react";
import { FiX, FiSend } from "react-icons/fi";
import { RiCustomerService2Line } from "react-icons/ri";
import {
  createOrGetChat,
  sendMessage as sendMessageAPI,
  getChatMessages,
} from "../../../../api/chat";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const ChatWidget = ({ orderData, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chat, setChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef();

  const token = Cookies.get("token") || localStorage.getItem("token");

  const readChat = (response) => response?.chat || response?.data?.chat || response?.data || null;
  const readMessages = (response) => {
    const list = response?.data?.messages || response?.messages || [];
    return Array.isArray(list) ? list : [];
  };
  const readMessage = (response) => {
    const message = response?.data || response?.message;
    return message && typeof message === "object" ? message : null;
  };

  const loadMessages = async (chatId) => {
    const messagesResponse = await getChatMessages(chatId, { page: 1, limit: 50 }, token);
    if (messagesResponse.success) {
      setMessages(readMessages(messagesResponse));
    }
  };

  useEffect(() => {
    if (!orderData || !token) return;

    const initializeChat = async () => {
      try {
        setIsLoading(true);

        const chatData = {
          subject: `অর্ডার সহায়তা - ${orderData.o.orderId}`,
          priority: "medium",
          category: "support",
          chatType: "user_to_admin"
        };

        const chatResponse = await createOrGetChat(chatData, token);
        if (chatResponse.success) {
          const nextChat = readChat(chatResponse);
          setChat(nextChat);
          if (nextChat?._id) await loadMessages(nextChat._id);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error("চ্যাট শুরু করা যায়নি");
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [orderData, token]);

  useEffect(() => {
    if (!chat?._id || !token) return undefined;
    const intervalId = setInterval(() => {
      loadMessages(chat._id).catch(() => {});
    }, 12000);
    return () => clearInterval(intervalId);
  }, [chat?._id, token]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!text.trim() || !chat || !token) return;

    try {
      const messageData = {
        chatId: chat._id,
        content: text,
        messageType: "text"
      };

      const response = await sendMessageAPI(messageData, token);
      if (response.success) {
        const sentMessage = readMessage(response);
        if (sentMessage) {
          setMessages(prev => [...prev, sentMessage]);
        } else {
          await loadMessages(chat._id);
        }
        setText("");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("বার্তা পাঠানো যায়নি");
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!orderData) return null;

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 w-[calc(100vw-1.5rem)] sm:w-[390px] h-[min(620px,calc(100vh-1.5rem))] sm:h-[620px] bg-white shadow-2xl rounded-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-emerald-50 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <RiCustomerService2Line className="text-emerald-600 text-lg" />
          <div>
            <span className="font-semibold text-gray-800">অ্যাডমিন সাপোর্ট</span>
            {chat && (
              <div className="text-xs text-gray-500">
                {chat.status === 'open' && 'খোলা'}
                {chat.status === 'in_progress' && 'প্রসেসিং'}
                {chat.status === 'resolved' && 'সমাধান'}
              </div>
            )}
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded">
          <FiX />
        </button>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {/* Order Info Message */}
            <div className="bg-white rounded-xl border p-3 text-sm shadow-sm space-y-3">
              <div className="font-semibold">অর্ডার #{orderData.o.orderId}</div>
              <div className="space-y-2">
                {orderData.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 border rounded-lg p-2">
                    <img
                      src={item.productImage}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm">{item.productName}</div>
                      <div className="text-xs text-gray-500">
                        {item.quantity} × ৳ {item.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(orderData.o.createdAt).toLocaleString('bn-BD')}
              </div>
            </div>

            {/* Chat Messages */}
            {messages.map((msg, idx) => (
              <div key={msg._id || idx}>
                {msg.messageType === 'system' ? (
                  <div className="text-center text-xs text-gray-500 bg-gray-100 rounded-lg px-2 py-1">
                    {msg.content}
                  </div>
                ) : msg.senderRole === 'admin' ? (
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="bg-emerald-100 text-emerald-700 p-2 rounded-full">
                      <RiCustomerService2Line size={16} />
                    </div>
                    <div className="bg-white border rounded-xl px-3 py-2 text-sm shadow-sm text-gray-800">
                      {msg.content}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {msg.reactions.map((reaction, i) => (
                            <span key={i} className="text-xs">{reaction.emoji}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500 text-white px-3 py-2 rounded-xl text-sm ml-auto max-w-[80%]">
                    {msg.content}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex gap-1 mt-1 justify-end">
                        {msg.reactions.map((reaction, i) => (
                          <span key={i} className="text-xs">{reaction.emoji}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
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
    </div>
  );
};

ChatWidget.propTypes = {
  orderData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ChatWidget;
