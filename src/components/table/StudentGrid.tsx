import { Box, Button, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRenderEditCellParams, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import { getStudent, postStudent, putStudent } from "@src/api/student";
import { getTeams } from "@src/api/team";
import { IStudent, ITeam } from "@src/interface";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { getYearRange } from "@src/utils/year";

interface StudentRow extends IStudent {
  id: string;
  teamName: string;
}

const EditToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarQuickFilter />
  </GridToolbarContainer>
);

const StudentGrid = () => {
  const [students, setStudents] = useState<IStudent[]>([]);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [modifiedRows, setModifiedRows] = useState<Map<string, StudentRow>>(new Map());

  const years = getYearRange();
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentData = await getStudent(selectedYear.toString());
        const teamData = await getTeams(selectedYear.toString());
        setStudents(studentData);
        setTeams(teamData);
      } catch (error) {
        console.error("데이터 로딩 실패", error);
      } finally {
        setLoading(false);
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
      const result = await postStudent(file);
      console.log("Uploaded:", result);
      alert("업로드 성공");
    } catch (error) {
      alert("업로드 실패, 잠시후 다시 시도해주세요.");
    } finally {
      window.location.reload();
    }
  };

  const handleSave = async () => {
    if (modifiedRows.size === 0) return alert("수정된 내용이 없습니다.");

    try {
      const updatedList: IStudent[] = Array.from(modifiedRows.values()).map((row) => {
        const team = teams.find((t) => t.name === row.teamName);
        return {
          ...row,
          encryptedTeamId: team?.encryptedTeamId || "",
          encryptedStudentId: row.id,
        };
      });

      await putStudent(updatedList);
      alert("저장 완료");
      setModifiedRows(new Map());
      window.location.reload();
    } catch (err) {
      console.error("저장 실패", err);
      alert("저장 중 오류 발생");
    }
  };

  const handleRowUpdate = (newRow: StudentRow, oldRow: StudentRow) => {
    setModifiedRows((prev) => {
      const updated = new Map(prev);
      updated.set(newRow.id, newRow);
      return updated;
    });
    return newRow;
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

  const Toolbar = () => (
    <ToolbarBox>
      <UploaderBox>
        <Typography
          variant="h6"
          sx={{
            color: "#333",
            fontSize: "1rem",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
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
      <StyledButton startIcon={<SaveIcon />} variant="outlined" onClick={handleSave}>
        저장
      </StyledButton>
    </ToolbarBox>
  );

  const TeamSelectEditCell = (props: GridRenderEditCellParams<StudentRow>) => {
    const { id, value, field, api } = props;
    const handleChange = (event: SelectChangeEvent<string>) => {
      api.setEditCellValue({ id, field, value: event.target.value }, event);
    };
    return (
      <Select value={value ?? ""} onChange={handleChange} fullWidth>
        {teams.map((team) => (
          <MenuItem key={team.encryptedTeamId} value={team.name}>
            {team.name}
          </MenuItem>
        ))}
      </Select>
    );
  };

  const RoleSelectEditCell = (props: GridRenderEditCellParams<StudentRow>) => {
    const { id, value, field, api } = props;
    const handleChange = (event: SelectChangeEvent<string>) => {
      api.setEditCellValue({ id, field, value: event.target.value }, event);
    };
    return (
      <Select value={value ?? ""} onChange={handleChange} fullWidth>
        <MenuItem value="MEMBER">MEMBER</MenuItem>
        <MenuItem value="LEADER">LEADER</MenuItem>
      </Select>
    );
  };

  const YearCellEdit = (props: GridRenderEditCellParams<StudentRow>) => {
    const { id, value, field, api } = props;
    const handleChange = (event: SelectChangeEvent<number>) => {
      api.setEditCellValue({ id, field, value: parseInt(event.target.value as string, 10) }, event);
    };
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
    return (
      <Select value={value ?? ""} onChange={handleChange} fullWidth>
        {yearOptions.map((year) => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
      </Select>
    );
  };

  const columns: GridColDef<StudentRow>[] = [
    {
      field: "teamName",
      headerName: "팀",
      editable: true,
      renderEditCell: (params) => <TeamSelectEditCell {...params} />,
    },
    { field: "name", headerName: "이름", editable: true },
    { field: "studentNumber", headerName: "학번", editable: true },
    {
      field: "role",
      headerName: "역할",
      editable: true,
      renderEditCell: (params) => <RoleSelectEditCell {...params} />,
    },
    {
      field: "exhibitionYear",
      headerName: "전시연도",
      editable: true,
      renderEditCell: (params) => <YearCellEdit {...params} />,
    },
  ];

  const rowsWithId: StudentRow[] =
    students &&
    students.map((student) => {
      const team = teams.find((t) => t.encryptedTeamId === student.encryptedTeamId);
      return {
        ...student,
        id: student.encryptedStudentId,
        teamName: team ? team.name : "",
      };
    });

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Toolbar />
      <DataGrid
        rows={rowsWithId}
        columns={columns}
        loading={loading}
        processRowUpdate={handleRowUpdate}
        initialState={{
          pagination: { paginationModel: { pageSize: 100 } },
        }}
        checkboxSelection
        disableRowSelectionOnClick
        slots={{ toolbar: EditToolbar }}
      />
    </Box>
  );
};

export default StudentGrid;

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
