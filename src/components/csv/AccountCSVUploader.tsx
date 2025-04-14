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
import { IAccountRequest, IAccountRequestStudentInfo, IAccountSetInfo } from "@interface";
import { parseAccountCSV } from "@utils/parse";
import { useToast } from "@hooks";
import { getAccountSetInfo } from "@api/account";

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
            <th
              style={{
                textAlign: "left",
                padding: "6px",
                borderBottom: "1px solid #eee",
              }}
            >
              팀명
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "6px",
                borderBottom: "1px solid #eee",
              }}
            >
              카테고리
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "6px",
                borderBottom: "1px solid #eee",
              }}
            >
              지도교수
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "6px",
                borderBottom: "1px solid #eee",
              }}
            >
              학생 목록
            </th>
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
  onFileParsed: (parsed: IAccountRequest[], rawFile?: File) => void;
}) {
  const { notifyError, notifyInfo } = useToast();
  const [preview, setPreview] = useState<IAccountRequest[]>([]);
  const [file, setFile] = useState<File | null>(null);
  // 수동 입력 상태: 팀명, 카테고리, 지도교수, 학생 목록
  const [manualAccount, setManualAccount] = useState<Partial<IAccountRequest>>({
    studentInfos: [],
  });
  // 교수, 학생 목록을 API로 받아옴
  const [accountSetInfo, setAccountSetInfo] = useState<IAccountSetInfo | null>(null);

  // 파일이 변경될 때(accountSetInfo 재로딩이 필요한 경우가 아니라면 다른 의존성으로 설정해도 됨)
  useEffect(() => {
    getAccountSetInfo()
      .then((data) => setAccountSetInfo(data))
      .catch((err: Error) => {
        // 에러 처리 (필요시 notifyError 호출)
      });
  }, [file]);

  // 모달 open 상태가 변경될 때(open이 false면 취소한 것으로 간주) 초기화 처리
  useEffect(() => {
    if (!open) {
      setPreview([]);
      setFile(null);
      setManualAccount({ studentInfos: [] });
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

  // 교수 선택 핸들러
  const handleProfessorChange = (event: SelectChangeEvent<string>, child?: React.ReactNode) => {
    setManualAccount((prev) => ({
      ...prev,
      professorName: event.target.value,
    }));
  };

  // 카테고리 선택 핸들러 (GAME, MOBILE, WEB만 선택)
  const handleCategoryChange = (event: SelectChangeEvent<string>, child?: React.ReactNode) => {
    setManualAccount((prev) => ({
      ...prev,
      category: event.target.value,
    }));
  };

  // 학생 선택 핸들러 (다중 선택)
  const handleStudentSelectChange = (event: SelectChangeEvent<string[]>, child?: React.ReactNode) => {
    const selectedNames = event.target.value as string[];
    const selectedStudents =
      accountSetInfo?.students.filter((student) => selectedNames.includes(student.studentName)) || [];
    setManualAccount((prev) => ({ ...prev, studentInfos: selectedStudents }));
  };

  // 수동 계정 추가 시, 모든 필드가 입력되었는지 확인
  const handleManualAdd = () => {
    const { teamName, category, professorName, studentInfos } = manualAccount;
    if (!teamName || !category || !professorName || !(studentInfos && studentInfos.length > 0)) {
      notifyInfo("모든 필드와 학생을 선택해야 합니다.");
      return;
    }
    setPreview((prev) => [...prev, manualAccount as IAccountRequest]);
    // 정상 등록 시 수동 입력 상태도 초기화
    setManualAccount({ studentInfos: [] });
  };

  // 선택된 학생 중 하나 제거하는 핸들러
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
      {/* 팀명과 카테고리 입력 */}
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
            <MenuItem value="GAME">GAME</MenuItem>
            <MenuItem value="MOBILE">MOBILE</MenuItem>
            <MenuItem value="WEB">WEB</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={2}>
        {/* 지도교수 단일 선택 */}
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

      {/* 선택된 학생 목록 및 삭제 버튼 */}
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
    onFileParsed(preview, file || undefined);
    onClose();
    // 정상 등록 시 상태 초기화
    setPreview([]);
    setFile(null);
    setManualAccount({ studentInfos: [] });
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

// import { useEffect, useState } from "react";
// import {
//   Box,
//   Button,
//   Checkbox,
//   Divider,
//   FormControl,
//   IconButton,
//   InputLabel,
//   List,
//   ListItem,
//   ListItemText,
//   MenuItem,
//   OutlinedInput,
//   Select,
//   SelectChangeEvent,
//   Stack,
//   TextField,
//   Typography,
// } from "@mui/material";
// import { Delete as DeleteIcon } from "@mui/icons-material";
// import CSVUploaderBase from "./CSVUploaderBase";
// import { IAccountRequest, IAccountRequestStudentInfo, IAccountSetInfo } from "@interface";
// import { parseAccountCSV } from "@utils/parse";
// import { useToast } from "@hooks";
// import { getAccountSetInfo } from "@api/account";

// function AccountPreviewTable({ preview }: { preview: IAccountRequest[] }) {
//   return (
//     <Box
//       sx={{
//         maxHeight: 300,
//         overflowY: "auto",
//         border: "1px solid #ddd",
//         borderRadius: 1,
//         fontSize: "0.85rem",
//       }}
//     >
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr style={{ backgroundColor: "#f9f9f9" }}>
//             <th
//               style={{
//                 textAlign: "left",
//                 padding: "6px",
//                 borderBottom: "1px solid #eee",
//               }}
//             >
//               팀명
//             </th>
//             <th
//               style={{
//                 textAlign: "left",
//                 padding: "6px",
//                 borderBottom: "1px solid #eee",
//               }}
//             >
//               카테고리
//             </th>
//             <th
//               style={{
//                 textAlign: "left",
//                 padding: "6px",
//                 borderBottom: "1px solid #eee",
//               }}
//             >
//               지도교수
//             </th>
//             <th
//               style={{
//                 textAlign: "left",
//                 padding: "6px",
//                 borderBottom: "1px solid #eee",
//               }}
//             >
//               학생 목록
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {preview.map((row, i) => (
//             <tr key={i}>
//               <td style={{ padding: "6px", borderBottom: "1px solid #f0f0f0" }}>{row.teamName}</td>
//               <td style={{ padding: "6px", borderBottom: "1px solid #f0f0f0" }}>{row.category}</td>
//               <td style={{ padding: "6px", borderBottom: "1px solid #f0f0f0" }}>{row.professorName}</td>
//               <td
//                 style={{
//                   padding: "6px",
//                   borderBottom: "1px solid #f0f0f0",
//                   whiteSpace: "pre-wrap",
//                 }}
//               >
//                 {row.studentInfos
//                   .map(
//                     (student: IAccountRequestStudentInfo) =>
//                       `${student.studentName} (${student.studentNumber}, ${student.studentEmail})`
//                   )
//                   .join("\n")}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </Box>
//   );
// }

// function AccountCSVUploader({
//   open,
//   onClose,
//   onFileParsed,
// }: {
//   open: boolean;
//   onClose: () => void;
//   onFileParsed: (parsed: IAccountRequest[], rawFile?: File) => void;
// }) {
//   const { notifyError, notifyInfo } = useToast();
//   const [preview, setPreview] = useState<IAccountRequest[]>([]);
//   const [file, setFile] = useState<File | null>(null);
//   // 수동 입력 상태: 팀명, 카테고리, 지도교수, 학생 목록
//   const [manualAccount, setManualAccount] = useState<Partial<IAccountRequest>>({
//     studentInfos: [],
//   });
//   // 교수, 학생 목록을 API로 받아옴
//   const [accountSetInfo, setAccountSetInfo] = useState<IAccountSetInfo | null>(null);

//   useEffect(() => {
//     getAccountSetInfo()
//       .then((data) => setAccountSetInfo(data))
//       .catch((err: Error) => {});
//   }, [file]);

//   const handleFile = async (file: File) => {
//     try {
//       const parsed = await parseAccountCSV(file);
//       setFile(file);
//       setPreview(parsed);
//     } catch (err: unknown) {
//       notifyError(err instanceof Error ? err.message : "CSV 파싱 실패");
//     }
//   };

//   // 교수 선택 핸들러: SelectChangeEvent<string> 타입으로 정의하고 child 파라미터를 추가
//   const handleProfessorChange = (event: SelectChangeEvent<string>, child?: React.ReactNode) => {
//     setManualAccount((prev) => ({
//       ...prev,
//       professorName: event.target.value,
//     }));
//   };

//   // 카테고리 선택 핸들러 (GAME, MOBILE, WEB만 선택)
//   const handleCategoryChange = (event: SelectChangeEvent<string>, child?: React.ReactNode) => {
//     setManualAccount((prev) => ({
//       ...prev,
//       category: event.target.value,
//     }));
//   };

//   // 학생 선택 핸들러: 다중 선택을 위해 SelectChangeEvent<string[]> 타입 사용
//   const handleStudentSelectChange = (event: SelectChangeEvent<string[]>, child?: React.ReactNode) => {
//     const selectedNames = event.target.value as string[];
//     const selectedStudents =
//       accountSetInfo?.students.filter((student) => selectedNames.includes(student.studentName)) || [];
//     setManualAccount((prev) => ({ ...prev, studentInfos: selectedStudents }));
//   };

//   // 수동 계정 추가 시, 모든 필드가 입력되었는지 확인
//   const handleManualAdd = () => {
//     const { teamName, category, professorName, studentInfos } = manualAccount;
//     if (!teamName || !category || !professorName || !(studentInfos && studentInfos.length > 0)) {
//       notifyInfo("모든 필드와 학생을 선택해야 합니다.");
//       return;
//     }
//     setPreview((prev) => [...prev, manualAccount as IAccountRequest]);
//     setManualAccount({ studentInfos: [] });
//   };

//   // 선택된 학생 중 하나 제거하는 핸들러
//   const handleRemoveStudent = (removeName: string) => {
//     setManualAccount((prev) => {
//       const newStudents = prev.studentInfos?.filter((s) => s.studentName !== removeName) || [];
//       return { ...prev, studentInfos: newStudents };
//     });
//   };

//   const renderManualInput = (
//     <Box sx={{ mt: 4 }}>
//       <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
//         수동 입력
//       </Typography>
//       {/* 팀명과 카테고리 입력 */}
//       <Stack direction="row" spacing={2}>
//         <TextField
//           label="팀명"
//           value={manualAccount.teamName || ""}
//           onChange={(e) => setManualAccount((prev) => ({ ...prev, teamName: e.target.value }))}
//           fullWidth
//           size="small"
//         />
//         <FormControl fullWidth size="small">
//           <InputLabel>카테고리</InputLabel>
//           <Select value={manualAccount.category || ""} onChange={handleCategoryChange} label="카테고리">
//             <MenuItem value="GAME">GAME</MenuItem>
//             <MenuItem value="MOBILE">MOBILE</MenuItem>
//             <MenuItem value="WEB">WEB</MenuItem>
//           </Select>
//         </FormControl>
//       </Stack>

//       <Divider sx={{ my: 2 }} />

//       <Stack direction="row" spacing={2}>
//         {/* 지도교수 단일 선택 */}
//         <FormControl fullWidth size="small">
//           <InputLabel>지도교수</InputLabel>
//           <Select value={manualAccount.professorName || ""} onChange={handleProfessorChange} label="지도교수">
//             {accountSetInfo?.professors.map((p, i) => (
//               <MenuItem key={i} value={p.professorName}>
//                 {p.professorName}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>

//         <FormControl fullWidth size="small">
//           <InputLabel>학생 선택</InputLabel>
//           <Select
//             multiple
//             value={(manualAccount.studentInfos ?? []).map((s) => s.studentName)}
//             onChange={handleStudentSelectChange}
//             input={<OutlinedInput label="학생 목록" />}
//             renderValue={(selected) => (selected as string[]).join(", ")}
//           >
//             {accountSetInfo?.students.map((student, i) => (
//               <MenuItem key={i} value={student.studentName}>
//                 <Checkbox checked={!!manualAccount.studentInfos?.some((s) => s.studentName === student.studentName)} />
//                 <ListItemText primary={`${student.studentName} (${student.studentNumber})`} />
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       </Stack>

//       {/* 선택된 학생 목록 및 삭제 버튼 */}
//       {(manualAccount.studentInfos ?? []).length > 0 && (
//         <List dense sx={{ mt: 2, bgcolor: "#f9f9f9", borderRadius: 1 }}>
//           {(manualAccount.studentInfos ?? []).map((student, idx) => (
//             <ListItem
//               key={idx}
//               secondaryAction={
//                 <IconButton edge="end" onClick={() => handleRemoveStudent(student.studentName)} size="small">
//                   <DeleteIcon fontSize="small" />
//                 </IconButton>
//               }
//             >
//               <ListItemText
//                 primary={`${student.studentName} (${student.studentNumber})`}
//                 secondary={student.studentEmail}
//               />
//             </ListItem>
//           ))}
//         </List>
//       )}

//       <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
//         <Button variant="contained" onClick={handleManualAdd} size="small">
//           계정 추가
//         </Button>
//       </Box>
//     </Box>
//   );

//   const onConfirm = () => {
//     onFileParsed(preview, file || undefined);
//     onClose();
//     // 등록 후 초기화
//     setPreview([]);
//     setFile(null);
//   };

//   return (
//     <CSVUploaderBase<IAccountRequest>
//       open={open}
//       onClose={onClose}
//       title="계정 등록"
//       confirmLabel="등록"
//       preview={preview}
//       onConfirm={onConfirm}
//       onFile={handleFile}
//       renderManualInput={renderManualInput}
//       renderPreview={(preview) => <AccountPreviewTable preview={preview} />}
//     />
//   );
// }

// export default AccountCSVUploader;
