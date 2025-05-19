import { Box, Button, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderEditCellParams,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { deleteTeams, getTeams, putTeams } from "@api/team";
import { ITeamData, ITeamProfessorData } from "@interface";
import { getYearRange } from "@utils/year";
import { useToast } from "@hooks";
import style from "@style";

interface TeamRow extends ITeamData {
  id: string;
  professor: string;
}

const EditToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarQuickFilter />
  </GridToolbarContainer>
);

const TeamGrid = () => {
  const years = getYearRange();
  const [teams, setTeams] = useState<ITeamData[]>([]);
  const [professors, setProfessors] = useState<ITeamProfessorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modifiedRows, setModifiedRows] = useState<Map<string, TeamRow>>(new Map());
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);
  const { notifySuccess, notifyInfo, notifyError } = useToast();
  const [selectionModel, setSelectionModel] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getTeams(selectedYear.toString());
      setTeams(data.teams);
      setProfessors(data.professors);
    } catch (error) {
      notifyError("팀 데이터 로딩 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleDeleteSelected = async () => {
    if (selectionModel.length === 0) {
      notifyInfo("삭제할 항목을 선택하세요.");
      return;
    }

    const confirmed = window.confirm(`${selectionModel.length}개 팀을 삭제하시겠습니까?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteTeams(selectionModel);
      setTeams((prev) => prev.filter((team) => !selectionModel.includes(team.encryptedTeamId)));
      setSelectionModel([]);
      notifySuccess("팀 삭제 완료");
    } catch (err) {
      notifyError("팀 삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (modifiedRows.size === 0) {
      notifyInfo("수정된 내용이 없습니다.");
      return;
    }

    setLoading(true);
    try {
      const updatedList: ITeamData[] = Array.from(modifiedRows.values()).map((row) => {
        const prof = professors.find((p) => p.professorName === row.professor);
        return {
          encryptedTeamId: row.id,
          encryptedProfessorId: prof ? prof.encryptedProfessorId : row.encryptedProfessorId,
          name: row.name,
          exhibitionYear: selectedYear,
          category: row.category,
        };
      });

      await putTeams(updatedList);
      await fetchData();
      setModifiedRows(new Map());
      notifySuccess("저장 완료");
    } catch (err) {
      notifyError("저장 중 오류 발생");
    } finally {
      setLoading(false);
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
        <MenuItem value="GAME">GAME</MenuItem>
      </Select>
    );
  };

  const ProfessorSelectEditCell = (props: GridRenderEditCellParams<TeamRow>) => {
    const { id, value, field, api } = props;

    const handleChange = (event: SelectChangeEvent<string>) => {
      api.setEditCellValue({ id, field, value: event.target.value }, event);
    };

    return (
      <Select value={value ?? ""} onChange={handleChange} fullWidth>
        {professors &&
          professors.map((prof) => (
            <MenuItem key={prof.encryptedProfessorId} value={prof.professorName}>
              {prof.professorName}
            </MenuItem>
          ))}
      </Select>
    );
  };

  const columns: GridColDef<TeamRow>[] = [
    { field: "name", headerName: "팀명", editable: true, flex: 1 },
    {
      field: "category",
      headerName: "카테고리",
      editable: true,
      renderEditCell: (params) => <CategorySelectEditCell {...params} />,
      flex: 1,
    },
    {
      field: "professor",
      headerName: "지도교수",
      editable: true,
      renderEditCell: (params) => <ProfessorSelectEditCell {...params} />,
      flex: 1,
    },
  ];

  // 팀 데이터를 표시할 때, encryptedProfessorId로 교수 이름을 매핑
  const rowsWithId: TeamRow[] =
    teams &&
    teams.map((team) => {
      const modifiedTeam = modifiedRows.get(team.encryptedTeamId);
      if (modifiedTeam) return modifiedTeam;
      const prof = professors && professors.find((p) => p.encryptedProfessorId === team.encryptedProfessorId);
      return {
        ...team,
        id: team.encryptedTeamId,
        professor: prof ? prof.professorName : "",
      };
    });

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Toolbar>
        <YearSelect />
        <StyledButton startIcon={<DeleteIcon />} variant="outlined" color="error" onClick={handleDeleteSelected}>
          삭제
        </StyledButton>
        <StyledButton startIcon={<SaveIcon />} variant="outlined" onClick={handleSave}>
          저장
        </StyledButton>
      </Toolbar>
      <DataGrid
        rows={rowsWithId}
        columns={columns}
        loading={loading}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection as string[])}
        processRowUpdate={handleRowUpdate}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 50 },
          },
          // sorting: {
          //   sortModel: [{ field: "name", sort: "asc" }],
          // },
        }}
        checkboxSelection
        disableRowSelectionOnClick
        slots={{ toolbar: EditToolbar }}
      />
    </Box>
  );
};

export default TeamGrid;

const Toolbar = styled(Box)({
  display: "flex",
  justifyContent: "flex-end",
  padding: "0.8rem",
  gap: 8,
  backgroundColor: style.color.background,
  borderRadius: "12px",
});

const StyledButton = styled(Button)({
  fontSize: "0.85rem",
  padding: "0.4rem 0.7rem",
});
