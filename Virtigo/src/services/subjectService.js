import axios from 'axios';
import { API_URL, endpoints } from '../config/api';

const createSubject = async ({ subjectName, description, minAverageScoreToPass }) => {
  console.log('Sending subject:', { subjectName, description, minAverageScoreToPass });
  try {
    const response = await axios.post(`${API_URL}${endpoints.manageSubject.create}`, {
      subjectName,
      description,
      minAverageScoreToPass,
    });
    const data = response.data;

    // ✅ Trích xuất subjectID trực tiếp từ data.message.data
    const subjectID = data?.message?.data;

    if (subjectID) {
      return { subjectID, ...data.message };
    }

    // Trường hợp không có subjectID
    return data.message;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};


const getSubjectById = async (subjectId) => {
  try {
    const response = await axios.get(`${API_URL}${endpoints.manageSubject.getById}${subjectId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateSubject = async (subjectData) => {
  try {
    const response = await axios.put(`${API_URL}${endpoints.manageSubject.update}`, subjectData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createSyllabusSchedule = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}api/SyllabusSchedule/create-syllabus-schedule`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createAssessmentCriteriaMany = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}api/AssessmentCriteria/create-many`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateAssessmentCriteriaList = async (payload) => {
  try {
    const response = await axios.put(`${API_URL}api/AssessmentCriteria/update-list`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const bulkUpdateSyllabusSchedule = async (payload) => {
  try {
    console.log('bulkUpdateSyllabusSchedule payload:', payload);
    const response = await axios.put(`${API_URL}api/SyllabusSchedule/bulk-update`, payload);
    return response.data;
  } catch (error) {
    console.error('Bulk-update error', error.response?.data);
    throw error;
  }
};

export const publishSubject = async (subjectID) => {
  console.log(subjectID);
  return axios.put(`${API_URL}api/Subject/update-status`, {
    subjectID,
    status: 1 // 1 là active/công khai
  });
};

export const subjectService = {
  createSubject,
  getSubjectById,
  updateSubject,
  createSyllabusSchedule,
  createAssessmentCriteriaMany,
  updateAssessmentCriteriaList,
  bulkUpdateSyllabusSchedule,
  publishSubject,
}; 