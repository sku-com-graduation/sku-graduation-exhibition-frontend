import { useQuery } from "@tanstack/react-query";
import { getHomeInfo } from "@api/home";
import { getProjects } from "@api/team";
import { postGetTeampost } from "@api/teamPost";
import type { IHomeResponse, IProject, ITeamPost } from "@interface";

export const exhibitionKeys = {
  projects: (year: number) => ["projects", year] as const,
  homeInfo: (year: number) => ["homeInfo", year] as const,
  teamPost: (uuid: string) => ["teamPost", uuid] as const,
};

const byTeamName = (a: IProject, b: IProject) => a.teamName.localeCompare(b.teamName, "ko");

/** 연도별 작품 목록. 팀명 가나다순으로 정렬한다. */
export const useProjects = (year: number) =>
  useQuery({
    queryKey: exhibitionKeys.projects(year),
    queryFn: async (): Promise<IProject[]> => {
      const list = await getProjects(String(year));
      return Array.isArray(list) ? [...list].sort(byTeamName) : [];
    },
  });

/** 연도별 전시 일시·시간. 아직 등록되지 않은 해는 null을 돌려준다. */
export const useHomeInfo = (year: number) =>
  useQuery({
    queryKey: exhibitionKeys.homeInfo(year),
    queryFn: async (): Promise<IHomeResponse | null> => {
      try {
        return (await getHomeInfo(String(year))) ?? null;
      } catch {
        return null;
      }
    },
  });

export const useTeamPost = (uuid: string | undefined) =>
  useQuery({
    queryKey: exhibitionKeys.teamPost(uuid ?? ""),
    queryFn: (): Promise<ITeamPost> => postGetTeampost(uuid!),
    enabled: !!uuid,
  });
