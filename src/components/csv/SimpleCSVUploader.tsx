// SimpleCSVUploader.tsx
import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import CSVUploaderBase from "./CSVUploaderBase";
import { useToast } from "@hooks";

export type CSVUploaderProps<T> = {
  open: boolean;
  onClose: () => void;
  onFileParsed: (parsed: T[], rawFile?: File) => void;
  parseCsv: (file: File) => Promise<T[]>;
  title?: string;
  confirmLabel?: string;
  manualFields?: { field: keyof T; label: string }[];
};

function DefaultPreviewTable<T>({ preview }: { preview: T[] }) {
  if (!preview || preview.length === 0) return null;
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
                    ? value.map((v) => (typeof v === "object" && v !== null ? JSON.stringify(v) : String(v))).join("\n")
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
  );
}

function SimpleCSVUploader<T>({
  open,
  onClose,
  parseCsv,
  onFileParsed,
  manualFields = [],
  title = "CSV 등록",
  confirmLabel = "등록",
}: CSVUploaderProps<T>) {
  const [preview, setPreview] = useState<T[]>([]);
  const [manualRow, setManualRow] = useState<Partial<T>>({});
  const { notifyError, notifyInfo } = useToast();

  const handleFile = async (file: File) => {
    try {
      const parsed = await parseCsv(file);
      setPreview((prev) => [...prev, ...parsed]);
    } catch (e: unknown) {
      notifyError("CSV 파싱 실패");
    }
  };

  const handleAddManualRow = () => {
    const missingField = manualFields.find(({ field }) => !manualRow[field]);
    if (missingField) {
      notifyInfo(`${missingField.label} 값을 입력해주세요.`);
      return;
    }
    setPreview((prev) => [...prev, manualRow as T]);
    setManualRow({});
  };

  const renderManualInput = manualFields.length > 0 && (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        수동 입력
      </Typography>
      {manualFields.map(({ field, label }) => (
        <TextField
          key={String(field)}
          label={label}
          value={(manualRow[field] as string) || ""}
          onChange={(e) => setManualRow((prev) => ({ ...prev, [field]: e.target.value }))}
          fullWidth
          margin="dense"
        />
      ))}
      <Button variant="outlined" onClick={handleAddManualRow} sx={{ mt: 1 }}>
        추가
      </Button>
    </Box>
  );

  const onConfirm = () => {
    onFileParsed(preview);
    onClose();
  };

  return (
    <CSVUploaderBase<T>
      open={open}
      onClose={onClose}
      title={title}
      confirmLabel={confirmLabel}
      preview={preview}
      onConfirm={onConfirm}
      onFile={handleFile}
      renderManualInput={renderManualInput}
      renderPreview={(preview) => <DefaultPreviewTable preview={preview} />}
    />
  );
}

export default SimpleCSVUploader;
