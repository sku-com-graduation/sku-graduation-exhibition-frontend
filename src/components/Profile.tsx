import { useState } from "react";
import styled from "styled-components";
import { ITeamStudent } from "../interface";
import userEmpty from "../assets/image/userEmpty.png";
import { useSelector } from "react-redux";
import { RootState } from "@src/store/store";

const removeTrailingSlash = (url: string) => {
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

const Profile = (props: { selectedStudent: ITeamStudent; teamUuid: string | undefined }) => {
  const auth = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState(props.selectedStudent);

  const handleEditClick = () => setIsEditing(true);
  const handleCancelClick = () => {
    setEditedStudent(props.selectedStudent);
    setIsEditing(false);
  };
  const handleSaveClick = () => {
    console.log("Saved Data:", editedStudent);
    setIsEditing(false);
  };

  return (
    <Wrapper>
      <StudentImg
        src={editedStudent.profileImage ? `data:image/jpeg;base64,${editedStudent.profileImage}` : userEmpty}
        alt="Profile Picture"
      />
      <TextContainer>
        <NameRoleContainer>
          {isEditing ? (
            <>
              <Input
                value={editedStudent.name}
                onChange={(e) => setEditedStudent({ ...editedStudent, name: e.target.value })}
              />
              <Role>{editedStudent.role}</Role>
            </>
          ) : (
            <>
              <Name>{editedStudent.name}</Name>
              <Role>{editedStudent.role}</Role>
            </>
          )}
        </NameRoleContainer>

        {isEditing ? (
          <>
            <Input
              value={editedStudent.info || ""}
              onChange={(e) => setEditedStudent({ ...editedStudent, info: e.target.value })}
              placeholder="정보 입력"
            />
            <Input
              value={editedStudent.studentBlog || ""}
              onChange={(e) => setEditedStudent({ ...editedStudent, studentBlog: e.target.value })}
              placeholder="블로그 URL 입력"
            />
            <Input
              value={editedStudent.studentEmail || ""}
              onChange={(e) => setEditedStudent({ ...editedStudent, studentEmail: e.target.value })}
              placeholder="이메일 입력"
            />
            <Input
              value={editedStudent.githubUrl || ""}
              onChange={(e) => setEditedStudent({ ...editedStudent, githubUrl: e.target.value })}
              placeholder="깃허브 URL 입력"
            />
          </>
        ) : (
          <>
            {editedStudent.info && <InfoText>{editedStudent.info}</InfoText>}
            {editedStudent.studentBlog && (
              <InfoText>
                <a href={removeTrailingSlash(editedStudent.studentBlog)} target="_blank" rel="noopener noreferrer">
                  {removeTrailingSlash(editedStudent.studentBlog)}
                </a>
              </InfoText>
            )}
            {editedStudent.studentEmail && (
              <InfoText>
                <a href={`mailto:${editedStudent.studentEmail}`} target="_blank" rel="noopener noreferrer">
                  {editedStudent.studentEmail}
                </a>
              </InfoText>
            )}
            {editedStudent.githubUrl && (
              <InfoText>
                <a href={removeTrailingSlash(editedStudent.githubUrl)} target="_blank" rel="noopener noreferrer">
                  {removeTrailingSlash(editedStudent.githubUrl)}
                </a>
              </InfoText>
            )}
          </>
        )}

        {/* ✅ 수정 & 저장 버튼 추가 */}
        {auth.uuid === props.teamUuid && (
          <ButtonContainer>
            {isEditing ? (
              <>
                <SaveButton onClick={handleSaveClick}>저장</SaveButton>
                <CancelButton onClick={handleCancelClick}>취소</CancelButton>
              </>
            ) : (
              <EditButton onClick={handleEditClick}>수정</EditButton>
            )}
          </ButtonContainer>
        )}
      </TextContainer>
    </Wrapper>
  );
};

// ✅ 스타일 추가
const Wrapper = styled.div`
  width: 30rem;
  height: auto;
  display: grid;
  grid-template-columns: 10rem 1fr;
  gap: 2rem;
  background: #ffffff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  align-items: center;
`;

const StudentImg = styled.img`
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  object-fit: cover;
`;

const TextContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

const NameRoleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Name = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const Role = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  background-color: #95a5b1;
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 1rem;
`;

const InfoText = styled.div`
  font-size: 1rem;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border 0.3s ease;

  &:focus {
    border-color: #0077cc;
    outline: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EditButton = styled.button`
  background-color: #0077cc;
  color: white;
  font-size: 1rem;
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background-color: #005fa3;
  }
`;

const SaveButton = styled.button`
  background-color: #28a745;
  color: white;
  font-size: 1rem;
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background-color: #1e7e34;
  }
`;

const CancelButton = styled.button`
  background-color: #dc3545;
  color: white;
  font-size: 1rem;
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background-color: #c82333;
  }
`;

export default Profile;
