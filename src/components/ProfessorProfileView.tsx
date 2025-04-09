import styled from "styled-components";
import userEmpty from "@assets/image/user.png";
import { FiMail } from "react-icons/fi";
import { IprofessorInfo } from "src/interface/ITeamPost";

interface ProfessorProfileViewProps {
  professor: IprofessorInfo;
}

const ProfessorProfileView = ({ professor }: ProfessorProfileViewProps) => {
  return (
    <Card>
      <ImageSection>
        <Image src={professor.professorImage ? professor.professorImage : userEmpty} alt={`${professor.professorName} Profile`} />
      </ImageSection>
      <InfoSection>
        <Name>{professor.professorName}</Name>
        <Email>
          <FiMail />
          <a href={`mailto:${professor.professorEmail}`}>{professor.professorEmail}</a>
        </Email>
      </InfoSection>
    </Card>
  );
};

export default ProfessorProfileView;

const Card = styled.div`
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  border-radius: 1rem;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1.5rem;
  font-family: "Pretendard", sans-serif;
`;

const ImageSection = styled.div`
  display: flex;
  align-items: center;
`;

const Image = styled.img`
  width: 9rem;
  height: 9rem;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e5e7eb;
`;

const InfoSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
`;

const Name = styled.h2`
  font-size: 1.6rem;
  color: #111827;
`;

const Email = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;

  a {
    color: #2563eb;
    &:hover {
      text-decoration: underline;
    }
  }
`;
