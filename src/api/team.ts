import api from ".";
import { IProject, ITeamData, ITeamResponse } from "@interface";

export const getTeams = async (year: string): Promise<ITeamResponse> => {
  try {
    const result = await api.get(`/admin/team/search/teamInfo?year=${year}`);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export const putTeams = async (teams: ITeamData[]) => {
  try {
    const result = await api.put(`/admin/team/update`, teams);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export const deleteTeams = async (teamIds: string[]) => {
  try {
    const result = await api.delete(`/admin/team/delete`, { data: teamIds });
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export const getProjects = async (year: string): Promise<IProject[]> => {
  try {
    const result = await api.get(`/public/team/search/teamPost?year=${year}`);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export const getTeamProflies = async (year: string): Promise<string[]> => {
  try {
    const result = await api.get(`public/team/search/teamProflie?year=${year}`);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};
