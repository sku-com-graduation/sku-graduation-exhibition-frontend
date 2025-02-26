import { DataGrid, GridRowModel, GridToolbar } from "@mui/x-data-grid";
import { useState } from "react";
import { Button } from "@mui/material";
import img1 from "../assets/image/img1.jpg";

interface IRow {
  lastName: string;
  firstName: string;
  age: number | null;
  avatar: string | null;
}

const generateRows = (count: number, baseData: IRow) => {
  return Array.from({ length: count }, (_, index) => ({
    ...baseData,
    id: index + 1,
  }));
};

const baseRow: IRow = { lastName: "Roxie", firstName: "Harvey", age: 65, avatar: img1 };

const initialRows = generateRows(10, baseRow);

const AdminPage = () => {
  const [rows, setRows] = useState<typeof initialRows>(initialRows);
  const [modifiedRows, setModifiedRows] = useState<Record<number, (typeof initialRows)[number]>>({});

  // 새로운 행 추가
  const handleAddRow = () => {
    const newId = rows.length ? rows[rows.length - 1].id + 1 : 1;
    const newRow = { id: newId, firstName: "", lastName: "", age: null, avatar: "" };
    setRows([...rows, newRow]);
  };

  // 변경된 행만 저장
  const handleProcessRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = newRow as (typeof initialRows)[number];

    setRows((prevRows) => prevRows.map((row) => (row.id === updatedRow.id ? updatedRow : row)));

    // 변경된 행을 추적하여 저장
    setModifiedRows((prev) => ({
      ...prev,
      [updatedRow.id]: updatedRow,
    }));

    return updatedRow;
  };

  // 변경된 데이터 저장
  const handleSaveChanges = () => {
    const modifiedData = Object.values(modifiedRows);
    console.log("📌 변경된 데이터 저장:", modifiedData);
    alert("변경된 데이터가 저장되었습니다!");
    setModifiedRows({});
  };

  // 이미지 변경 핸들러
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>, rowId: number) => {
    if (!event.target.files?.length) return;

    const file = event.target.files[0];
    const imageUrl = URL.createObjectURL(file); // 선택한 이미지 미리보기 URL 생성

    setRows((prevRows) => prevRows.map((row) => (row.id === rowId ? { ...row, avatar: imageUrl } : row)));

    setModifiedRows((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], avatar: imageUrl },
    }));
  };

  return (
    <div style={{ width: "60rem" }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddRow}
        style={{ marginBottom: "1rem", marginRight: "1rem" }}
      >
        + Add Row
      </Button>
      <Button variant="contained" color="success" onClick={handleSaveChanges}>
        💾 Save Changes
      </Button>
      <DataGrid
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        // slots={{ toolbar: () => <GridToolbarQuickFilter /> }}
        rows={rows}
        columns={[
          { field: "id", headerName: "ID", width: 90, align: "center" },
          {
            field: "avatar",
            headerName: "Avatar",
            width: 100,
            align: "center",
            renderCell: (params) => {
              return (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    id={`avatar-upload-${params.row.id}`}
                    onChange={(e) => handleAvatarChange(e, params.row.id)}
                  />
                  <label htmlFor={`avatar-upload-${params.row.id}`}>
                    <img
                      src={params.value}
                      alt="avatar"
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "50%",
                        cursor: "pointer",
                      }}
                    />
                  </label>
                </div>
              );
            },
          },
          { field: "firstName", headerName: "First name", width: 150, editable: true, align: "center" },
          { field: "lastName", headerName: "Last name", width: 150, editable: true, align: "center" },
          { field: "age", headerName: "Age", type: "number", width: 110, editable: true, align: "center" },
          {
            field: "fullName",
            headerName: "Full name",
            sortable: false,
            width: 160,
            align: "center",
            valueGetter: (value, row) => `${row.firstName || ""} ${row.lastName || ""}`,
          },
        ]}
        processRowUpdate={handleProcessRowUpdate}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 50 },
          },
        }}
        pageSizeOptions={[2]}
        checkboxSelection
        disableRowSelectionOnClick
        sx={{ height: 700 }} // 🔥 여기에 고정 높이 추가
      />
    </div>
  );
};

export default AdminPage;
