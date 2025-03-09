import api from ".";
import { ITeamPost } from "../interface";

export const postGetTeampost = async (teamId: string): Promise<ITeamPost> => {
  try {
    const result = await api.post(`/public/post/search`, { uuid: teamId });
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export const putTeampostSlideImage = async () => {
  try {
    const result = await api.put(`user/post/update/slideImage`);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};
