import styled from "styled-components";
import { ITeamStudent } from "../interface";
import { GithubIcon, EmailIcon, AirplainIcon, LaptopIcon } from "./Icons";
import empty from "../assets/image/empty.png";
import userEmpty from "../assets/image/userEmpty.png";

const removeTrailingSlash = (url: string) => {
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

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
  transition: box-shadow 0.3s ease;
  align-items: center;

  &:hover {
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
    grid-template-columns: 4.5rem 1fr;
  }
`;

const StudentImg = styled.img`
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f2f2f2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  justify-self: center;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 4.5rem;
    height: 4.5rem;
  }
`;

const TextContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

const NameRoleContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  gap: 1rem;
  align-items: center;
`;

const Name = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const Role = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  background-color: #95a5b1;
  padding: 0.3rem 1rem;
  border-radius: 1rem;
  text-align: center;
  white-space: nowrap;
`;

const InfoItem = styled.div`
  font-size: 1rem;
  color: #555;
  margin-bottom: 0.5rem;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem;
  align-items: center;

  & > svg {
    font-size: 1.2rem;
    color: #555;
  }

  & > a {
    text-decoration: none;
    color: #555;
    transition: color 0.3s ease;

    &:hover {
      color: #0077cc;
    }
  }
`;

const Profile = ({ selectedStudent }: { selectedStudent: ITeamStudent }) => {
  return (
    <Wrapper>
      <StudentImg
        src={selectedStudent.profileImage ? `data:image/jpeg;base64,${selectedStudent.profileImage}` : userEmpty}
        alt="Profile Picture"
      />
      <TextContainer>
        <NameRoleContainer>
          <Name>{selectedStudent.name}</Name>
          <Role>{selectedStudent.role}</Role>
        </NameRoleContainer>

        {selectedStudent.info && (
          <InfoItem>
            <LaptopIcon />
            {selectedStudent.info}
          </InfoItem>
        )}

        {selectedStudent.studentBlog && (
          <InfoItem>
            <AirplainIcon />
            <a href={removeTrailingSlash(selectedStudent.studentBlog)} target="_blank" rel="noopener noreferrer">
              {removeTrailingSlash(selectedStudent.studentBlog)}
            </a>
          </InfoItem>
        )}

        {selectedStudent.studentEmail && (
          <InfoItem>
            <EmailIcon />
            <a href={`mailto:${selectedStudent.studentEmail}`} target="_blank" rel="noopener noreferrer">
              {selectedStudent.studentEmail}
            </a>
          </InfoItem>
        )}

        {selectedStudent.githubUrl && (
          <InfoItem>
            <GithubIcon />
            <a href={removeTrailingSlash(selectedStudent.githubUrl)} target="_blank" rel="noopener noreferrer">
              {removeTrailingSlash(selectedStudent.githubUrl)}
            </a>
          </InfoItem>
        )}
      </TextContainer>
    </Wrapper>
  );
};

export default Profile;
