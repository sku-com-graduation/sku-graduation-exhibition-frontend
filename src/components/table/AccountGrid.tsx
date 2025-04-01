import { Box, Button, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import { IAccount } from "@src/interface";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { getAccount, postAccount } from "@src/api/account";
import { getYearRange } from "@src/utils/year";

const EditToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarQuickFilter />
  </GridToolbarContainer>
);

const AccountGrid = () => {
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const years = getYearRange();
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentData = await getAccount(selectedYear.toString());

        setAccounts(studentData);
      } catch (error) {
        console.error("데이터 로딩 실패", error);
      } finally {
        setLoading(false); // 로딩 종료
      }
    };
    fetchData();
  }, [selectedYear]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("파일을 선택하세요.");
    setLoading(true);
    try {
      const result = await postAccount(file);
      alert("업로드 성공");
    } catch (error) {
      alert("업로드 실패, 잠시후 다시 시도해주세요.");
    } finally {
      window.location.reload();
    }
  };

  const YearSelect = () => {
    const handleChange = (event: SelectChangeEvent<number>) => {
      setSelectedYear(Number(event.target.value));
    };

    return (
      <Select value={selectedYear} onChange={handleChange} size="small" sx={{ width: 100 }}>
        {years.map((year) => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
      </Select>
    );
  };

  const Toolbar = () => {
    return (
      <ToolbarBox>
        <UploaderBox>
          <Typography variant="h6" sx={{ color: "#333", fontSize: "1rem", fontWeight: 500, whiteSpace: "nowrap" }}>
            등록 업로더
          </Typography>
          <StyledInput type="file" accept=".csv" onChange={handleFileChange} />
          <StyledButton variant="contained" color="primary" onClick={handleUpload}>
            업로드
          </StyledButton>
        </UploaderBox>
        <YearSelect />
        <StyledButton startIcon={<AddIcon />} variant="outlined">
          추가
        </StyledButton>
        <StyledButton startIcon={<DeleteIcon />} variant="outlined" color="error">
          삭제
        </StyledButton>
        <StyledButton startIcon={<SaveIcon />} variant="outlined">
          저장
        </StyledButton>
      </ToolbarBox>
    );
  };

  const columns: GridColDef<IAccount>[] = [
    { field: "teamName", headerName: "팀명", editable: true },
    { field: "userEmail", headerName: "계정", editable: true },
    { field: "recent", headerName: "최근 접속일", editable: true },
  ];

  const rowsWithId =
    accounts &&
    accounts.map((student) => {
      return {
        ...student,
        id: student.encryptedAccountId,
      };
    });

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Toolbar />
      <DataGrid
        rows={rowsWithId}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 100 },
          },
        }}
        checkboxSelection
        disableRowSelectionOnClick
        slots={{ toolbar: EditToolbar }}
      />
    </Box>
  );
};

export default AccountGrid;

const ToolbarBox = styled(Box)({
  display: "flex",
  gap: 8,
  alignItems: "center",
  justifyContent: "flex-end",
  boxSizing: "border-box",
  padding: "0.8rem",
  borderRadius: "12px",
  backgroundColor: "#fff",
  width: "100%",
  overflow: "hidden",
  flexWrap: "wrap",
});

const UploaderBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 16,
});

const StyledInput = styled("input")({
  fontSize: "0.85rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
  padding: "0.3rem 0.5rem",
  width: 180,
});

const StyledButton = styled(Button)({
  fontSize: "0.85rem",
  padding: "0.4rem 0.7rem",
});
