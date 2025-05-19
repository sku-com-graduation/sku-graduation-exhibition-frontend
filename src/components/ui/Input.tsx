import styled from "styled-components";

export const EditableTitle = styled.input`
  flex: 1;
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  border: none;
  border-bottom: 2px solid #ccc;
  outline: none;
  width: 100%;
  background: transparent;
  margin-bottom: 1rem;
  @media (max-width: 768px) {
    font-size: 2.2rem;
    text-align: center;
    width: 90%;
  }
`;

export const EditableTextArea = styled.textarea`
  width: 100%;
  font-size: 1.1rem;
  color: #333;
  line-height: 1.8;
  letter-spacing: 0.05rem;
  padding: 0.75rem;
  border: 1px solid #bbb;
  border-radius: 0.5rem;
  background-color: #f9f9f9;
  resize: none;
  transition: border 0.2s ease-in-out, background 0.2s ease-in-out;
  font-family: "Pretendard-Regular", "Arial", sans-serif;

  &:focus {
    border: 1px solid #888;
    background-color: #fff;
    outline: none;
  }

  &::placeholder {
    color: #aaa;
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    text-align: center;
    font-size: 1rem;
  }
`;

export const FileInput = styled.input<{ hidden?: boolean }>`
  margin-top: 0.5rem;
  display: none;
`;

export const AddArea = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 0.5rem;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;

  border: 2px dashed #ccc;
  color: #999;

  &:hover {
    background-color: #eaeaea;
  }
`;
