import api from ".";
import { IAccount } from "../types/IAccount";

/** 연도별 계정 정보 조회 */
export const getAccount = async (year: string): Promise<IAccount> => {
  try {
    const result = await api.get(`/admin/account/search?year=${year}`);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

/** 계정 생성 API */
export const postAccount = async (csvAccount: File) => {
  try {
    const formData = new FormData();
    formData.append(`file`, csvAccount);

    const result = await api.post(`/admin/account/regist`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (result.status === 201) {
      return result.data;
    }
  } catch (error) {
    throw new Error(`${error}`);
  }
};

/**계정 초기화 API */
export const resetAccount = async (accountId: string[]) => {
  try {
    const result = await api.post(`/admin/account/reset`, accountId);
    if (result.status === 200) {
      return result.data;
    }
  } catch (error) {
    throw new Error(`${error}`);
  }
};

/**계정 삭제 API */
export const deleteAccount = async (accountId: string[]) => {
  try {
    const result = await api.delete(`/admin/account/delete`, { data: accountId });
    if (result.status === 200) {
      return result.data;
    }
    throw new Error(`에러 상태 코드: ${result.status} - ${result.statusText}`);
  } catch (error) {
    throw new Error(`${error}`);
  }
};
