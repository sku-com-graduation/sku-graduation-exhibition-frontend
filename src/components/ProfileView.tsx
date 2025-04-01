import styled from "styled-components";
import { ITeamStudent } from "../interface";
import userEmpty from "../assets/image/main_image.png";
import { FiMail, FiGithub, FiGlobe } from "react-icons/fi";

interface ProfileViewProps {
  student: ITeamStudent;
}

const ProfileView = ({ student }: ProfileViewProps) => {
  return (
    <ProfileCard>
      <ImageSection>
        <ProfileImage
          src={student.profileImage ? `data:image/jpeg;base64,${student.profileImage}` : userEmpty}
          alt={`${student.name} Profile`}
        />
      </ImageSection>

      <InfoSection>
        <HeaderContainer>
          <Name>{student.name}</Name>
          <RoleBadge>{student.role}</RoleBadge>
        </HeaderContainer>

        <ContentContainer>
          {student.info && <DetailText>{student.info}</DetailText>}
          {student.studentBlog && (
            <IconText>
              <FiGlobe />
              <Link href={student.studentBlog} target="_blank" rel="noreferrer">
                {student.studentBlog}
              </Link>
            </IconText>
          )}
          {student.studentEmail && (
            <IconText>
              <FiMail />
              <Link href={`mailto:${student.studentEmail}`}>{student.studentEmail}</Link>
            </IconText>
          )}
          {student.githubUrl && (
            <IconText>
              <FiGithub />
              <Link href={student.githubUrl} target="_blank" rel="noreferrer">
                {student.githubUrl}
              </Link>
            </IconText>
          )}
        </ContentContainer>
      </InfoSection>
    </ProfileCard>
  );
};

export default ProfileView;

const ProfileCard = styled.div`
  width: 100%;
  max-width: 600px;
  padding: 2rem;
  border-radius: 1rem;
  background-color: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1.5rem;
  font-family: "Pretendard", sans-serif;
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
`;

const ProfileImage = styled.img`
  width: 9rem;
  height: 9rem;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
`;

const InfoSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HeaderContainer = styled.div`
  display: flex;
  gap: 0.7rem;
  align-items: center;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Name = styled.h2`
  font-size: 1.6rem;
  color: #111827;
`;

const RoleBadge = styled.span`
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
  color: #374151;
`;

const DetailText = styled.p`
  color: #4b5563;
  margin: 0;
`;

const IconText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
  font-size: 0.95rem;
`;

const Link = styled.a`
  color: #2563eb;
  &:hover {
    text-decoration: underline;
  }
`;
