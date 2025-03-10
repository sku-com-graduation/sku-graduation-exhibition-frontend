import api from ".";
import { IProfessor } from "../interface";

/** 교수 정보 조회 */
export const getProfessor = async (): Promise<IProfessor[]> => {
  try {
    const result = await api.get(`/admin/professor/search`);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

/** 교수 정보 생성 */
export const postProfessor = async (professor: IProfessor) => {
  try {
    const result = await api.post(`/admin/professor/regist`, professor);
    if (result.status === 201) {
      return result.data;
    }
  } catch (error) {
    throw new Error(`${error}`);
  }
};

/** 교수 정보 수정 */
export const putProfessor = async (professor: IProfessor) => {
  try {
    const result = await api.put(`/admin/professor/update`, professor);
    if (result.status === 201) {
      return result.data;
    }
  } catch (error) {
    throw new Error(`${error}`);
  }
};

/**교수 삭제 */
export const deleteProfessor = async (professorId: string[]) => {
  try {
    const result = await api.delete(`/admin/professor/delete`, { data: professorId });
    if (result.status === 200) {
      return result.data;
    }
    throw new Error(`에러 상태 코드: ${result.status} - ${result.statusText}`);
  } catch (error) {
    throw new Error(`${error}`);
  }
};
