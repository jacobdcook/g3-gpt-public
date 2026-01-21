import axios from 'axios';
import { backendURL } from '../constants/baseURL';

class FileUploadController {
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${backendURL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}

export default FileUploadController;