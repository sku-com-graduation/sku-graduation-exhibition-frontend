import api from ".";
import { ITeamPost, ITeamStudent } from "@interface";

export const postGetTeampost = async (teamId: string): Promise<ITeamPost> => {
  try {
    const result = await api.post(`/public/post/search`, { teamUuid: teamId });
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export const putTeampost = async (data: FormData) => {
  for (const [key, value] of data.entries()) {
    console.log(`${key}:`, value);
  }
  try {
    const result = await api.put(`/user/post/update/teamPost`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return result.data;
  } catch (error) {
    console.error("Error occurred while sending request:", error);
    throw new Error(`${error}`);
  }
};

export const putTeamStudent = async (data: FormData) => {
  // try {
  const result = await api.put(`/user/post/update/studentProfile`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return result.data;
  // } catch (error) {
  //   throw new Error(`문제 발생: ${error}`);
  // }
};

export const putTeampostSlideImage = async (data: FormData) => {
  try {
    const result = await api.put(`/user/post/update/slideImage`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export const postGetTeampostEdit = async (teamUuid: string) => {
  try {
    const result = await api.post(`/user/post/edit/search`, teamUuid);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};
