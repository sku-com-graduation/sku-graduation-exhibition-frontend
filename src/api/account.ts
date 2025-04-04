import api from ".";
import { IAccount } from "@interface";

/** 연도별 계정 정보 조회 */
export const getAccount = async (year: string): Promise<IAccount[]> => {
  try {
    const result = await api.get(`/admin/account/search?year=${year}`);
    return result.data;
  } catch (error) {
    throw new Error(`계정 정보 조회 실패`);
  }
};

/** 계정 생성 API (개별)*/
export const postAccount = async () => {
  try {
    const result = await api.post(`/admin/account/regist/single`);
    return result.data;
  } catch (error) {
    throw new Error(`계정 생성 실패`);
  }
};

/** 계정 생성 API (csv)*/
export const postAccounts = async (data: FormData) => {
  try {
    const result = await api.post(`/admin/account/regist`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return result.data;
  } catch (error) {
    throw new Error(`계정 생성 실패`);
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
    throw new Error(`계정 초기화 실패`);
  }
};

/**계정 삭제 API */
export const deleteAccount = async (accountId: string[]) => {
  try {
    const result = await api.delete(`/admin/account/delete`, { data: accountId });
    return result.data;
  } catch (error) {
    throw new Error(`계정 삭제 실패`);
  }
};
