import api from ".";
import { AxiosError } from "axios";
import IStudent from "../types/IStudent";

/** 연도별 학생 정보 조회 API */
export const getStudent = async (year: string): Promise<IStudent[]> => {
  try {
    const result = await api.get(`/admin/student/search?year=${year}`);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

/**학생 등록 API */
export const postStudent = async (csvStudent: File) => {
  try {
    const formData = new FormData();
    formData.append("file", csvStudent);

    const result = await api.post(`/admin/student/save`, formData, {
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
export const patchStudent = async (studentInfo: IStudent[]) => {
  try {
    const result = await api.patch(`/admin/student/update`, studentInfo);
    if (result.status === 200) {
      return result.data;
    }
  } catch (error) {
    if (error instanceof AxiosError) throw new Error(`${error}`);
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
