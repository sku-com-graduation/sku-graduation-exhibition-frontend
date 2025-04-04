import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Box, Button, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { DataGrid, GridColDef, GridRenderEditCellParams, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import { deleteStudent, getStudent, postStudent, postStudents, putStudent } from "@api/student";
import { getTeams } from "@api/team";
import { IStudent, ITeam } from "@interface";
import { getYearRange } from "@utils/year";

import { parseCSV } from "@utils/parse";

import CsvUploadDialog from "@components/CsvUploadDialog";

interface StudentRow extends IStudent {
  id: string;
  teamName: string;
  isNew?: boolean;
}

const EditToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarQuickFilter />
  </GridToolbarContainer>
);

const StudentGrid = () => {
  const years = getYearRange();

  const [students, setStudents] = useState<IStudent[]>([]);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [modifiedRows, setModifiedRows] = useState<Map<string, StudentRow>>(new Map());
  const [selectionModel, setSelectionModel] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);

  const [dialogOpen, setDialogOpen] = useState(false);

  // 초기 데이터 불러오기
  const fetchData = useCallback(async () => {
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
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddRow = () => {
    const currentYear = new Date().getFullYear();
    if (selectedYear !== currentYear) {
      alert("현재 연도에서만 새 행을 추가할 수 있습니다.");
      return;
    }
    const newId = crypto.randomUUID();
    const newStudent: StudentRow = {
      id: newId,
      encryptedStudentId: newId,
      name: "",
      studentNumber: "",
      role: "MEMBER",
      exhibitionYear: selectedYear.toString(),
      encryptedTeamId: "",
      teamName: "",
      isNew: true,
    };

    setStudents((prev) => [...prev, newStudent]);
    setModifiedRows((prev) => {
      const updated = new Map(prev);
      updated.set(newId, newStudent);
      return updated;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectionModel.length === 0) {
      alert("삭제할 항목을 선택하세요.");
      return;
    }

    const selectedStudents = students.filter((student) => selectionModel.includes(student.encryptedStudentId));

    if (selectedStudents.some((student) => student.encryptedTeamId && student.encryptedTeamId !== "")) {
      alert("팀에 소속된 학생은 삭제할 수 없습니다.");
      return;
    }

    const confirmed = window.confirm(`${selectionModel.length}명 학생을 삭제하시겠습니까?`);
    if (!confirmed) return;

    await deleteStudent(selectionModel);

    setStudents((prev) => prev.filter((student) => !selectionModel.includes(student.encryptedStudentId)));
    setModifiedRows((prev) => {
      const updated = new Map(prev);
      selectionModel.forEach((id) => updated.delete(id));
      return updated;
    });
    setSelectionModel([]);
  };

  // CsvUploadDialog에서 파일 파싱 완료 시 호출되는 핸들러
  const handleFileParsed = async (data: { studentName: string; studentNumber: string }[], file: File) => {
    setLoading(true);
    try {
      await postStudents(data);
      alert("업로드 성공");
      await fetchData();
    } catch (error) {
      alert("업로드 실패, 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (modifiedRows.size === 0) return alert("수정된 내용이 없습니다.");

    try {
      const modifiedList = Array.from(modifiedRows.values());

      const newStudents = modifiedList
        .filter((row) => row.isNew)
        .map((row) => {
          return {
            studentName: row.name,
            studentNumber: row.studentNumber,
          };
        });

      const updatedStudents: IStudent[] = modifiedList
        .filter((row) => !row.isNew)
        .map((row) => {
          const team = teams.find((t) => t.name === row.teamName);
          return {
            encryptedStudentId: row.id,
            encryptedTeamId: team ? team?.encryptedTeamId : null,
            name: row.name,
            studentNumber: row.studentNumber,
            role: row.role,
            exhibitionYear: selectedYear.toString(),
          };
        });

      if (newStudents.length > 0) {
        await Promise.all(newStudents.map((s) => postStudent(s)));
      }

      if (updatedStudents.length > 0) {
        await putStudent(updatedStudents);
      }

      alert("저장 완료");
      setModifiedRows(new Map());
      await fetchData();
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
      <Select
        value={selectedYear}
        onChange={handleChange}
        size="small"
        sx={{ width: 100 }}
        MenuProps={{
          disableScrollLock: true,
        }}
      >
        {years.map((year) => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
      </Select>
    );
  };

  const TeamSelectEditCell = (props: GridRenderEditCellParams<StudentRow>) => {
    const { id, value, field, api } = props;
    const handleChange = (event: SelectChangeEvent<string>) => {
      const newValue = event.target.value === "" ? null : event.target.value;
      api.setEditCellValue({ id, field, value: newValue }, event);
    };
    return (
      <Select value={value ?? ""} onChange={handleChange} fullWidth>
        <MenuItem value="">선택 안 함</MenuItem>
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

    return (
      <Select value={value ?? ""} onChange={handleChange} fullWidth>
        {years.map((year) => (
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
      flex: 1,
      renderEditCell: (params) => <TeamSelectEditCell {...params} />,
    },
    { field: "name", headerName: "이름", editable: true, flex: 1 },
    { field: "studentNumber", headerName: "학번", editable: true, flex: 1 },
    {
      field: "role",
      headerName: "역할",
      editable: true,
      flex: 1,
      renderEditCell: (params) => <RoleSelectEditCell {...params} />,
    },
    {
      field: "exhibitionYear",
      headerName: "전시연도",
      editable: true,
      flex: 1,
      renderEditCell: (params) => <YearCellEdit {...params} />,
    },
  ];

  const rowsWithId: StudentRow[] = Array.isArray(students)
    ? students.map((student) => {
        const modifiedRow = modifiedRows.get(student.encryptedStudentId);
        if (modifiedRow) return modifiedRow;
        const team = teams.find((t) => t.encryptedTeamId === student.encryptedTeamId);
        return {
          ...student,
          id: student.encryptedStudentId,
          teamName: team ? team.name : "",
        };
      })
    : [];

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
        <StyledButton startIcon={<SaveIcon />} variant="outlined" onClick={handleSave}>
          저장
        </StyledButton>
      </Toolbar>

      <DataGrid
        rows={rowsWithId}
        columns={columns}
        loading={loading}
        processRowUpdate={handleRowUpdate}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection as string[])}
        initialState={{
          pagination: { paginationModel: { pageSize: 100 } },
        }}
        checkboxSelection
        disableRowSelectionOnClick
        slots={{ toolbar: EditToolbar }}
      />

      {/* CSV 업로드 모달 */}
      <CsvUploadDialog<{ studentName: string; studentNumber: string }>
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="학생 등록"
        confirmLabel="등록"
        parseCsv={(file) => parseCSV(file, ["studentName", "studentNumber"])}
        onFileParsed={handleFileParsed}
      />
    </Box>
  );
};

export default StudentGrid;

// Styled Components

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
