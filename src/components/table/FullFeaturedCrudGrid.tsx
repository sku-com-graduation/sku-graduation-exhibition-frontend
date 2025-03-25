import React from "react";
const FullFeaturedCrudGrid = ({ mode }: { mode: "student" | "team" | "account" | "professor" }) => {
  return <div>FullFeaturedCrudGrid</div>;
};

export default FullFeaturedCrudGrid;

// import React, { useEffect, useState, useCallback } from "react";
// import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
// import AddIcon from "@mui/icons-material/Add";
// import DeleteIcon from "@mui/icons-material/DeleteOutlined";
// import SaveIcon from "@mui/icons-material/Save";
// import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter, GridRowSelectionModel, GridCellParams } from "@mui/x-data-grid";
// import { randomId } from "@mui/x-data-grid-generator";
// import { SelectCS } from "../Select";
// import { getStudent, putStudent, postStudent, deleteStudent } from "../../api/student";
// import { deleteTeams, getTeams, putTeams } from "../../api/team";
// import { getAccount, postAccount } from "../../api/account";
// import { IAccount, IProfessor, IStudent, ITeam } from "../../interface";
// import { deleteProfessor, getProfessor, putProfessor } from "@src/api/professor";
// import { Typography } from "@mui/material";

// type RowData = (IStudent | ITeam | IAccount | IProfessor) & { id: number | string; isChanged?: string };

// const EditToolbar = () => (
//   <GridToolbarContainer>
//     <GridToolbarQuickFilter />
//   </GridToolbarContainer>
// );

// // 모드에 따라 데이터를 가져오는 함수
// const getDatas = async (mode: "student" | "team" | "account" | "professor") => {
//   const dataFetchers = {
//     student: getStudent,
//     team: getTeams,
//     account: getAccount,
//     professor: getProfessor,
//   };
//   return dataFetchers[mode] ? await dataFetchers[mode]("2025") : [];
// };

// // 모드에 따라 데이터를 저장하는 함수
// const putDatas = async (mode: "student" | "team" | "professor" | "account", updateData: IStudent[] | IAccount[] | IProfessor | ITeam[]) => {
//   console.log(updateData);
//   const dataFetchers = {
//     student: (data: IStudent[]) => putStudent(data),
//     team: (data: ITeam[]) => putTeams(data),
//     professor: (data: IProfessor) => putProfessor(data),
//     account: null,
//   };

//   return dataFetchers[mode] ? await dataFetchers[mode](updateData as any) : [];
// };

// const deleteDatas = async (mode: "student" | "team" | "professor", deleteData: string[]) => {
//   const dataFetchers = {
//     student: deleteStudent,
//     team: deleteTeams,
//     professor: deleteProfessor,
//   };
//   return dataFetchers[mode] ? await dataFetchers[mode](deleteData) : [];
// };

// const createEmptyRow = <T extends RowData>(template: T, id: string): T => {
//   return Object.keys(template).reduce(
//     (acc, key) => {
//       if (key !== "id") {
//         const defaultValue = typeof template[key] === "boolean" ? false : "";
//         acc[key] = defaultValue as T[typeof key];
//       }
//       return acc;
//     },
//     { id } as T
//   );
// };

// const dynamicColumns = (data: RowData[]): GridColDef[] =>
//   data.length
//     ? Object.keys(data[0])
//         .filter((key) => key !== "id")
//         .map((key) => ({
//           field: key,
//           headerName: key.toUpperCase(),
//           flex: 1,
//           editable: true,
//         }))
//     : [];

// export default function FullFeaturedCrudGrid({ mode }: { mode: "student" | "team" | "account" | "professor" }) {
//   const [rows, setRows] = useState<RowData[]>([]);
//   const [columns, setColumns] = useState<GridColDef[]>([]);
//   const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);

//   // 셀 스타일을 conditionally 적용하는 함수
//   const getCellClassName = (params: GridCellParams) => {
//     if (params.row.isChanged === "delete") {
//       return "deleteCell"; // 삭제된 항목에 취소선 및 빨간색
//     } else if (params.row.isChanged === "update") {
//       return "updateCell"; // 업데이트된 항목에 파란색
//     }
//     return "";
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       const data = await getDatas(mode);
//       if (!data) {
//         setRows([]);
//         setColumns([]);
//       } else {
//         const rowsWithId = data.map((d) => ({ ...d, id: randomId() }));
//         setRows(rowsWithId);
//         setColumns(dynamicColumns(rowsWithId));
//       }
//       console.log(JSON.stringify(data, null, 4));
//     };
//     fetchData();
//   }, [mode]);

//   const processRowUpdate = useCallback((newRow: RowData, oldRow: RowData) => {
//     const updatedRow = {
//       ...newRow,
//       isChanged: oldRow.isChanged === "delete" ? "delete" : "update",
//     };
//     setRows((prevRows) => prevRows.map((row) => (row.id === newRow.id ? updatedRow : row)));
//     return updatedRow;
//   }, []);

//   const saveDatas = async () => {
//     if (mode === "account") {
//       alert("계정 데이터는 수정할 수 없습니다.");
//       return;
//     }

//     const updateRows = rows.filter(({ isChanged }) => isChanged === "update").map(({ id, isChanged, ...rest }) => rest);

//     if (updateRows.length) await putDatas(mode as "student" | "team" | "professor", updateRows);
//   };

//   useEffect(() => {
//     console.log(JSON.stringify(rows, null, 4));
//   }, [rows]);

//   const defaultProfessorTemplate: IProfessor = {
//     encryptedProfessorId: "",
//     name: "",
//     email: "",
//     tenure: false,
//     profileImg: "",
//   };

//   const handleAddRow = () => {
//     // rows 배열이 비어있을 경우 기본 템플릿 사용
//     const template = rows.length > 0 ? rows[0] : defaultProfessorTemplate;
//     const newRow = createEmptyRow(template, randomId());
//     const newRows = [newRow, ...rows];
//     setRows(newRows);
//     // 새 rows 배열을 기반으로 열 정보를 다시 생성하여 업데이트
//     setColumns(dynamicColumns(newRows));
//   };

//   const handleDeleteRows = async () => {
//     if (!selectedRows.length) return;
//     const newRows = rows.map((row) => (selectedRows.includes(row.id) ? { ...row, isChanged: "delete" } : row));
//     const deleteRows = newRows.filter(({ isChanged }) => isChanged === "delete").map(({ encryptedStudentId }) => encryptedStudentId);
//     console.log(JSON.stringify(deleteRows, null, 4));
//     try {
//       await deleteDatas(mode as "student" | "team" | "professor", deleteRows);
//       const newRows = rows.filter((row) => !selectedRows.includes(row.id));
//       setRows(newRows);
//       setSelectedRows([]);

//       alert("삭제가 완료되었습니다.");
//     } catch (error) {
//       alert("삭제 실패: " + error);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) setFile(e.target.files[0]);
//   };

//   const handleUpload = async () => {
//     if (!file) return alert("파일을 선택하세요.");
//     setLoading(true);
//     try {
//       if (mode === "student") {
//         const result = await postStudent(file);
//         console.log("Uploaded:", result);
//       } else if (mode === "account") {
//         const result = await postAccount(file);
//         console.log("Uploaded:", result);
//       }
//       alert("업로드 성공");
//     } catch (error) {
//       alert("업로드 실패, 잠시후 다시 시도해주세요.");
//     } finally {
//       window.location.reload();
//     }
//   };

//   return (
//     <Box sx={{ height: "100%", width: "100%", overflow: "hidden" }}>
//       <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 2, mb: 2, alignItems: "center" }}>
//         <SelectCS sx={{ minWidth: 96, fontSize: "0.85rem", p: 0.3 }}>
//           {["2025", "2024", "2023"].map((year) => (
//             <option key={year} value={year}>
//               {year}
//             </option>
//           ))}
//         </SelectCS>

//         <Box
//           sx={{
//             display: "flex",
//             gap: 1,
//             alignItems: "center",
//             justifyContent: "end",
//             boxSizing: "border-box",
//             p: 0.8,
//             borderRadius: 1.5,
//             bgcolor: "#fff",
//             width: "100%",
//             overflow: "hidden",
//             flexWrap: "wrap",
//           }}
//         >
//           {(mode === "student" || mode === "account") && (
//             <Box sx={{ display: "flex", alignItems: "center", gap: 2, border: "1px " }}>
//               <Typography variant="h6" sx={{ color: "#333", fontSize: "1rem", fontWeight: 500, whiteSpace: "nowrap" }}>
//                 등록 업로더
//               </Typography>
//               <input
//                 type="file"
//                 accept=".csv"
//                 onChange={handleFileChange}
//                 style={{
//                   fontSize: "0.85rem",
//                   borderRadius: 0.4,
//                   border: "1px solid #ccc",
//                   padding: "0.3rem 0.5rem",
//                   width: 180,
//                 }}
//               />
//               <Button variant="contained" color="primary" onClick={handleUpload} sx={{ fontSize: "0.85rem", p: "0.4rem 0.7rem" }}>
//                 업로드
//               </Button>
//             </Box>
//           )}
//           {mode === "professor" && (
//             <Button startIcon={<AddIcon />} onClick={handleAddRow} variant="outlined" sx={{ fontSize: "0.85rem", p: "0.4rem 0.7rem" }}>
//               추가
//             </Button>
//           )}
//           <Button
//             startIcon={<DeleteIcon />}
//             onClick={handleDeleteRows}
//             disabled={!selectedRows.length}
//             variant="outlined"
//             color="error"
//             sx={{ fontSize: "0.85rem", p: "0.4rem 0.7rem" }}
//           >
//             삭제
//           </Button>
//           <Button startIcon={<SaveIcon />} onClick={saveDatas} variant="outlined" sx={{ fontSize: "0.85rem", p: "0.4rem 0.7rem" }}>
//             저장
//           </Button>
//         </Box>
//       </Box>

//       <Box sx={{ height: "calc(100% - 6rem)", overflow: "auto" }}>
//         <DataGrid
//           checkboxSelection
//           rows={rows}
//           columns={columns}
//           onRowSelectionModelChange={setSelectedRows}
//           processRowUpdate={processRowUpdate}
//           experimentalFeatures={{ newEditingApi: true }}
//           getCellClassName={getCellClassName}
//           sx={{
//             "& .deleteCell": { color: "red", textDecoration: "line-through" },
//             "& .updateCell": { color: "blue" },
//           }}
//           slots={{ toolbar: EditToolbar }}
//         />
//       </Box>
//     </Box>
//   );
// }
