import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderEditCellParams,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Save as SaveIcon } from "@mui/icons-material";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { getHomeInfoAll, putHomeInfo, postHomeInfo } from "@api/home";
import { IHomeResponse } from "@interface";
import style from "@style";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/ko";
import dayjs, { Dayjs } from "dayjs";
import { useToast } from "@hooks";
dayjs.locale("ko");

const EditToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarQuickFilter />
  </GridToolbarContainer>
);

interface HomeRow extends IHomeResponse {
  id: string;
  isNew?: boolean;
}

const renderDateEditCell = (params: GridRenderEditCellParams<HomeRow>) => {
  const value = params.value;
  const date: Dayjs | null = value ? dayjs(value, "YYYY.MM.DD") : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={date}
        onChange={(newValue) => {
          const formatted = newValue ? newValue.format("YYYY.MM.DD") : "";
          params.api.setEditCellValue({ id: params.id, field: params.field, value: formatted });
        }}
        slotProps={{ textField: { variant: "standard", fullWidth: true } }}
      />
    </LocalizationProvider>
  );
};

const renderTimeEditCell = (params: GridRenderEditCellParams<HomeRow>) => {
  return (
    <TextField
      variant="standard"
      fullWidth
      value={params.value || ""}
      onChange={(e) => {
        params.api.setEditCellValue({ id: params.id, field: params.field, value: e.target.value });
      }}
    />
  );
};

const HomeGrid = () => {
  const [homeInfo, setHomeInfo] = useState<IHomeResponse[]>([]);
  const [modifiedRows, setModifiedRows] = useState<Map<string, HomeRow>>(new Map());
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const { notifySuccess, notifyInfo, notifyError } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const homeData = await getHomeInfoAll();
      if (Array.isArray(homeData)) {
        setHomeInfo(homeData);
      } else {
        setHomeInfo([]);
      }
    } catch (error) {
      notifyError("홈 데이터 로딩 실패");
      console.error("홈 데이터 로딩 실패", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowUpdate = (newRow: HomeRow, oldRow: HomeRow) => {
    setModifiedRows((prev) => {
      const updated = new Map(prev);
      updated.set(newRow.id, newRow);
      return updated;
    });
    return newRow;
  };

  const handleSave = async () => {
    if (modifiedRows.size === 0) return notifyInfo("수정된 내용이 없습니다.");

    try {
      const newRows: IHomeResponse[] = [];
      const existingRows: IHomeResponse[] = [];

      for (const row of modifiedRows.values()) {
        const data: IHomeResponse = {
          encryptedHomeId: row.encryptedHomeId,
          exhibitionYear: row.exhibitionYear,
          exhibitionDate: row.exhibitionDate,
          exhibitionHour: row.exhibitionHour,
        };

        if (row.isNew) {
          newRows.push(data);
        } else {
          existingRows.push(data);
        }
      }

      await postHomeInfo(newRows);
      for (const data of existingRows) {
        await putHomeInfo(data);
      }

      notifySuccess("저장 완료");
      setModifiedRows(new Map());
      fetchData();
    } catch (err) {
      console.error("홈 저장 실패", err);
      notifyError("저장 중 오류 발생. 잠시후 재시도 하세요.");
    }
  };

  const columns: GridColDef<HomeRow>[] = [
    {
      field: "exhibitionYear",
      headerName: "전시 연도",
      editable: false,
      flex: 1,
    },
    {
      field: "exhibitionDate",
      headerName: "전시 날짜",
      editable: true,
      flex: 1,
      renderEditCell: renderDateEditCell,
    },
    {
      field: "exhibitionHour",
      headerName: "전시 시간",
      editable: true,
      flex: 1,
      renderEditCell: renderTimeEditCell,
    },
  ];

  const rowsWithId: HomeRow[] = Array.isArray(homeInfo)
    ? homeInfo.map((h) => {
        const modifiedHome = modifiedRows.get(h.encryptedHomeId);
        return {
          ...(modifiedHome ?? h),
          id: h.encryptedHomeId || `new-${h.exhibitionYear}`,
        };
      })
    : [];

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Toolbar>
        <StyledButton variant="outlined" onClick={() => setDialogOpen(true)}>
          추가
        </StyledButton>

        <StyledButton startIcon={<SaveIcon />} variant="outlined" onClick={handleSave}>
          저장
        </StyledButton>
      </Toolbar>
      <DataGrid
        rows={rowsWithId}
        columns={columns}
        loading={loading}
        processRowUpdate={handleRowUpdate}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 50 },
          },
          // sorting: {
          //   sortModel: [{ field: "exhibitionYear", sort: "desc" }],
          // },
        }}
        checkboxSelection
        disableRowSelectionOnClick
        slots={{ toolbar: EditToolbar }}
      />
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>전시 연도 추가</DialogTitle>
        <DialogContent>
          <TextField
            type="number"
            label="전시 연도"
            fullWidth
            value={newYear}
            onChange={(e) => setNewYear(Number(e.target.value))}
            inputProps={{
              min: 2000,
              max: new Date().getFullYear(),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button
            onClick={() => {
              const yearStr = String(newYear);
              const allYears = [...homeInfo, ...modifiedRows.values()].map((r) => r.exhibitionYear);
              if (allYears.includes(yearStr)) {
                notifyInfo(`${yearStr}년은 이미 존재합니다.`);
                return;
              }

              const newRow: HomeRow = {
                id: `new-${Date.now()}`,
                encryptedHomeId: "",
                exhibitionYear: yearStr,
                exhibitionDate: "",
                exhibitionHour: "",
                isNew: true,
              };

              setHomeInfo((prev) => [...prev, newRow]);
              setModifiedRows((prev) => {
                const updated = new Map(prev);
                updated.set(newRow.id, newRow);
                return updated;
              });
              setDialogOpen(false);
            }}
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomeGrid;

const Toolbar = styled(Box)({
  display: "flex",
  justifyContent: "flex-end",
  padding: "0.8rem",
  gap: 8,
  backgroundColor: style.color.background,
  borderRadius: "12px",
  marginBottom: "0.5rem",
});

const StyledButton = styled(Button)({
  fontSize: "0.85rem",
  padding: "0.4rem 0.7rem",
});
