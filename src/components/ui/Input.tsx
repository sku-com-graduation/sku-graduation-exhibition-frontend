// components/ui/Input.tsx
import styled from "styled-components";

export const EditableInput = styled.input`
  font-size: 2rem;
  font-weight: 700;
  border: none;
  border-bottom: 2px solid #ccc;
  outline: none;
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  text-align: center;
`;

export const EditableTextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  font-size: 1rem;
  padding: 0.75rem;
  border: 1px solid #bbb;
  border-radius: 0.5rem;
  resize: vertical;
  &:focus {
    border-color: #888;
    background-color: #fff;
  }
`;

interface FileInputProps {
  hidden?: boolean;
}

export const FileInput = styled.input<FileInputProps>`
  margin-top: 0.5rem;
  display: ${({ hidden }) => (hidden ? "none" : "block")};
`;

export const SaveButton = styled.button`
  padding: 0.75rem 2rem;
  background-color: #0070f3;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background-color: #005bb5;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export const AddImageButton = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 0.5rem;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px dashed #ccc;
  color: #999;

  &:hover {
    background-color: #eaeaea;
  }
`;
