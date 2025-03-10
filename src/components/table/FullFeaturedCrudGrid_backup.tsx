import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import { SelectCS } from "../input/Select";
import { getStudent, putStudent, postStudent } from "../../api/student";
import { getTeams, putTeams } from "../../api/team";
import { getAccount } from "../../api/account";

import { IAccount, IStudent, ITeam } from "../../interface";

type RowData = (IStudent | ITeam | IAccount) & { id: number | string; isChanged?: boolean };

const EditToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarQuickFilter />
  </GridToolbarContainer>
);

const getDatas = async (mode: "student" | "team" | "account") => {
  const dataFetchers = { student: getStudent, team: getTeams, account: getAccount };
  return dataFetchers[mode] ? await dataFetchers[mode]("2025") : [];
};

const createEmptyRow = <T extends RowData>(template: T, id: string): T => {
  return Object.keys(template).reduce(
    (acc, key) => {
      if (key !== "id") acc[key] = "" as T[typeof key];
      return acc;
    },
    { id } as T
  );
};

const dynamicColumns = (data: RowData[]): GridColDef[] =>
  data.length
    ? Object.keys(data[0])
        .filter((key) => key !== "id")
        .map((key) => ({
          field: key,
          headerName: key.toUpperCase(),
          flex: 1,
          editable: true,
        }))
    : [];

export default function FullFeaturedCrudGrid({ mode }: { mode: "student" | "team" | "account" }) {
  const [rows, setRows] = useState<RowData[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [deletedRows, setDeletedRows] = useState(new Set<string>());
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDatas(mode);
      const rowsWithId = data.map((d) => ({ ...d, id: randomId() }));
      setRows(rowsWithId);
      setColumns(dynamicColumns(rowsWithId));
    };
    fetchData();
  }, [mode]);

  const saveDatas = async () => {
    const modifiedRows = rows.filter(({ id }) => !deletedRows.has(id)).map(({ id, ...rest }) => rest);
    console.log("Saving:", modifiedRows);
    if (mode === "student") await putStudent(modifiedRows);
    if (mode === "team") await putTeams(modifiedRows);
  };

  const handleAddRow = () => {
    if (rows.length === 0) return;
    setRows([...rows, createEmptyRow(rows[0], randomId())]);
  };

  const handleDeleteRows = () => {
    setDeletedRows(new Set([...deletedRows, ...selectedRows]));
    setSelectedRows([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("파일을 선택하세요.");
    try {
      const result = await postStudent(file);
      console.log("Uploaded:", result);
    } catch (error) {
      alert("업로드 실패: " + error);
    }
  };

  return (
    <Box sx={{ height: "100%", width: "100%", overflow: "hidden" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <SelectCS>
            {["2025", "2024", "2023"].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </SelectCS>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <Button onClick={handleUpload}>파일 업로드</Button>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleDeleteRows}
            disabled={!selectedRows.length}
            variant="outlined"
          >
            삭제
          </Button>
          <Button startIcon={<AddIcon />} onClick={handleAddRow} variant="outlined">
            추가
          </Button>
          <Button startIcon={<SaveIcon />} onClick={saveDatas} variant="outlined">
            저장
          </Button>
        </Box>
      </Box>

      <Box sx={{ height: "calc(100% - 72px)", overflow: "auto" }}>
        {/* Adjust this value as necessary */}
        <DataGrid
          checkboxSelection
          rows={rows}
          columns={columns}
          onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
          slots={{ toolbar: EditToolbar }}
        />
      </Box>
    </Box>
  );
}
