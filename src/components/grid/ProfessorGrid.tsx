import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
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
} from "@mui/material";
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Delete as DeleteIcon, Save as SaveIcon, PersonAdd as PersonAddIcon } from "@mui/icons-material";

import { getProfessor, putProfessor, postProfessor, deleteProfessor } from "@api/professor";
import { IProfessor } from "@interface";
import { useToast } from "@hooks";
import style from "@style";
import { urlToFile } from "@utils/File";

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
  const [selectionModel, setSelectionModel] = useState<string[]>([]);
  const [newProfessor, setNewProfessor] = useState<{
    name: string;
    email: string;
    tenure: boolean;
    profileImagePreview: string;
    profileImageFile: File | null;
  }>({
    name: "",
    email: "",
    tenure: false,
    profileImagePreview: "",
    profileImageFile: null,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputMapRef = useRef<Map<string, HTMLInputElement>>(new Map());
  const { notifySuccess, notifyInfo, notifyError } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProfessor();
        setProfessors(data);
      } catch (error) {
        notifyError("교수 데이터 로딩 실패");
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

  const handleRowImageChange = (professorId: string, file: File) => {
    const imageUrl = URL.createObjectURL(file);

    setProfessors((prev) =>
      prev.map((prof) => (prof.encryptedProfessorId === professorId ? { ...prof, profileImage: imageUrl } : prof))
    );

    setModifiedRows((prev) => {
      const updated = new Map(prev);

      const existing = prev.get(professorId) || professors.find((p) => p.encryptedProfessorId === professorId);

      if (existing) {
        updated.set(professorId, {
          ...existing,
          profileImage: imageUrl,
          id: professorId,
        });
      }

      return updated;
    });
  };

  const handleImageClick = (professorId: string) => {
    const input = fileInputMapRef.current.get(professorId);
    input?.click();
  };

  const handleImageInputChange = (professorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleRowImageChange(professorId, e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (modifiedRows.size === 0) return notifyInfo("수정된 내용이 없습니다.");

    setLoading(true);
    try {
      for (const modifiedProf of modifiedRows.values()) {
        const formdata = new FormData();
        formdata.append("encryptedProfessorId", modifiedProf.encryptedProfessorId);
        formdata.append("name", modifiedProf.name);
        formdata.append("email", modifiedProf.email);
        formdata.append("tenure", String(modifiedProf.tenure));

        const file = await urlToFile(modifiedProf.profileImage, "profile.png");

        if (file) {
          formdata.append("profileImage", file);
        }

        await putProfessor(formdata);
      }

      setProfessors((prev) =>
        prev.map((prof) => {
          const updated = modifiedRows.get(prof.encryptedProfessorId);
          return updated ? { ...prof, ...updated } : prof;
        })
      );

      notifySuccess("저장 완료");
      setModifiedRows(new Map());
    } catch (err) {
      console.error("교수 저장 실패", err);
      notifyError("저장 중 오류 발생. 잠시후 재시도 해주세요.");
    } finally {
      setLoading(false);
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
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);

    setNewProfessor((prev) => ({
      ...prev,
      profileImagePreview: preview,
      profileImageFile: file,
    }));
  };

  const handleAddProfessor = async () => {
    const { name, email, profileImageFile } = newProfessor;
    if (!name || !email || !profileImageFile) {
      notifyInfo("모든 항목을 입력해주세요. (프로필 사진 포함)");
      return;
    }

    setLoading(true);
    try {
      const formdata = new FormData();
      formdata.append("name", name);
      formdata.append("email", email);
      formdata.append("tenure", String(newProfessor.tenure));
      formdata.append("profileImage", profileImageFile);

      await postProfessor(formdata);

      const newProfessorData: ProfessorRow = {
        name,
        email,
        tenure: newProfessor.tenure,
        profileImage: newProfessor.profileImagePreview,
        encryptedProfessorId: `temp-${Date.now()}`,
        id: `temp-${Date.now()}`,
      };

      setProfessors((prev) => [...prev, newProfessorData]);

      notifySuccess("교수 등록 완료");
      setOpenDialog(false);
      setNewProfessor({
        name: "",
        email: "",
        tenure: false,
        profileImagePreview: "",
        profileImageFile: null,
      });
    } catch (err) {
      console.error("교수 등록 실패", err);
      notifyError("등록 중 오류 발생. 잠시후 재시도 해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef<ProfessorRow>[] = [
    {
      field: "profileImage",
      headerName: "프로필",
      editable: false,
      flex: 1,
      renderCell: (params) => {
        const src = typeof params.value === "string" ? params.value : "";
        const professorId = params.row.encryptedProfessorId;

        return (
          <Box
            onClick={() => handleImageClick(professorId)}
            sx={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              overflow: "hidden",
              cursor: "pointer",
              border: "1px solid #ccc",
            }}
          >
            {src ? (
              <img src={src} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Typography variant="body2" color="textSecondary" textAlign="center" lineHeight="100px">
                없음
              </Typography>
            )}
            <input
              type="file"
              accept=".jpg,.png"
              style={{ display: "none" }}
              ref={(el) => {
                if (el) fileInputMapRef.current.set(professorId, el);
              }}
              onChange={(e) => handleImageInputChange(professorId, e)}
            />
          </Box>
        );
      },
    },
    { field: "name", headerName: "이름", editable: true, flex: 1 },
    { field: "email", headerName: "이메일", editable: true, flex: 1 },
    { field: "tenure", headerName: "재직", editable: true, type: "boolean", flex: 1 },
  ];

  const rowsWithId: ProfessorRow[] = professors.map((prof) => {
    const modifiedProf = modifiedRows.get(prof.encryptedProfessorId);
    return modifiedProf || { ...prof, id: prof.encryptedProfessorId };
  });

  const handleImageBoxClick = () => fileInputRef.current?.click();

  const handleDeleteSelected = async () => {
    if (selectionModel.length === 0) {
      notifyInfo("삭제할 항목을 선택하세요.");
      return;
    }

    const confirmed = window.confirm(`${selectionModel.length}개 계정을 삭제하시겠습니까?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteProfessor(selectionModel);
      setProfessors((prev) => prev.filter((account) => !selectionModel.includes(account.encryptedProfessorId)));
      setSelectionModel([]);
      notifySuccess("교수 삭제 완료");
    } catch (err) {
      console.error("교수 삭제 실패", err);
      notifyError("삭제 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Toolbar>
        <StyledButton startIcon={<PersonAddIcon />} variant="outlined" onClick={handleDialogOpen}>
          교수 추가
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
        getRowHeight={() => 100}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection as string[])}
        initialState={{
          pagination: { paginationModel: { pageSize: 50 } },
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
                overflow: "hidden",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              {newProfessor.profileImagePreview ? (
                <img
                  src={newProfessor.profileImagePreview}
                  alt="미리보기"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  사진 업로드
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 300 }}>
              <TextField
                name="name"
                label="이름"
                value={newProfessor.name}
                onChange={handleNewProfessorChange}
                fullWidth
              />
              <TextField
                name="email"
                label="이메일"
                value={newProfessor.email}
                onChange={handleNewProfessorChange}
                fullWidth
              />
            </Box>
          </Box>

          <FormControlLabel
            control={<Checkbox name="tenure" checked={newProfessor.tenure} onChange={handleNewProfessorChange} />}
            label="재직 여부"
            sx={{ mt: 2 }}
          />
          <input
            type="file"
            accept=".jpg,.png"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
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
  backgroundColor: style.color.background,
  borderRadius: "12px",
});

const StyledButton = styled(Button)({
  fontSize: "0.85rem",
  padding: "0.4rem 0.7rem",
});
