// import { getAccount } from "@src/api/account";
// import { deleteStudent, getStudent, putStudent } from "../../api/student";
// import { deleteTeams, getTeams, putTeams } from "../../api/team";
// import { getProfessor } from "@src/api/professor";
// import { IAccount, IStudent, IProfessor, ITeam } from "../../interface";

// interface IModeFunctions<T> {
//   data: (year: string) => Promise<T[]>;
//   save: (data: T[]) => Promise<void>;
//   delete: (ids: string[]) => Promise<void>;
//   processing: (data: T[]) => Promise<T>;
// }

// interface IBaseMode<T> extends IModeFunctions<T> {
//   interface: T;
//   hiddenColumns: string[];
// }

// interface IModes {
//   student: IBaseMode<IStudent>;
//   team: IBaseMode<ITeam>;
//   account: IBaseMode<IAccount>;
//   professor: IBaseMode<IProfessor>;
//   hiddenColumns: string[];
// }

// const mode: IModes = {
//   student: {
//     data: (year: string) => getStudent(year),
//     save: (students: IStudent[]) => putStudent(students),
//     delete: (ids: string[]) => deleteStudent(ids),
//     interface: {} as IStudent,
//     hiddenColumns: ["id"],
//     processing: async (data: IStudent[]) => {
//       const teams: ITeam[] = await getTeams("2025");

//     },
//   },
//   team: {
//     data: (year: string) => getTeams(year),
//     save: (teams: ITeam[]) => putTeams(teams),
//     delete: (ids: string[]) => deleteTeams(ids),
//     interface: {} as ITeam,
//     hiddenColumns: ["teamId"],
//   },
//   account: {
//     data: (year: string) => getAccount(year),
//     save: async () => {
//       console.log("Account save not implemented.");
//     },
//     delete: async (ids: string[]) => {
//       console.log(`Account delete for IDs ${ids.join(", ")} not implemented.`);
//     },
//     interface: {} as IAccount,
//     hiddenColumns: [],
//   },
//   professor: {
//     data: (year: string) => getProfessor(),
//     save: async (professors: IProfessor[]) => {
//       console.log(`Professor save not implemented. ${professors}`);
//     },
//     delete: async (ids: string[]) => {
//       console.log(`Professor delete for IDs ${ids.join(", ")} not implemented.`);
//     },
//     interface: {} as IProfessor,
//     hiddenColumns: [],
//   },
//   hiddenColumns: [],
// };

// export default mode;
