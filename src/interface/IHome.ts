export interface IHomeResponse {
  encryptedHomeId: string;
  exhibitionYear: string;
  exhibitionDate: string;
  exhibitionHour: string;
}

export interface IHomeRequest {
  exhibitionYear: string;
  exhibitionDate: string;
  exhibitionHour: string;
}
