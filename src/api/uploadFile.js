import axios from "axios";
import { Api } from "./API";

export const uploadFile = async ({ file, token }) => {
  const payload = new FormData();
  payload.append("file", file);

  const response = await axios.post(`${Api}/api/v1/chats/upload`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return response.data?.data?.url || "";
};

export const uploadFiles = async ({ files, token }) => {
  const list = Array.from(files || []);
  const uploaded = await Promise.all(list.map((file) => uploadFile({ file, token })));
  return uploaded.filter(Boolean);
};
