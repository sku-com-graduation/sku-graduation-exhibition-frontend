import api from ".";
import { IProject } from "../types/IProject";
import { ITeam } from "../types/ITeam";

export const getTeams = async (year: string): Promise<ITeam[]> => {
  try {
    const result = await api.get(`/admin/team/search/teamInfo?year=${year}`);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export const patchTeams = async (teams: ITeam[]) => {
  try {
    const result = await api.patch(`/admin/team/update`, teams);
    return result.data;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export const deleteTeams = async (teamIds: { encryptionTeamIds: string[] }) => {
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
