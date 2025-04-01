import { Box, Button, MenuItem, Select, SelectChangeEvent } from "@mui/material";
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
import { getTeams, putTeams } from "@src/api/team";
import { ITeam } from "@src/interface";
import { getYearRange } from "@src/utils/year";

// ✅ Row 타입
interface TeamRow extends ITeam {
  id: string;
}

const EditToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarQuickFilter />
  </GridToolbarContainer>
);

const TeamGrid = () => {
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [modifiedRows, setModifiedRows] = useState<Map<string, TeamRow>>(new Map());
  const years = getYearRange();
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTeams(selectedYear.toString());
        setTeams(data);
      } catch (error) {
        console.error("팀 데이터 로딩 실패", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

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

  const handleRowUpdate = (newRow: TeamRow, oldRow: TeamRow) => {
    setModifiedRows((prev) => {
      const updated = new Map(prev);
      updated.set(newRow.id, newRow);
      return updated;
    });
    return newRow;
  };

  const handleSave = async () => {
    if (modifiedRows.size === 0) return alert("수정된 내용이 없습니다.");

    try {
      const updatedList: ITeam[] = Array.from(modifiedRows.values()).map((row) => ({
        ...row,
        encryptedTeamId: row.id,
        exhibitionYear: selectedYear,
      }));

      await putTeams(updatedList);
      alert("저장 완료");
      setModifiedRows(new Map());
      window.location.reload();
    } catch (err) {
      console.error("팀 저장 실패", err);
      alert("저장 중 오류 발생");
    }
  };

  const CategorySelectEditCell = (props: GridRenderEditCellParams<TeamRow>) => {
    const { id, value, field, api } = props;

    const handleChange = (event: SelectChangeEvent<string>) => {
      const newValue = event.target.value;
      api.setEditCellValue({ id, field, value: newValue }, event);
    };

    return (
      <Select value={value ?? ""} onChange={handleChange} fullWidth>
        <MenuItem value="MOBILE">MOBILE</MenuItem>
        <MenuItem value="WEB">WEB</MenuItem>
        <MenuItem value="APP">APP</MenuItem>
        <MenuItem value="GAME">GAME</MenuItem>
      </Select>
    );
  };

  const columns: GridColDef<TeamRow>[] = [
    { field: "name", headerName: "팀명", editable: true, width: 200 },
    {
      field: "category",
      headerName: "카테고리",
      editable: true,
      renderEditCell: (params) => <CategorySelectEditCell {...params} />,
      width: 160,
    },
  ];

  const rowsWithId: TeamRow[] =
    teams &&
    teams.map((team) => ({
      ...team,
      id: team.encryptedTeamId,
    }));

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Toolbar>
        <YearSelect />
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
        }}
        checkboxSelection
        disableRowSelectionOnClick
        slots={{ toolbar: EditToolbar }}
      />
    </Box>
  );
};

export default TeamGrid;

// ✅ Toolbar & Styles
const Toolbar = styled(Box)({
  display: "flex",
  justifyContent: "flex-end",
  padding: "0.8rem",
  gap: 8,
  backgroundColor: "#fff",
  borderRadius: "12px",
  marginBottom: "0.5rem",
});

const StyledButton = styled(Button)({
  fontSize: "0.85rem",
  padding: "0.4rem 0.7rem",
});
