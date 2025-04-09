// AccountCSVUploader.tsx
import React, { useState } from "react";
import { Box, Button, Divider, IconButton, List, ListItem, ListItemText, Stack, TextField, Typography } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import CSVUploaderBase from "./CSVUploaderBase";
import { IAccountRequest } from "@interface";
import { parseAccountCSV } from "@utils/parse";
import { useToast } from "@hooks";

function AccountPreviewTable({ preview }: { preview: IAccountRequest[] }) {
  return (
    <Box
      sx={{
        maxHeight: 300,
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: 1,
        fontSize: "0.85rem",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f9f9f9" }}>
            <th style={{ textAlign: "left", padding: "6px", borderBottom: "1px solid #eee" }}>팀명</th>
            <th style={{ textAlign: "left", padding: "6px", borderBottom: "1px solid #eee" }}>카테고리</th>
            <th style={{ textAlign: "left", padding: "6px", borderBottom: "1px solid #eee" }}>지도교수</th>
            <th style={{ textAlign: "left", padding: "6px", borderBottom: "1px solid #eee" }}>학생 목록</th>
          </tr>
        </thead>
        <tbody>
          {preview.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: "6px", borderBottom: "1px solid #f0f0f0" }}>{row.teamName}</td>
              <td style={{ padding: "6px", borderBottom: "1px solid #f0f0f0" }}>{row.category}</td>
              <td style={{ padding: "6px", borderBottom: "1px solid #f0f0f0" }}>{row.professorName}</td>
              <td style={{ padding: "6px", borderBottom: "1px solid #f0f0f0", whiteSpace: "pre-wrap" }}>
                {row.studentInfos.map((student) => `${student.studentName} (${student.studentNumber}, ${student.studentEmail})`).join("\n")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

function AccountCSVUploader({
  open,
  onClose,
  onFileParsed,
}: {
  open: boolean;
  onClose: () => void;
  onFileParsed: (parsed: IAccountRequest[], rawFile?: File) => void;
}) {
  const { notifyError, notifyInfo } = useToast();
  const [preview, setPreview] = useState<IAccountRequest[]>([]);
  const [file, setFile] = useState<File | null>(null);

  // 수동 입력 상태 (studentInfos는 기본 []로 초기화)
  const [manualAccount, setManualAccount] = useState<Partial<IAccountRequest>>({
    studentInfos: [],
  });
  const [manualStudent, setManualStudent] = useState({
    studentName: "",
    studentNumber: "",
    studentEmail: "",
  });

  const handleFile = async (file: File) => {
    try {
      const parsed = await parseAccountCSV(file);
      setFile(file);
      setPreview(parsed);
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : "CSV 파싱 실패");
    }
  };

  const handleStudentAdd = () => {
    const { studentName, studentNumber, studentEmail } = manualStudent;
    if (!studentName || !studentNumber || !studentEmail) {
      notifyInfo("학생 정보를 모두 입력하세요.");
      return;
    }
    setManualAccount((prev) => ({
      ...prev,
      studentInfos: [...(prev.studentInfos ?? []), manualStudent],
    }));
    setManualStudent({ studentName: "", studentNumber: "", studentEmail: "" });
  };

  const handleManualAdd = () => {
    const { teamName, category, professorName, studentInfos } = manualAccount;
    if (!teamName || !category || !professorName || !(studentInfos && studentInfos.length > 0)) {
      notifyInfo("모든 필드와 학생을 입력해야 합니다.");
      return;
    }
    setPreview((prev) => [...prev, manualAccount as IAccountRequest]);
    setManualAccount({ studentInfos: [] });
  };

  const handleRemoveStudent = (index: number) => {
    setManualAccount((prev) => ({
      ...prev,
      studentInfos: prev.studentInfos?.filter((_, i) => i !== index) || [],
    }));
  };

  const renderManualInput = (
    // 개선된 수동 입력 UI 예시
    <Box sx={{ mt: 4 }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
        수동 입력
      </Typography>
      {/* 한 줄에 팀명, 카테고리, 지도교수 입력 필드 배치 */}
      <Stack direction="row" spacing={2}>
        <TextField
          label="팀명"
          value={manualAccount.teamName || ""}
          onChange={(e) => setManualAccount((prev) => ({ ...prev, teamName: e.target.value }))}
          fullWidth
          size="small"
        />
        <TextField
          label="카테고리"
          value={manualAccount.category || ""}
          onChange={(e) => setManualAccount((prev) => ({ ...prev, category: e.target.value }))}
          fullWidth
          size="small"
        />
        <TextField
          label="지도교수"
          value={manualAccount.professorName || ""}
          onChange={(e) => setManualAccount((prev) => ({ ...prev, professorName: e.target.value }))}
          fullWidth
          size="small"
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
        학생 추가
      </Typography>
      {/* 한 줄에 학생 정보 입력 필드와 추가 버튼 배치 */}
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="이름"
          value={manualStudent.studentName}
          onChange={(e) => setManualStudent((s) => ({ ...s, studentName: e.target.value }))}
          size="small"
        />
        <TextField
          label="학번"
          value={manualStudent.studentNumber}
          onChange={(e) => setManualStudent((s) => ({ ...s, studentNumber: e.target.value }))}
          size="small"
        />
        <TextField
          label="이메일"
          value={manualStudent.studentEmail}
          onChange={(e) => setManualStudent((s) => ({ ...s, studentEmail: e.target.value }))}
          size="small"
        />
        <Button variant="outlined" onClick={handleStudentAdd} size="small">
          추가
        </Button>
      </Stack>

      {/* 추가된 학생 리스트 */}
      {(manualAccount.studentInfos ?? []).length > 0 && (
        <List dense sx={{ mt: 2, bgcolor: "#f9f9f9", borderRadius: 1 }}>
          {(manualAccount.studentInfos ?? []).map((student, idx) => (
            <ListItem
              key={idx}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveStudent(idx)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText primary={`${student.studentName} (${student.studentNumber})`} secondary={student.studentEmail} />
            </ListItem>
          ))}
        </List>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button variant="contained" onClick={handleManualAdd} size="small">
          수동 계정 추가
        </Button>
      </Box>
    </Box>
  );

  const onConfirm = () => {
    onFileParsed(preview, file || undefined);
    onClose();
  };

  return (
    <CSVUploaderBase<IAccountRequest>
      open={open}
      onClose={onClose}
      title="계정 등록"
      confirmLabel="등록"
      preview={preview}
      onConfirm={onConfirm}
      onFile={handleFile}
      renderManualInput={renderManualInput}
      renderPreview={(preview) => <AccountPreviewTable preview={preview} />}
    />
  );
}

export default AccountCSVUploader;
