import React, { useState } from "react";
import styled from "styled-components";

import { postAuth } from "../api/auth";
import { useDispatch } from "react-redux";
import { setAuth } from "../store/reducers/auth";
import { validateEmail } from "@utils/validate";

const LoginWrapper = styled.div`
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
  margin: 0px 0px 5px 0px;
  font-size: 1rem;
  font-weight: 500;
  color: #555555;
`;

const Input = styled.input`
  width: auto;
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #cccccc;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #007bff;
  }
`;

const SubTextWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 16px;
  font-size: 14px;

  div:nth-child(1) {
    color: #b4b4b4;
  }

  div:nth-child(2) {
    color: #1962ff;
    transition: color 0.3s;

    &:hover {
      color: #4fb0ff;
    }
  }
`;

const FailedMessage = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 16px;
  font-size: 14px;
  color: #fb1e1e;
`;

const Button = styled.button`
  padding: 12px;
  font-size: 1rem;
  font-weight: bold;
  width: auto;
  color: #ffffff;
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:active {
    background-color: #00408a;
  }

  &:disabled {
    background-color: #a0c4ff;
    cursor: not-allowed;
  }
`;

interface LoginProps {
  onSuccess: () => void;
}

export const Login = ({ onSuccess }: LoginProps) => {
  const dispatch = useDispatch();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [failedLogin, setFailedLogin] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const postLogin = async () => {
    if (!validateEmail(username)) {
      setFailedLogin("유효한 이메일 주소를 입력하세요.");
      return;
    }
    setIsSubmitting(true);
    setFailedLogin("");
    try {
      const user = await postAuth(username, password);
      dispatch(setAuth(user));
      onSuccess();
    } catch (error) {
      setFailedLogin("로그인에 실패했습니다. 이메일 또는 비밀번호를 확인하세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginWrapper>
      <Title>LOGIN</Title>
      <FieldWrapper>
        <Label>이메일</Label>
        <Input
          value={username}
          type="email"
          placeholder="example@sungkyul.ac.kr"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          required
          autoFocus
        />
      </FieldWrapper>
      <FieldWrapper>
        <Label>비밀번호</Label>
        <Input
          value={password}
          type="password"
          placeholder="password"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") postLogin();
          }}
          required
        />
      </FieldWrapper>
      {failedLogin && <FailedMessage>{failedLogin}</FailedMessage>}
      <Button onClick={postLogin} disabled={isSubmitting}>
        {isSubmitting ? "LOG IN..." : "LOG IN"}
      </Button>
      {/* <SubTextWrapper>
        <div>비밀번호를 잊으셨나요?</div>
        <div>비밀번호 찾기</div>
      </SubTextWrapper> */}
    </LoginWrapper>
  );
};
