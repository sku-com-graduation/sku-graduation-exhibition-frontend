/**
 * 로그인 성공 시 반환되는 결과 인터페이스
 * @property {string} accessToken - 인증을 위한 액세스 토큰
 * @property {string} role - 사용자 권한(admin, )
 * @property {string} teamName - 소속된 팀 이름
 */
export default interface IAuth {
  accessToken: string;
  role: string;
  teamName: string;
  uuid: string;
  recent: string;
}
