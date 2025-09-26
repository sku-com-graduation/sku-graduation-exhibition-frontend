import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import CSVUploaderBase from "./CSVUploaderBase";
import { IAccountTeamRequest, IAccountRequestStudentInfo, IAccountSetInfo } from "@interface";
import { IAccountRequest } from "src/interface/IAccount";
import { parseAccountCSV } from "@utils/parse";
import { useToast } from "@hooks";
import { getAccountSetInfo } from "@api/account";
import { categories } from "@constant/categorys";
import { START_YEAR } from "@constant/years";

function AccountPreviewTable({ preview }: { preview: IAccountTeamRequest[] }) {
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
              <td
                style={{
                  padding: "6px",
                  borderBottom: "1px solid #f0f0f0",
                  whiteSpace: "pre-wrap",
                }}
              >
                {row.studentInfos
                  .map(
                    (student: IAccountRequestStudentInfo) =>
                      `${student.studentName} (${student.studentNumber}, ${student.studentEmail})`
                  )
                  .join("\n")}
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
  onFileParsed: (parsed: IAccountRequest, rawFile?: File) => void;
}) {
  const { notifyError, notifyInfo } = useToast();
  const [preview, setPreview] = useState<IAccountTeamRequest[]>([]);
  const [file, setFile] = useState<File | null>(null);

  // 연도 선택 상태
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // 수동 입력 상태
  const [manualAccount, setManualAccount] = useState<Partial<IAccountTeamRequest>>({
    studentInfos: [],
  });
  const [accountSetInfo, setAccountSetInfo] = useState<IAccountSetInfo | null>(null);

  useEffect(() => {
    getAccountSetInfo()
      .then((data) => setAccountSetInfo(data))
      .catch(() => {});
  }, [file]);

  useEffect(() => {
    if (!open) {
      setPreview([]);
      setFile(null);
      setManualAccount({ studentInfos: [] });
      setYear(new Date().getFullYear());
    }
  }, [open]);

  const handleFile = async (file: File) => {
    try {
      const parsed = await parseAccountCSV(file);
      setFile(file);
      setPreview(parsed);
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : "CSV 파싱 실패");
    }
  };

  const handleProfessorChange = (event: SelectChangeEvent<string>) => {
    setManualAccount((prev) => ({ ...prev, professorName: event.target.value }));
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setManualAccount((prev) => ({ ...prev, category: event.target.value }));
  };

  const handleStudentSelectChange = (event: SelectChangeEvent<string[]>) => {
    const selectedNames = event.target.value as string[];
    const selectedStudents =
      accountSetInfo?.students.filter((student) => selectedNames.includes(student.studentName)) || [];
    setManualAccount((prev) => ({ ...prev, studentInfos: selectedStudents }));
  };

  const handleManualAdd = () => {
    const { teamName, category, professorName, studentInfos } = manualAccount;
    if (!teamName || !category || !professorName || !(studentInfos && studentInfos.length > 0)) {
      notifyInfo("모든 필드와 학생을 선택해야 합니다.");
      return;
    }
    setPreview((prev) => [...prev, manualAccount as IAccountTeamRequest]);
    setManualAccount({ studentInfos: [] });
  };

  const handleRemoveStudent = (removeName: string) => {
    setManualAccount((prev) => {
      const newStudents = prev.studentInfos?.filter((s) => s.studentName !== removeName) || [];
      return { ...prev, studentInfos: newStudents };
    });
  };

  const renderManualInput = (
    <Box sx={{ mt: 4 }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
        수동 입력
      </Typography>

      {/* 연도 선택 */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>연도</InputLabel>
          <Select value={year.toString()} onChange={(e) => setYear(Number(e.target.value))} label="연도">
            {Array.from({ length: new Date().getFullYear() - START_YEAR + 1 }, (_, idx) => START_YEAR + idx).map(
              (y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      </Stack>

      {/* 팀명, 카테고리 */}
      <Stack direction="row" spacing={2}>
        <TextField
          label="팀명"
          value={manualAccount.teamName || ""}
          onChange={(e) => setManualAccount((prev) => ({ ...prev, teamName: e.target.value }))}
          fullWidth
          size="small"
        />
        <FormControl fullWidth size="small">
          <InputLabel>카테고리</InputLabel>
          <Select value={manualAccount.category || ""} onChange={handleCategoryChange} label="카테고리">
            {categories.slice(1).map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* 지도교수, 학생 선택 */}
      <Stack direction="row" spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel>지도교수</InputLabel>
          <Select value={manualAccount.professorName || ""} onChange={handleProfessorChange} label="지도교수">
            {accountSetInfo?.professors.map((p, i) => (
              <MenuItem key={i} value={p.professorName}>
                {p.professorName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>학생 선택</InputLabel>
          <Select
            multiple
            value={(manualAccount.studentInfos ?? []).map((s) => s.studentName)}
            onChange={handleStudentSelectChange}
            input={<OutlinedInput label="학생 목록" />}
            renderValue={(selected) => (selected as string[]).join(", ")}
          >
            {accountSetInfo?.students.map((student, i) => (
              <MenuItem key={i} value={student.studentName}>
                <Checkbox checked={!!manualAccount.studentInfos?.some((s) => s.studentName === student.studentName)} />
                <ListItemText primary={`${student.studentName} (${student.studentNumber})`} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* 선택된 학생 목록 */}
      {(manualAccount.studentInfos ?? []).length > 0 && (
        <List dense sx={{ mt: 2, bgcolor: "#f9f9f9", borderRadius: 1 }}>
          {(manualAccount.studentInfos ?? []).map((student, idx) => (
            <ListItem
              key={idx}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveStudent(student.studentName)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${student.studentName} (${student.studentNumber})`}
                secondary={student.studentEmail}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button variant="contained" onClick={handleManualAdd} size="small">
          계정 추가
        </Button>
      </Box>
    </Box>
  );

  const onConfirm = () => {
    const request: IAccountRequest = {
      year,
      registerAccounts: preview,
    };
    onFileParsed(request, file || undefined);
    onClose();
    setPreview([]);
    setFile(null);
    setManualAccount({ studentInfos: [] });
    setYear(new Date().getFullYear());
  };

  return (
    <CSVUploaderBase<IAccountTeamRequest>
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
