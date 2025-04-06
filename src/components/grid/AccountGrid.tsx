import { useEffect, useState } from "react";
import styled from "styled-components";
import { Box, Button, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import { IAccountResponse, ICreateAccountRequest } from "@interface";
import { getAccount, postAccounts } from "@api/account";
import { getYearRange } from "@utils/year";
import CSVUploader from "@components/CSVUploader";
import { parseAccountCSV } from "@utils/parse";

const EditToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarQuickFilter />
  </GridToolbarContainer>
);

const AccountGrid = () => {
  const [accounts, setAccounts] = useState<IAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const years = getYearRange();
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const accountData = await getAccount(selectedYear.toString());
        setAccounts(accountData);
      } catch (error) {
        console.error("데이터 로딩 실패", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

  const handleFileParsed = async (parsed: ICreateAccountRequest[]) => {
    setLoading(true);
    try {
      await postAccounts(parsed);
      alert("업로드 성공");
      const updatedData = await getAccount(selectedYear.toString());
      setAccounts(updatedData);
    } catch (error) {
      alert("업로드 실패, 잠시후 다시 시도해주세요.");
    } finally {
      setLoading(false);
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

  const columns: GridColDef<IAccountResponse>[] = [
    { field: "userEmail", headerName: "계정", editable: false, flex: 1 },
    { field: "teamName", headerName: "팀명", editable: false, flex: 1 },
    { field: "recent", headerName: "최근 접속일", editable: false, flex: 1 },
  ];

  const rowsWithId =
    accounts &&
    accounts.map((account) => ({
      ...account,
      id: account.encryptedAccountId,
    }));

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Toolbar>
        <YearSelect />
        <StyledButton startIcon={<AddIcon />} variant="outlined" onClick={() => setDialogOpen(true)}>
          추가
        </StyledButton>
        <StyledButton startIcon={<DeleteIcon />} variant="outlined" color="error">
          삭제
        </StyledButton>
        <StyledButton startIcon={<SaveIcon />} variant="outlined">
          저장
        </StyledButton>
      </Toolbar>

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

      <CSVUploader<ICreateAccountRequest>
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="계정 등록"
        confirmLabel="등록"
        parseCsv={parseAccountCSV}
        onFileParsed={handleFileParsed}
      />
    </Box>
  );
};

export default AccountGrid;

const Toolbar = styled(Box)({
  display: "flex",
  gap: 8,
  justifyContent: "flex-end",
  boxSizing: "border-box",
  padding: "0.8rem",
  borderRadius: "12px",
  backgroundColor: "#fff",
  width: "100%",
  overflow: "hidden",
  flexWrap: "wrap",
});

const StyledButton = styled(Button)({
  fontSize: "0.85rem",
  padding: "0.4rem 0.7rem",
});
