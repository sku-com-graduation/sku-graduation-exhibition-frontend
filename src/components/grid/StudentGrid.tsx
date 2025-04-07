import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Box, Button, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderEditCellParams, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { deleteStudent, getStudents, postStudents, putStudent } from "@api/student";
import { IStudentRequest, IStudentResponseInfo, IStudentResponseTeamInfo } from "@interface";
import { getYearRange } from "@utils/year";
import { parseStudentCSV } from "@utils/parse";
import CSVUploader from "@components/CSVUploader";
import { useToast } from "@hooks";

interface StudentRow extends IStudentResponseInfo {
  id: string;
  teamName: string;
}

const EditToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarQuickFilter />
  </GridToolbarContainer>
);

const StudentGrid = () => {
  const years = getYearRange();

  const [students, setStudents] = useState<IStudentResponseInfo[]>([]);
  const [teams, setTeams] = useState<IStudentResponseTeamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modifiedRows, setModifiedRows] = useState<Map<string, StudentRow>>(new Map());
  const [selectionModel, setSelectionModel] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const { notifySuccess, notifyError, notifyInfo } = useToast();

  // 초기 데이터 불러오기
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudents(selectedYear.toString());
      setStudents(data.students);
      setTeams(data.teams);
    } catch (error) {
      notifyError("데이터 로딩 실패");
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteSelected = async () => {
    if (selectionModel.length === 0) {
      notifyInfo("삭제할 항목을 선택하세요.");
      return;
    }

    const selectedStudents = students.filter((student) => selectionModel.includes(student.encryptedStudentId));

    if (selectedStudents.some((student) => student.encryptedTeamId && student.encryptedTeamId !== "")) {
      notifyInfo("팀에 소속된 학생은 삭제할 수 없습니다.");
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

  const handleStudentPost = async (data: { studentName: string; studentNumber: string }[]) => {
    setLoading(true);
    try {
      await postStudents(data);
      notifySuccess("업로드 성공");
      await fetchData();
    } catch (error) {
      notifyError("업로드 실패, 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (modifiedRows.size === 0) return notifyInfo("수정된 내용이 없습니다.");

    try {
      const modifiedList = Array.from(modifiedRows.values());

      const updatedStudents: IStudentResponseInfo[] = modifiedList.map((row) => ({
        encryptedStudentId: row.id,
        encryptedTeamId: row.encryptedTeamId,
        name: row.name,
        studentNumber: row.studentNumber,
        role: row.role,
        exhibitionYear: selectedYear.toString(),
      }));

      await putStudent(updatedStudents);

      notifySuccess("저장 완료");
      setModifiedRows(new Map());
      await fetchData();
    } catch (err) {
      console.error("저장 실패", err);
      notifyError("저장 중 오류 발생");
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
      api.setEditCellValue({ id, field, value: event.target.value }, event);
    };

    return (
      <Select value={value ?? ""} onChange={handleChange} fullWidth>
        <MenuItem value="">선택 안 함</MenuItem>
        {teams.map((team) => (
          <MenuItem key={team.encryptedTeamId} value={team.encryptedTeamId}>
            {team.teamName}
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
    { field: "studentNumber", headerName: "학번", editable: true, flex: 1 },
    { field: "name", headerName: "이름", editable: true, flex: 1 },
    {
      field: "role",
      headerName: "역할",
      editable: true,
      flex: 1,
      renderEditCell: (params) => <RoleSelectEditCell {...params} />,
    },
    {
      field: "encryptedTeamId",
      headerName: "팀",
      editable: true,
      flex: 1,
      renderCell: (params) => {
        const team = teams.find((team) => team.encryptedTeamId === params.value);
        return team ? team.teamName : "";
      },
      renderEditCell: (params) => <TeamSelectEditCell {...params} />,
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
          teamName: team ? team.teamName : "",
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
      <CSVUploader<IStudentRequest>
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="학생 등록"
        confirmLabel="등록"
        parseCsv={parseStudentCSV}
        manualFields={[
          { field: "studentName", label: "이름" },
          { field: "studentNumber", label: "학번" },
        ]}
        onFileParsed={handleStudentPost}
      />
    </Box>
  );
};

export default StudentGrid;

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
