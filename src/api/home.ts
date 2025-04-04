import api from ".";
import { IHome } from "@interface";

/**홈페이지 정보 수정 API */
export const putHomeInfo = async (data: IHome) => {
  try {
    const result = await api.put(`/admin/home/update/info`, data);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

/**전체 홈페이지 정보 조회 API */
export const getHomeInfoAll = async (): Promise<IHome[] | []> => {
  try {
    const result = await api.get(`/admin/home/search/infos`);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

/**홈페이지 정보 조회 API */
export const getHomeInfo = async (year: string): Promise<IHome> => {
  try {
    const result = await api.get(`/public/home/search/info?year=${year}`);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

/**홈페이지 정보 생성 API */
export const postHomeInfo = async (data: IHome[]): Promise<IHome[] | []> => {
  try {
    const result = await api.post(`/admin/home/create/infos`, data);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};
