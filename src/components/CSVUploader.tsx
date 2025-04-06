import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";

const FileDropZone = styled(Box)<{ isDragging: boolean }>`
  border: 2px dashed #aaa;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  background-color: ${({ isDragging }) => (isDragging ? "#f0f8ff" : "#fafafa")};
  transition: background-color 0.2s ease;
  cursor: pointer;
`;

type CSVUploaderProps<T> = {
  open: boolean;
  onClose: () => void;
  onFileParsed: (parsed: T[], rawFile?: File) => void;
  parseCsv: (file: File) => Promise<T[]>;
  title?: string;
  confirmLabel?: string;
  manualFields?: { field: keyof T; label: string }[]; // optional
};

function CSVUploader<T>({
  open,
  onClose,
  onFileParsed,
  parseCsv,
  title = "CSV 등록",
  confirmLabel = "등록",
  manualFields = [],
}: CSVUploaderProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<T[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [manualRow, setManualRow] = useState<Partial<T>>({});

  const handleFile = async (file: File) => {
    try {
      const parsed = await parseCsv(file);
      setFile(file);
      setPreview((prev) => [...prev, ...parsed]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "CSV 파싱 실패");
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === "text/csv") {
      handleFile(dropped);
    } else {
      alert("CSV 파일만 업로드 가능합니다.");
    }
  }, []);

  const handleManualInputChange = (field: keyof T, value: string) => {
    setManualRow((prev) => ({ ...prev, [field]: value }));
  };

  const autoFieldNames = useMemo(() => {
    if (manualFields.length > 0) return manualFields;

    const fields = Object.keys(preview[0] ?? manualRow) as (keyof T)[];
    return fields.map((field) => ({
      field,
      label: String(field),
    }));
  }, [manualFields, preview, manualRow]);

  const handleAddManualRow = () => {
    const missingField = autoFieldNames.find(({ field }) => !manualRow[field]);
    if (missingField) {
      alert(`${missingField.label} 값을 입력해주세요.`);
      return;
    }
    setPreview((prev) => [...prev, manualRow as T]);
    setManualRow({});
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableScrollLock>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {/* CSV 업로드 영역 */}
        <input
          type="file"
          accept=".csv"
          hidden
          ref={inputRef}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <FileDropZone
          isDragging={isDragging}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <CloudUploadIcon sx={{ fontSize: 40, color: "#888" }} />
          <Typography variant="body1" sx={{ mt: 1, color: "#555" }}>
            CSV 파일을 드래그하거나 클릭하여 업로드하세요.
          </Typography>
        </FileDropZone>

        {/* 수동 입력 영역 */}
        {autoFieldNames.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              수동 입력
            </Typography>
            {autoFieldNames.map(({ field, label }) => (
              <TextField
                key={String(field)}
                label={label}
                value={manualRow[field] || ""}
                onChange={(e) => handleManualInputChange(field, e.target.value)}
                fullWidth
                margin="dense"
              />
            ))}
            <Button variant="outlined" onClick={handleAddManualRow} sx={{ mt: 1 }}>
              행 추가
            </Button>
          </Box>
        )}

        {/* 미리보기 영역 */}
        {preview.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
              미리보기
            </Typography>
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
                    {Object.keys(preview[0] ?? {}).map((key) => (
                      <th key={key} style={{ textAlign: "left", padding: "6px", borderBottom: "1px solid #eee" }}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row as Record<string, unknown>).map((value, j) => (
                        <td
                          key={j}
                          style={{
                            padding: "6px",
                            borderBottom: "1px solid #f0f0f0",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {Array.isArray(value)
                            ? value
                                .map((v) =>
                                  typeof v === "object" && v !== null
                                    ? `${v.studentName} (${v.studentNumber}, ${v.studentEmail})`
                                    : JSON.stringify(v)
                                )
                                .join("\n") // 줄바꿈 추가
                            : typeof value === "object" && value !== null
                            ? JSON.stringify(value)
                            : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          disabled={preview.length === 0}
          onClick={() => {
            onFileParsed(preview, file || undefined);
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CSVUploader;
