// components/CsvUploadDialog.tsx
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useCallback, useRef, useState } from "react";
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

type CsvUploadDialogProps<T extends Record<string, string>> = {
  open: boolean;
  onClose: () => void;
  onFileParsed: (parsed: T[], rawFile: File) => void;
  parseCsv: (file: File) => Promise<T[]>;
  title?: string;
  confirmLabel?: string;
};

function CsvUploadDialog<T extends Record<string, string>>({
  open,
  onClose,
  onFileParsed,
  parseCsv,
  title = "CSV 등록",
  confirmLabel = "등록",
}: CsvUploadDialogProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<T[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    try {
      const parsed = await parseCsv(file);
      setFile(file);
      setPreview(parsed);
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("CSV 파싱 실패");
    }
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped && dropped.type === "text/csv") {
        handleFile(dropped);
      } else {
        alert("CSV 파일만 업로드 가능합니다.");
      }
    },
    [handleFile]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableScrollLock>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
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
            여기로 CSV 파일을 드래그하거나 클릭하여 업로드하세요.
          </Typography>
        </FileDropZone>

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
                      {Object.values(row).map((value, j) => (
                        <td key={j} style={{ padding: "6px", borderBottom: "1px solid #f0f0f0" }}>
                          {value}
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
            if (file) onFileParsed(preview, file);
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CsvUploadDialog;
