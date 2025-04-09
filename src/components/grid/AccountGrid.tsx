import { useEffect, useState } from "react";
import styled from "styled-components";
import { Box, Button, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import { IAccountResponse, IAccountRequest } from "@interface";
import { deleteAccount, getAccount, postAccounts } from "@api/account";
import { getYearRange } from "@utils/year";
import { useToast } from "@hooks";
import style from "@style";
import AccountCSVUploader from "@components/csv/AccountCSVUploader";

const EditToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarQuickFilter />
  </GridToolbarContainer>
);

const AccountGrid = () => {
  const [accounts, setAccounts] = useState<IAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectionModel, setSelectionModel] = useState<string[]>([]);

  const years = getYearRange();
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { notifySuccess, notifyInfo, notifyError } = useToast();

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

  const handleDeleteSelected = async () => {
    if (selectionModel.length === 0) {
      notifyInfo("삭제할 항목을 선택하세요.");
      return;
    }

    const confirmed = window.confirm(`${selectionModel.length}개 계정을 삭제하시겠습니까?`);
    if (!confirmed) return;

    await deleteAccount(selectionModel);

    notifySuccess(`계정 삭제 완료`);

    setAccounts((prev) => prev.filter((account) => !selectionModel.includes(account.encryptedAccountId)));
    setSelectionModel([]);
  };

  const handleFileParsed = async (parsed: IAccountRequest[]) => {
    setLoading(true);
    try {
      await postAccounts(parsed);
      notifySuccess("업로드 성공");
      const updatedData = await getAccount(selectedYear.toString());
      setAccounts(updatedData);
    } catch (error) {
      notifyError("업로드 실패, 잠시후 다시 시도해주세요.");
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
        <StyledButton startIcon={<DeleteIcon />} variant="outlined" color="error" onClick={handleDeleteSelected}>
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
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection as string[])}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 100 },
          },
        }}
        checkboxSelection
        disableRowSelectionOnClick
        slots={{ toolbar: EditToolbar }}
      />
      <AccountCSVUploader open={dialogOpen} onClose={() => setDialogOpen(false)} onFileParsed={handleFileParsed} />

      {/* <AccountCSVUploader open={dialogOpen} onClose={() => setDialogOpen(false)} onFileParsed={handleFileParsed} /> */}
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
  backgroundColor: style.color.background,
  width: "100%",
  overflow: "hidden",
  flexWrap: "wrap",
});

const StyledButton = styled(Button)({
  fontSize: "0.85rem",
  padding: "0.4rem 0.7rem",
});
