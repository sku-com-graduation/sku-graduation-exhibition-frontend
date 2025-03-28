import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Stack,
} from "@mui/material";
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Save as SaveIcon, PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { getProfessor, putProfessor, postProfessor } from "@src/api/professor";
import { IProfessor } from "@src/interface";

interface ProfessorRow extends IProfessor {
  id: string;
}

const EditToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarQuickFilter />
  </GridToolbarContainer>
);

const ProfessorGrid = () => {
  const [professors, setProfessors] = useState<IProfessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modifiedRows, setModifiedRows] = useState<Map<string, ProfessorRow>>(new Map());
  const [openDialog, setOpenDialog] = useState(false);
  const [newProfessor, setNewProfessor] = useState({
    name: "",
    email: "",
    tenure: false,
    profileImage: null as File | null,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProfessor();
        setProfessors(data);
      } catch (error) {
        console.error("교수 데이터 로딩 실패", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRowUpdate = (newRow: ProfessorRow, oldRow: ProfessorRow) => {
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
      const firstModified = Array.from(modifiedRows.values())[0];

      const formData = new FormData();
      formData.append("encryptedProfessorId", firstModified.id);
      formData.append("name", firstModified.name);
      formData.append("email", firstModified.email);
      formData.append("tenure", String(firstModified.tenure));

      if (typeof firstModified.profileImage === "object") {
        formData.append("profileImageFile", firstModified.profileImage);
      }

      await putProfessor(formData);
      alert("저장 완료");
      setModifiedRows(new Map());
      window.location.reload();
    } catch (err) {
      console.error("교수 저장 실패", err);
      alert("저장 중 오류 발생");
    }
  };

  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  const handleNewProfessorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewProfessor((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewProfessor((prev) => ({
        ...prev,
        profileImage: e.target.files![0],
      }));
    }
  };

  const handleAddProfessor = async () => {
    if (!newProfessor.name || !newProfessor.email || !newProfessor.profileImage) {
      alert("모든 항목을 입력해주세요. (프로필 사진 포함)");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProfessor.name);
    formData.append("email", newProfessor.email);
    formData.append("tenure", String(newProfessor.tenure));
    formData.append("profileImage", newProfessor.profileImage);

    try {
      await postProfessor(formData);
      alert("교수 등록 완료");
      setOpenDialog(false);
      window.location.reload();
    } catch (err) {
      console.error("교수 등록 실패", err);
      alert("등록 중 오류 발생");
    }
  };

  const columns: GridColDef<ProfessorRow>[] = [
    { field: "name", headerName: "이름", editable: true, width: 200 },
    { field: "email", headerName: "이메일", editable: true, width: 250 },
    { field: "tenure", headerName: "재직", editable: true, type: "boolean", width: 150 },
    { field: "profileImage", headerName: "프로필 이미지", editable: false, width: 200 },
  ];

  const rowsWithId: ProfessorRow[] = professors.map((prof) => ({
    ...prof,
    id: prof.encryptedProfessorId,
  }));

  const handleImageBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <Toolbar>
        <StyledButton startIcon={<PersonAddIcon />} variant="outlined" onClick={handleDialogOpen}>
          교수 추가
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
        }}
        checkboxSelection
        disableRowSelectionOnClick
        slots={{ toolbar: EditToolbar }}
      />

      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth>
        <DialogTitle sx={{ textAlign: "center" }}>신규 교수 등록</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            mt: 1,
            px: 4,
            py: 3,
          }}
        >
          <Box display="flex" m={1} gap={1} alignItems="flex-start" justifyContent="center">
            {/* 프로필 이미지 업로드 박스 */}
            <Box
              onClick={handleImageBoxClick}
              sx={{
                width: 120,
                height: 120,
                borderRadius: 2,
                border: "2px dashed #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              {newProfessor.profileImage ? (
                <img
                  src={URL.createObjectURL(newProfessor.profileImage)}
                  alt="미리보기"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  사진 업로드
                </Typography>
              )}
            </Box>

            {/* 이름 / 이메일 입력 필드 */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 300 }}>
              <TextField name="name" label="이름" value={newProfessor.name} onChange={handleNewProfessorChange} fullWidth />
              <TextField name="email" label="이메일" value={newProfessor.email} onChange={handleNewProfessorChange} fullWidth />
            </Box>
          </Box>

          <FormControlLabel
            control={<Checkbox name="tenure" checked={newProfessor.tenure} onChange={handleNewProfessorChange} />}
            label="재직 여부"
            sx={{ mt: 2 }}
          />
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button onClick={handleDialogClose}>취소</Button>
          <Button variant="contained" onClick={handleAddProfessor}>
            등록
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfessorGrid;

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
