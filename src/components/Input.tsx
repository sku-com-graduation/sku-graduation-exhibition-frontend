import styled from "styled-components";

export const IconButton = styled.button<{ variant?: "edit" | "save" | "cancel" }>`
  background-color: ${({ variant }) => (variant === "edit" ? "#007bff" : variant === "save" ? "#007bff" : "#ef4444")};
  color: white;
  border: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;
