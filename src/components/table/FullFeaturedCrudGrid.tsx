import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridToolbarQuickFilter,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import { SelectCS } from "../input/Select";
import { getStudent, postStudent } from "../../api/student";
import { getTeams } from "../../api/team";
import { getAccount } from "../../api/account";
import IStudent from "../../types/IStudent";
import { ITeam } from "../../types/ITeam";
import { IAccount } from "../../types/IAccount";

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
  }
}

function EditToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}

const getDatas = async (mode: string) => {
  switch (mode) {
    case "student":
      return await getStudent("2025");
    case "team":
      return await getTeams("2025");
    case "account":
      return await getAccount("2025");
    default:
      return [];
  }
};

// const dynamicColumns = (data: IStudent[] | ITeam[] | IAccount[]): GridColDef[] => {
//   return data.length > 0
//     ? Object.keys(data[0]).map((key) => ({
//         field: key,
//         headerName: key.charAt(0).toUpperCase() + key.slice(1),
//         width: 180,
//         editable: true,
//       }))
//     : [];
// };

interface IStudentId extends IStudent {
  id: number;
}

interface ITeamId extends ITeam {
  id: number;
}

interface IAccountId extends IAccount {
  id: number;
}

const dynamicColumns = (data: IStudentId[] | ITeamId[] | IAccountId[]): GridColDef[] => {
  return data.length > 0
    ? Object.keys(data[0]).map((key) => ({
        field: key,
        headerName: key.charAt(0).toUpperCase() + key.slice(1),
        width: 180,
        editable: true,
      }))
    : [];
};

export default function FullFeaturedCrudGrid(props: { mode: "student" | "team" | "account" }) {
  const menuMode = props.mode;

  const [rows, setRows] = useState<IStudent[] | ITeam[] | IAccount[]>([]);
  const [idRows, setIdRows] = useState<IStudentId[] | ITeamId[] | IAccountId[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDatas(menuMode);
      console.log(JSON.stringify(data, null, 4));
      const addIdData = data.map((d, index) => ({ ...d, id: index })) as IStudentId[] | ITeamId[] | IAccountId[];

      setRows(data);
      setIdRows(addIdData);
      setColumns(dynamicColumns(addIdData));
    };

    fetchData();
  }, [menuMode]);

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]); // ✅ 선택된 행 저장

  // ✅ 선택된 행 삭제
  const handleBulkDelete = () => {
    setRows(idRows.filter((row) => !selectedRows.includes(row.id)));
    setSelectedRows([]); // 삭제 후 선택 초기화
  };

  const handleRowSelection = (newSelection: GridRowSelectionModel) => {
    setSelectedRows([...newSelection]); // ❗ 배열을 복사하여 새로운 상태로 저장
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setIdRows(idRows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  // const handleClick = () => {
  //   const id = randomId();
  //   setRows((oldRows) => [...oldRows, { id, name: "", age: "", role: "", isNew: true }]);
  //   setRowModesModel((oldModel) => ({
  //     ...oldModel,
  //     [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
  //   }));
  // };

  const handleClick = () => {
    const id = randomId();

    setRows((oldRows) => {
      if (oldRows.length === 0) return oldRows; // 기존 데이터가 없으면 추가하지 않음

      // 기존 데이터의 필드 구조를 동적으로 가져와 새 행 생성
      const newRow: any = { id };

      Object.keys(oldRows[0]).forEach((key) => {
        if (key !== "id") newRow[key] = ""; // id 제외한 필드는 빈 문자열로 초기화
      });

      return [...oldRows, newRow];
    });

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
    }));
  };

  const [tfile, setTfile] = useState<File>();
  const fileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const f = event.target?.files?.[0];
    if (f) {
      setTfile(f);
    }
  };

  const submit = async () => {
    try {
      if (tfile) {
        const student = await postStudent(tfile);
        console.log(student);
      } else {
        alert("파일 확인");
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <Box sx={{ height: "auto", width: "100%" }}>
      <div>
        <input type="file" accept=".csv" onChange={fileChange} />
        <Button onClick={submit}>보내기</Button>

        <SelectCS>
          <option value="" disabled hidden>
            전시 연도
          </option>
          {["2025", "2024", "2023"].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </SelectCS>
        <Button color="primary" startIcon={<AddIcon />} onClick={handleClick} variant="outlined">
          추가
        </Button>
        <Button
          color="primary"
          startIcon={<DeleteIcon />}
          onClick={handleBulkDelete}
          disabled={selectedRows.length === 0}
          variant="outlined"
        >
          삭제
        </Button>
        <Button color="primary" startIcon={<SaveIcon />} onClick={handleClick} variant="outlined">
          저장
        </Button>
      </div>
      <DataGrid
        checkboxSelection={true}
        rows={idRows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        onRowSelectionModelChange={handleRowSelection} // ✅ 체크박스로 선택된 행 추적
        processRowUpdate={processRowUpdate}
        slots={{ toolbar: EditToolbar }}
        slotProps={{
          toolbar: { setRowModesModel },
        }}
      />
    </Box>
  );
}

// import React, { useEffect, useState } from "react";
// import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
// import AddIcon from "@mui/icons-material/Add";
// import DeleteIcon from "@mui/icons-material/DeleteOutlined";
// import SaveIcon from "@mui/icons-material/Save";
// import {
//   GridRowsProp,
//   GridRowModesModel,
//   GridRowModes,
//   DataGrid,
//   GridColDef,
//   GridToolbarContainer,
//   GridEventListener,
//   GridRowId,
//   GridRowModel,
//   GridRowEditStopReasons,
//   GridToolbarQuickFilter,
//   GridRowSelectionModel,
// } from "@mui/x-data-grid";
// import { randomId } from "@mui/x-data-grid-generator";
// import { SelectCS } from "../input/Select";
// import { getStudent, postStudent } from "../../api/student";
// import { getTeams } from "../../api/team";
// import { getAccount } from "../../api/account";
// import IStudent from "../../types/IStudent";
// import { ITeam } from "../../types/ITeam";
// import { IAccount } from "../../types/IAccount";

// declare module "@mui/x-data-grid" {
//   interface ToolbarPropsOverrides {
//     setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
//     setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
//   }
// }

// function EditToolbar() {
//   return (
//     <GridToolbarContainer>
//       <GridToolbarQuickFilter />
//     </GridToolbarContainer>
//   );
// }

// const getDatas = async (mode: string) => {
//   switch (mode) {
//     case "student":
//       return await getStudent("2025");
//     case "team":
//       return await getTeams("2025");
//     case "account":
//       return await getAccount("2025");
//     default:
//       return [];
//   }
// };

// export default function FullFeaturedCrudGrid(props: { mode: "student" | "team" | "account" }) {
//   const menuMode = props.mode;

//   const [rows, setRows] = useState<IStudent[] | ITeam[] | IAccount[]>([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const data = await getDatas(menuMode);
//       const addIdData = data.map((d, index) => ({ ...d, id: index })); // id가 없으면 randomId 추가

//       setRows(addIdData); // 데이터를 받아와서 setRows에 전달
//     };

//     fetchData();
//   }, [menuMode]);

//   // 동적으로 columns 생성하기
//   const dynamicColumns: GridColDef[] =
//     rows.length > 0
//       ? Object.keys(rows[0]).map((key) => ({
//           field: key,
//           headerName: key.charAt(0).toUpperCase() + key.slice(1), // 첫 글자 대문자로 설정
//           width: 180,
//           editable: true,
//         }))
//       : [];

//   const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
//   const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]); // ✅ 선택된 행 저장

//   // ✅ 선택된 행 삭제
//   const handleBulkDelete = () => {
//     setRows(rows.filter((row) => !selectedRows.includes(row.id)));
//     setSelectedRows([]); // 삭제 후 선택 초기화
//   };

//   const handleRowSelection = (newSelection: GridRowSelectionModel) => {
//     setSelectedRows([...newSelection]); // ❗ 배열을 복사하여 새로운 상태로 저장
//   };

//   useEffect(() => {
//     console.log(JSON.stringify(rows, null, 4));
//   }, [rows]);

//   const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
//     if (params.reason === GridRowEditStopReasons.rowFocusOut) {
//       event.defaultMuiPrevented = true;
//     }
//   };

//   const processRowUpdate = (newRow: GridRowModel) => {
//     const updatedRow = { ...newRow, isNew: false };
//     setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
//     return updatedRow;
//   };

//   const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
//     setRowModesModel(newRowModesModel);
//   };

//   const handleClick = () => {
//     const id = randomId();
//     setRows((oldRows) => [...oldRows, { id, name: "", age: "", role: "", isNew: true }]);
//     setRowModesModel((oldModel) => ({
//       ...oldModel,
//       [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
//     }));
//   };

//   const [tfile, setTfile] = useState<File>();
//   const fileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const f = event.target?.files?.[0];
//     if (f) {
//       setTfile(f);
//     }
//   };

//   const submit = async () => {
//     try {
//       if (tfile) {
//         const student = await postStudent(tfile);
//         console.log(student);
//       } else {
//         alert("파일 확인");
//       }
//     } catch (error) {
//       alert(error);
//     }
//   };

//   return (
//     <Box sx={{ height: "auto", width: "100%" }}>
//       <div>
//         <input type="file" accept=".csv" onChange={fileChange} />
//         <Button onClick={submit}>보내기</Button>

//         <SelectCS>
//           <option value="" disabled hidden>
//             전시 연도
//           </option>
//           {["2025", "2024", "2023"].map((y) => (
//             <option key={y} value={y}>
//               {y}
//             </option>
//           ))}
//         </SelectCS>
//         <Button color="primary" startIcon={<AddIcon />} onClick={handleClick} variant="outlined">
//           추가
//         </Button>
//         <Button
//           color="primary"
//           startIcon={<DeleteIcon />}
//           onClick={handleBulkDelete}
//           disabled={selectedRows.length === 0}
//           variant="outlined"
//         >
//           삭제
//         </Button>
//         <Button color="primary" startIcon={<SaveIcon />} onClick={handleClick} variant="outlined">
//           저장
//         </Button>
//       </div>
//       <DataGrid
//         checkboxSelection={true}
//         rows={rows}
//         columns={dynamicColumns}
//         editMode="row"
//         rowModesModel={rowModesModel}
//         onRowModesModelChange={handleRowModesModelChange}
//         onRowEditStop={handleRowEditStop}
//         onRowSelectionModelChange={handleRowSelection} // ✅ 체크박스로 선택된 행 추적
//         processRowUpdate={processRowUpdate}
//         slots={{ toolbar: EditToolbar }}
//         slotProps={{
//           toolbar: { setRowModesModel },
//         }}
//       />
//     </Box>
//   );
// }
