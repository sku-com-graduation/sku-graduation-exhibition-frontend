import React, { useState } from "react";
import styled from "styled-components";

import { useDispatch } from "react-redux";

const Wrapper = styled.div`
  width: 20rem;
  max-width: 400px;
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
`;

const Title = styled.p`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 8px;
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.div`
  margin-bottom: 5px;
  font-size: 1rem;
  font-weight: 500;
  color: #555555;
`;

const Input = styled.input`
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #cccccc;
  border-radius: 8px;
  outline: none;

  &:focus {
    border-color: #007bff;
  }
`;

const Message = styled.div<{ success?: boolean }>`
  font-size: 14px;
  text-align: center;
  color: ${({ success }) => (success ? "#28a745" : "#fb1e1e")};
`;

const Button = styled.button`
  padding: 12px;
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
  background-color: #007bff;
  border: none;
  border-radius: 8px;

  &:hover {
    background-color: #0056b3;
  }

  &:active {
    background-color: #00408a;
  }
`;

export const PasswordEdit = () => {
  const dispatch = useDispatch();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; success?: boolean } | null>(null);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ text: "새 비밀번호가 일치하지 않습니다." });
      return;
    }

    try {
      setMessage({ text: "비밀번호가 성공적으로 변경되었습니다.", success: true });
    } catch (error) {
      console.error(error);
      setMessage({ text: "현재 비밀번호가 일치하지 않거나 오류가 발생했습니다." });
    }
  };

  return (
    <Wrapper>
      <Title>비밀번호 변경</Title>
      <FieldWrapper>
        <Label>현재 비밀번호</Label>
        <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </FieldWrapper>
      <FieldWrapper>
        <Label>새 비밀번호</Label>
        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </FieldWrapper>
      <FieldWrapper>
        <Label>새 비밀번호 확인</Label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleChangePassword();
          }}
        />
      </FieldWrapper>
      {message && <Message success={message.success}>{message.text}</Message>}
      <Button onClick={handleChangePassword}>비밀번호 변경</Button>
    </Wrapper>
  );
};

export default PasswordEdit;
