import api from ".";
import { IAccountResponse, ICreateAccountRequest } from "@interface";

/** 계정 및 팀 정보 등록 API*/
export const postAccounts = async (data: ICreateAccountRequest[]) => {
  try {
    const result = await api.post(`/admin/account/regist`, data);
    return result.data;
  } catch (error) {
    throw new Error(`계정 생성 실패`);
  }
};

/** 연도별 계정 정보 조회 API*/
export const getAccount = async (year: string): Promise<IAccountResponse[]> => {
  try {
    const result = await api.get(`/admin/account/search?year=${year}`);
    return result.data;
  } catch (error) {
    throw new Error(`계정 정보 조회 실패`);
  }
};

/**계정 정보 삭제 API */
export const deleteAccount = async (accountId: string[]) => {
  try {
    const result = await api.delete(`/admin/account/delete`, { data: accountId });
    return result.data;
  } catch (error) {
    throw new Error(`계정 삭제 실패`);
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
