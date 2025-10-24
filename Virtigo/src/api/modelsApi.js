import axios from "axios";
import { API_BASE_URL } from "../utils/config";

// export const createModel = async (data) => {
//   const res = await axios.post(`${API_BASE_URL}/models/generate`, data);
//   return res.data;
// };

// export const createModel = async (formData) => {
//   const res = await axios.post(`${API_BASE_URL}/models/generate`, formData);
//   return res.data; // { taskId, model }
// };

export const createModel = async (formData) => {
  const mode = formData.get("mode");
  let endpoint = `${API_BASE_URL}api/models/generate`;

  if (mode === "image") {
    endpoint = `${API_BASE_URL}api/models/generate-from-image`;
  }

  const res = await axios.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data; // { taskId, model }
};

export const streamModelStatus = (taskId, onMessage, onError) => {
  const eventSource = new EventSource(`${API_BASE_URL}api/models/stream/${taskId}`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    } catch (err) {
      console.warn("SSE parse error:", event.data);
    }
  };

  eventSource.onerror = (err) => {
    console.error("SSE error:", err);
    eventSource.close();
    onError?.(err);
  };

  return eventSource;
};


export const getModels = async () => {
  const res = await axios.get(`${API_BASE_URL}api/models`);
  return res.data;
};

export const getModelById = async (id) => {
  const res = await axios.get(`${API_BASE_URL}api/models/${id}`);
  return res.data;
};

export const updateModel = async (id, data) => {
  const res = await axios.put(`${API_BASE_URL}api/models/${id}`, data);
  return res.data;
};

export const updateModelInfo = async (id, data) => {
  const res = await axios.put(`${API_BASE_URL}api/models/${id}/update-info`, data);
  return res.data;
};

export const uploadTexture = async (id, file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await axios.post(`${API_BASE_URL}api/models/${id}/texture`, form);
  return res.data;
};

export const saveModelToDB = async (taskId) => {
  const res = await axios.get(`${API_BASE_URL}api/Models/check-task/${taskId}`);
  return res.data;
};

export const saveModelToDBRefine = async (taskId) => {
  const res = await axios.get(`${API_BASE_URL}api/Models/check-refine/${taskId}`);
  return res.data;
};

export const getRefinesByModelId = async (id) => {
  const res = await axios.get(`${API_BASE_URL}api/models/${id}/refines`);
  return res.data;
};

// export const createRefine = async (id, { enablePbr, texturePrompt, textureImage }) => {
//   const formData = new FormData();
//   formData.append("enablePbr", enablePbr);
//   if (texturePrompt) formData.append("texturePrompt", texturePrompt);
//   if (textureImage) formData.append("textureImageUrl", textureImage);

//   const res = await axios.post(`${API_BASE_URL}/models/${id}/refine`, formData);
//   return res.data; // { refineTaskId, refine }
// };

// export const createRefine = async (id, { enablePbr, texturePrompt, textureImage }) => {
//   const formData = new FormData();
//   formData.append("enablePbr", enablePbr);

//   if (texturePrompt) formData.append("texturePrompt", texturePrompt);

//   if (textureImage) {
//     // Chuyển ảnh sang base64 (Data URI)
//     const base64 = await new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => resolve(reader.result); // result là dạng data:image/png;base64,...
//       reader.onerror = reject;
//       reader.readAsDataURL(textureImage);
//     });
//     formData.append("textureImageUrl", base64);
//   }

//   const res = await axios.post(`${API_BASE_URL}/models/${id}/refine`, formData);
//   return res.data; // { refineTaskId, refine }
// };

export const createRefine = async (id, { enablePbr, texturePrompt, textureImage }) => {
  const formData = new FormData();
  formData.append("enablePbr", enablePbr);

  if (texturePrompt) formData.append("texturePrompt", texturePrompt);

  if (textureImage) {
    // 👇 gửi file thật, không convert base64
    formData.append("textureImageFile", textureImage);
  }

  const res = await axios.post(`${API_BASE_URL}/models/${id}/refine`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data; // { refineTaskId, refine }
};