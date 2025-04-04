import { Box, Button, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { DataGrid, GridColDef, GridRenderEditCellParams, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Save as SaveIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { getTeams, putTeams } from "@api/team";
import { getProfessor } from "@api/professor";
import { IProfessor, ITeam } from "@interface";
import { getYearRange } from "@utils/year";

interface TeamRow extends ITeam {
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
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [professors, setProfessors] = useState<IProfessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modifiedRows, setModifiedRows] = useState<Map<string, TeamRow>>(new Map());
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const teamData = await getTeams(selectedYear.toString());
        setTeams(teamData);
      } catch (error) {
        console.error("팀 데이터 로딩 실패", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profData = await getProfessor();
        setProfessors(profData);
      } catch (error) {
        console.error("교수 데이터 로딩 실패", error);
      }
    };
    fetchData();
  }, []);

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
      const updatedList: ITeam[] = Array.from(modifiedRows.values()).map((row) => {
        const prof = professors.find((p) => p.name === row.professor);
        return {
          encryptedTeamId: row.id,
          encryptedProfessorId: prof ? prof.encryptedProfessorId : row.encryptedProfessorId,
          name: row.name,
          exhibitionYear: selectedYear,
          category: row.category,
        };
      });

      await putTeams(updatedList);
      alert("저장 완료");
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
        <MenuItem value="GAME">GAME</MenuItem>
      </Select>
    );
  };

  // 교수 리스트를 드롭다운으로 수정할 수 있도록 하는 편집 셀
  const ProfessorSelectEditCell = (props: GridRenderEditCellParams<TeamRow>) => {
    const { id, value, field, api } = props;

    const handleChange = (event: SelectChangeEvent<string>) => {
      api.setEditCellValue({ id, field, value: event.target.value }, event);
    };

    return (
      <Select value={value ?? ""} onChange={handleChange} fullWidth>
        {professors.map((prof) => (
          <MenuItem key={prof.encryptedProfessorId} value={prof.name}>
            {prof.name}
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
      const prof = professors.find((p) => p.encryptedProfessorId === team.encryptedProfessorId);
      return {
        ...team,
        id: team.encryptedTeamId,
        professor: prof ? prof.name : "",
      };
    });

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
  backgroundColor: "#fff",
  borderRadius: "12px",
});

const StyledButton = styled(Button)({
  fontSize: "0.85rem",
  padding: "0.4rem 0.7rem",
});
