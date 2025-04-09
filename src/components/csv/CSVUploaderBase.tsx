// CSVUploaderBase.tsx
import React, { useRef, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import styled from "styled-components";
import { useToast } from "@hooks";

export type CSVUploaderBaseProps<T> = {
  open: boolean;
  onClose: () => void;
  title: string;
  confirmLabel?: string;
  preview: T[];
  onConfirm: () => void;
  onFile: (file: File) => Promise<void>;
  renderManualInput?: React.ReactNode;
  renderPreview?: (preview: T[]) => React.ReactNode;
};

const FileDropZone = styled(Box)<{ isDragging: boolean }>`
  border: 2px dashed #aaa;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  background-color: ${({ isDragging }) => (isDragging ? "#f0f8ff" : "#fafafa")};
  transition: background-color 0.2s ease;
  cursor: pointer;
`;

function CSVUploaderBase<T>({
  open,
  onClose,
  title,
  confirmLabel = "등록",
  preview,
  onConfirm,
  onFile,
  renderManualInput,
  renderPreview,
}: CSVUploaderBaseProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { notifyInfo } = useToast();

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === "text/csv") {
      onFile(dropped);
    } else {
      notifyInfo("CSV 파일만 업로드 가능합니다.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {/* 파일 업로드 영역 */}
        <input
          type="file"
          accept=".csv"
          hidden
          ref={inputRef}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              onFile(f);
            }
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

        {renderManualInput}

        {preview.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              미리보기
            </Typography>
            {renderPreview && renderPreview(preview)}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" disabled={preview.length === 0} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CSVUploaderBase;
