import api from "@api/index";
import type {
  IAccountRequest,
  IAccountResponse,
  IAccountSetInfo,
  IHomeResponse,
  IProfessor,
  IStudentResponse,
  IStudentResponseInfo,
  ITeamData,
  ITeamResponse,
} from "@interface";

/**
 * 관리자 화면이 쓰는 서버 API. 주소와 본문 형식은 기존 화면과 같다(서버를 바꿀 수 없다).
 * 2xx가 아니면 axios가 예외를 던지므로 화면에서는 실패를 그대로 받아 처리한다.
 */

const asList = <T>(data: unknown): T[] => (Array.isArray(data) ? data : []);

export const adminApi = {
  students: async (year: number): Promise<IStudentResponse> => {
    const { data } = await api.get(`/admin/student/search?year=${year}`);
    return { students: asList(data?.students), teams: asList(data?.teams) };
  },
  addStudents: (rows: { studentName: string; studentNumber: string }[]) => api.post(`/admin/student/save`, rows),
  updateStudents: (rows: IStudentResponseInfo[]) => api.put(`/admin/student/update`, rows),
  deleteStudents: (ids: string[]) => api.delete(`/admin/student/delete`, { data: ids }),

  teams: async (year: number): Promise<ITeamResponse> => {
    const { data } = await api.get(`/admin/team/search/teamInfo?year=${year}`);
    return { teams: asList(data?.teams), professors: asList(data?.professors) };
  },
  updateTeams: (rows: ITeamData[]) => api.put(`/admin/team/update`, rows),
  deleteTeams: (ids: string[]) => api.delete(`/admin/team/delete`, { data: ids }),

  accounts: async (year: number): Promise<IAccountResponse[]> => asList((await api.get(`/admin/account/search?year=${year}`)).data),
  accountSetInfo: async (): Promise<IAccountSetInfo> => {
    const { data } = await api.get(`/admin/account/regist/info`);
    return { professors: asList(data?.professors), students: asList(data?.students) };
  },
  registerAccounts: (body: IAccountRequest) => api.post(`/admin/account/regist`, body),
  resetAccounts: (ids: string[]) => api.post(`/admin/account/reset`, ids),
  deleteAccounts: (ids: string[]) => api.delete(`/admin/account/delete`, { data: ids }),

  professors: async (): Promise<IProfessor[]> => asList((await api.get(`/admin/professor/search`)).data),
  addProfessor: (form: FormData) => api.post(`/admin/professor/regist`, form, { headers: { "Content-Type": "multipart/form-data" } }),
  updateProfessor: (form: FormData) => api.put(`/admin/professor/update`, form, { headers: { "Content-Type": "multipart/form-data" } }),
  deleteProfessors: (ids: string[]) => api.delete(`/admin/professor/delete`, { data: ids }),
  professorUploadUrl: async (body: { encryptedProfessorId: string; fileType: "PROFESSOR"; contentType: string; extension: string }) =>
    (await api.post(`/user/s3/presigned-url/professor`, body)).data as { fileType: string; cloudFrontUrl: string; s3Url: string },

  homes: async (): Promise<IHomeResponse[]> => asList((await api.get(`/admin/home/search/infos`)).data),
  createHomes: (rows: IHomeResponse[]) => api.post(`/admin/home/create/infos`, rows),
  updateHome: (row: IHomeResponse) => api.put(`/admin/home/update/info`, row),
};

export const adminKeys = {
  students: (year: number) => ["admin", "students", year] as const,
  teams: (year: number) => ["admin", "teams", year] as const,
  accounts: (year: number) => ["admin", "accounts", year] as const,
  accountSetInfo: ["admin", "accountSetInfo"] as const,
  professors: ["admin", "professors"] as const,
  homes: ["admin", "homes"] as const,
};
