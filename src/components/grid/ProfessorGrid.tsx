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
import { Save as SaveIcon, PersonAdd as PersonAddIcon } from "@mui/icons-material";

import { getProfessor, putProfessor, postProfessor } from "@api/professor";
import { IProfessor } from "@interface";
import base64ToFile from "@utils/base64ToFile";

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
  const fileInputMapRef = useRef<Map<string, HTMLInputElement>>(new Map());

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

  const handleRowImageChange = (professorId: string, file: File) => {
    setProfessors((prev) =>
      prev.map((prof) => (prof.encryptedProfessorId === professorId ? { ...prof, profileImage: file } : prof))
    );
    setModifiedRows((prev) => {
      const updated = new Map(prev);
      const existing = professors.find((p) => p.encryptedProfessorId === professorId);
      if (existing) {
        updated.set(professorId, {
          ...existing,
          profileImage: file,
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
    if (modifiedRows.size === 0) return alert("수정된 내용이 없습니다.");

    try {
      for (const modifiedProf of modifiedRows.values()) {
        const formData = new FormData();
        formData.append("encryptedProfessorId", modifiedProf.id);
        formData.append("name", modifiedProf.name);
        formData.append("email", modifiedProf.email);
        formData.append("tenure", String(modifiedProf.tenure));

        const profileImage = modifiedProf.profileImage;

        if (profileImage instanceof File) {
          formData.append("profileImage", profileImage);
        } else if (typeof profileImage === "string") {
          const file = base64ToFile(profileImage, "profile.jpg"); // 파일명과 타입은 상황에 맞게
          formData.append("profileImage", file);
        }

        await putProfessor(formData);
      }

      setProfessors((prev) =>
        prev.map((prof) => {
          const updated = modifiedRows.get(prof.encryptedProfessorId);
          return updated ? { ...prof, ...updated } : prof;
        })
      );

      alert("저장 완료");
      setModifiedRows(new Map());
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

      const newProfessorData: ProfessorRow = {
        ...newProfessor,
        id: `temp-${Date.now()}`,
        encryptedProfessorId: `temp-${Date.now()}`,
        profileImage: newProfessor.profileImage ?? "",
      };

      setProfessors((prev) => [...prev, newProfessorData]);

      alert("교수 등록 완료");
      setOpenDialog(false);
      setNewProfessor({
        name: "",
        email: "",
        tenure: false,
        profileImage: null,
      });
    } catch (err) {
      console.error("교수 등록 실패", err);
      alert("등록 중 오류 발생");
    }
  };

  const columns: GridColDef<ProfessorRow>[] = [
    {
      field: "profileImage",
      headerName: "프로필",
      editable: false,
      flex: 1,
      renderCell: (params) => {
        const value = params.value;
        const professorId = params.row.encryptedProfessorId;

        const src =
          typeof value === "string"
            ? URL.createObjectURL(base64ToFile(value, "profile.jpg", "image/jpeg"))
            : value
            ? URL.createObjectURL(value)
            : "";

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
              accept="image/*"
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
    if (modifiedProf) return modifiedProf;
    return {
      ...prof,
      id: prof.encryptedProfessorId,
    };
  });

  const handleImageBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
        getRowHeight={() => 100}
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
            accept="image/*"
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
  backgroundColor: "#fff",
  borderRadius: "12px",
});

const StyledButton = styled(Button)({
  fontSize: "0.85rem",
  padding: "0.4rem 0.7rem",
});
