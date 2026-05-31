import axios from "axios";
import { Api } from "./API";
import { ApiPaths } from "./apiPaths";

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

// Chat Management
export const createOrGetChat = async (data, token) => {
  try {
    const response = await axios.post(`${Api}${ApiPaths.chat.create}`, data, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserChats = async (params = {}, token) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axios.get(`${Api}${ApiPaths.chat.userChats}?${queryParams}`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getChatMessages = async (chatId, params = {}, token) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axios.get(`${Api}${ApiPaths.chat.messages(chatId)}?${queryParams}`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Messaging
export const sendMessage = async (data, token) => {
  try {
    const response = await axios.post(`${Api}${ApiPaths.chat.sendMessage}`, data, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const editMessage = async (messageId, data, token) => {
  try {
    const response = await axios.put(`${Api}${ApiPaths.chat.editMessage(messageId)}`, data, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteMessage = async (messageId, token) => {
  try {
    const response = await axios.delete(`${Api}${ApiPaths.chat.deleteMessage(messageId)}`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addReaction = async (messageId, data, token) => {
  try {
    const response = await axios.post(`${Api}${ApiPaths.chat.addReaction(messageId)}`, data, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const removeReaction = async (messageId, token) => {
  try {
    const response = await axios.delete(`${Api}${ApiPaths.chat.removeReaction(messageId)}`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Chat Control
export const closeChat = async (chatId, token) => {
  try {
    const response = await axios.put(`${Api}${ApiPaths.chat.closeChat(chatId)}`, {}, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
