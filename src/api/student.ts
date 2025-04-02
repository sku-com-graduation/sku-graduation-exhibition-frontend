import api from ".";
import { AxiosError } from "axios";
import { IStudent } from "../interface";

/** 연도별 학생 정보 조회 API */
export const getStudent = async (year: string): Promise<IStudent[]> => {
  try {
    const result = await api.get(`/admin/student/search?year=${year}`);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

/**학생 등록 API (개별) */
export const postStudent = async (data: { studentName: string; studentNumber: string }) => {
  try {
    const result = await api.post(`/admin/student/save`, data);
    if (result.status === 201) {
      return result.data;
    }
    throw new Error(`에러 상태 코드: ${result.status} - ${result.statusText}`);
  } catch (error) {
    if (error instanceof AxiosError) throw new Error(`${error}`);
  }
};

/**학생 등록 API (csv) */
export const postStudents = async (csvStudent: File) => {
  try {
    const formData = new FormData();
    formData.append("file", csvStudent);

    const result = await api.post(`/admin/student/s/save`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (result.status === 201) {
      return result.data;
    }
    throw new Error(`에러 상태 코드: ${result.status} - ${result.statusText}`);
  } catch (error) {
    if (error instanceof AxiosError) throw new Error(`${error}`);
  }
};

/** 학생 정보 수정 API */
export const putStudent = async (studentInfo: IStudent[]) => {
  try {
    const result = await api.put(`/admin/student/update`, studentInfo);
    if (result.status === 200) {
      return result.data;
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(`에러발생 ${JSON.stringify(error, null, 4)}`);
    }
  }
};

/**학생 삭제 API */
export const deleteStudent = async (studentId: string[]) => {
  try {
    const result = await api.delete(`/admin/student/delete`, { data: studentId });
    if (result.status === 200) {
      return result.data;
    }
    throw new Error(`에러 상태 코드: ${result.status} - ${result.statusText}`);
  } catch (error) {
    if (error instanceof AxiosError) throw new Error(`${error}`);
  }
};
