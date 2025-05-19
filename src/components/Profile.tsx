import { useState } from "react";
import styled from "styled-components";
import { ITeamPostEditStudent } from "@interface";
import userEmpty from "@assets/image/user.png";
import { useSelector } from "react-redux";
import { RootState } from "@store/store";
import { Input, IconButton, ButtonGroup } from "@components/Input";
import { FiEdit2, FiSave, FiX, FiMail, FiGithub, FiGlobe, FiTrash } from "react-icons/fi";

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
  border: 1px solid #e5e7eb;
`;

const ImageLabel = styled.label`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: #2563eb;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  &:hover {
    background-color: #1d4ed8;
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  &:hover {
    text-decoration: underline;
  }
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

const StyledInput = styled(Input)`
  padding: 0.6rem;
  font-size: 0.95rem;
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

interface ProfileProps {
  selectedStudent: ITeamPostEditStudent;
  teamUuid?: string;
  onSave: (updatedStudent: ITeamPostEditStudent) => void;
}

const Profile = ({ selectedStudent, teamUuid, onSave }: ProfileProps) => {
  const auth = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState<ITeamPostEditStudent>(selectedStudent);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditedStudent({
        ...editedStudent,
        profileImage: imageUrl,
      });
    }
    event.target.value = "";
  };

  const handleDeleteImage = () => {
    setEditedStudent({
      ...editedStudent,
      profileImage: "",
    });
  };

  const handleSaveClick = () => {
    onSave(editedStudent);
    setIsEditing(false);
  };

  return (
    <ProfileCard>
      <ImageSection>
        <ProfileImage src={editedStudent.profileImage || userEmpty} />
        {isEditing && (
          <>
            <ImageLabel htmlFor="profile-image">이미지 변경</ImageLabel>
            <input id="profile-image" type="file" accept=".jpg,.png" onChange={handleImageChange} hidden />
            {editedStudent.profileImage && (
              <DeleteButton type="button" onClick={handleDeleteImage}>
                <FiTrash /> 삭제
              </DeleteButton>
            )}
          </>
        )}
      </ImageSection>

      <InfoSection>
        <HeaderContainer>
          <Name>{editedStudent.name}</Name>
          <RoleBadge>{editedStudent.role}</RoleBadge>
          {(auth.uuid === teamUuid || auth.role === "ADMIN") && (
            <ButtonGroup>
              {isEditing ? (
                <>
                  <IconButton variant="save" onClick={handleSaveClick}>
                    <FiSave />
                  </IconButton>
                  <IconButton variant="cancel" onClick={() => setIsEditing(false)}>
                    <FiX />
                  </IconButton>
                </>
              ) : (
                <IconButton variant="edit" onClick={() => setIsEditing(true)}>
                  <FiEdit2 />
                </IconButton>
              )}
            </ButtonGroup>
          )}
        </HeaderContainer>

        <ContentContainer>
          {isEditing ? (
            <>
              <StyledInput
                placeholder="Team Role"
                value={editedStudent.info || ""}
                onChange={(e) => setEditedStudent({ ...editedStudent, info: e.target.value })}
              />
              <StyledInput
                placeholder="Blog URL"
                value={editedStudent.studentBlog || ""}
                onChange={(e) => setEditedStudent({ ...editedStudent, studentBlog: e.target.value })}
              />
              <StyledInput
                placeholder="Email"
                value={editedStudent.studentEmail || ""}
                onChange={(e) => setEditedStudent({ ...editedStudent, studentEmail: e.target.value })}
              />
              <StyledInput
                placeholder="Github URL"
                value={editedStudent.githubUrl || ""}
                onChange={(e) => setEditedStudent({ ...editedStudent, githubUrl: e.target.value })}
              />
            </>
          ) : (
            <>
              {editedStudent.info && <DetailText>{editedStudent.info}</DetailText>}
              {editedStudent.studentBlog && (
                <IconText>
                  <FiGlobe />
                  <Link href={editedStudent.studentBlog} target="_blank" rel="noopener noreferrer">
                    {editedStudent.studentBlog}
                  </Link>
                </IconText>
              )}
              {editedStudent.studentEmail && (
                <IconText>
                  <FiMail />
                  <Link href={`mailto:${editedStudent.studentEmail}`}>{editedStudent.studentEmail}</Link>
                </IconText>
              )}
              {editedStudent.githubUrl && (
                <IconText>
                  <FiGithub />
                  <Link href={editedStudent.githubUrl} target="_blank" rel="noopener noreferrer">
                    {editedStudent.githubUrl}
                  </Link>
                </IconText>
              )}
            </>
          )}
        </ContentContainer>
      </InfoSection>
    </ProfileCard>
  );
};

export default Profile;

// import { useState } from "react";
// import styled from "styled-components";
// import { ITeamPostEditStudent } from "@interface";
// import userEmpty from "@assets/image/user.png";
// import { useSelector } from "react-redux";
// import { RootState } from "@store/store";
// import { Input, IconButton, ButtonGroup } from "@components/Input";
// import { FiEdit2, FiSave, FiX, FiMail, FiGithub, FiGlobe } from "react-icons/fi";

// interface ProfileProps {
//   selectedStudent: ITeamPostEditStudent;
//   teamUuid?: string;
//   onSave: (updatedStudent: ITeamPostEditStudent) => void;
// }

// const Profile = ({ selectedStudent, teamUuid, onSave }: ProfileProps) => {
//   const auth = useSelector((state: RootState) => state.auth);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedStudent, setEditedStudent] = useState<ITeamPostEditStudent>(selectedStudent);

//   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setEditedStudent({
//         ...editedStudent,
//         profileImage: imageUrl,
//       });
//     }
//   };

//   const handleSaveClick = () => {
//     onSave(editedStudent);
//     setIsEditing(false);
//   };

//   return (
//     <ProfileCard>
//       <ImageSection>
//         <ProfileImage src={editedStudent.profileImage || userEmpty} />

//         {isEditing && <ImageLabel htmlFor="profile-image">이미지 변경</ImageLabel>}
//         <input id="profile-image" type="file" accept=".jpg,.png" onChange={handleImageChange} hidden />
//       </ImageSection>

//       <InfoSection>
//         <HeaderContainer>
//           {<Name>{editedStudent.name}</Name>}
//           <RoleBadge>{editedStudent.role}</RoleBadge>
//           {(auth.uuid === teamUuid || auth.role === "ADMIN") && (
//             <ButtonGroup>
//               {isEditing ? (
//                 <>
//                   <IconButton variant="save" onClick={handleSaveClick}>
//                     <FiSave />
//                   </IconButton>
//                   <IconButton variant="cancel" onClick={() => setIsEditing(false)}>
//                     <FiX />
//                   </IconButton>
//                 </>
//               ) : (
//                 <IconButton variant="edit" onClick={() => setIsEditing(true)}>
//                   <FiEdit2 />
//                 </IconButton>
//               )}
//             </ButtonGroup>
//           )}
//         </HeaderContainer>

//         <ContentContainer>
//           {isEditing ? (
//             <>
//               <StyledInput
//                 placeholder="Team Role"
//                 value={editedStudent.info || ""}
//                 onChange={(e) => setEditedStudent({ ...editedStudent, info: e.target.value })}
//               />
//               <StyledInput
//                 placeholder="Blog URL"
//                 value={editedStudent.studentBlog || ""}
//                 onChange={(e) => setEditedStudent({ ...editedStudent, studentBlog: e.target.value })}
//               />
//               <StyledInput
//                 placeholder="Email"
//                 value={editedStudent.studentEmail || ""}
//                 onChange={(e) => setEditedStudent({ ...editedStudent, studentEmail: e.target.value })}
//               />
//               <StyledInput
//                 placeholder="Github URL"
//                 value={editedStudent.githubUrl || ""}
//                 onChange={(e) => setEditedStudent({ ...editedStudent, githubUrl: e.target.value })}
//               />
//             </>
//           ) : (
//             <>
//               {editedStudent.info && <DetailText>{editedStudent.info}</DetailText>}
//               {editedStudent.studentBlog && (
//                 <IconText>
//                   <FiGlobe />
//                   <Link href={editedStudent.studentBlog}>{editedStudent.studentBlog}</Link>
//                 </IconText>
//               )}
//               {editedStudent.studentEmail && (
//                 <IconText>
//                   <FiMail />
//                   <Link href={`mailto:${editedStudent.studentEmail}`}>{editedStudent.studentEmail}</Link>
//                 </IconText>
//               )}
//               {editedStudent.githubUrl && (
//                 <IconText>
//                   <FiGithub />
//                   <Link href={editedStudent.githubUrl}>{editedStudent.githubUrl}</Link>
//                 </IconText>
//               )}
//             </>
//           )}
//         </ContentContainer>
//       </InfoSection>
//     </ProfileCard>
//   );
// };

// export default Profile;

// const ProfileCard = styled.div`
//   width: 100%;
//   max-width: 600px;
//   padding: 2rem;
//   border-radius: 1rem;
//   background-color: #ffffff;
//   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
//   display: flex;
//   gap: 1.5rem;
//   font-family: "Pretendard", sans-serif;
// `;

// const ImageSection = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   gap: 0.8rem;
// `;

// const ProfileImage = styled.img`
//   width: 9rem;
//   height: 9rem;
//   border-radius: 50%;
//   object-fit: cover;
//   border: 1px solid #e5e7eb;
//   image-rendering: auto;
// `;

// const ImageLabel = styled.label`
//   padding: 0.5rem 1rem;
//   border-radius: 0.5rem;
//   background-color: #2563eb;
//   color: #fff;
//   cursor: pointer;
//   font-size: 0.9rem;
//   &:hover {
//     background-color: #1d4ed8;
//   }
// `;

// const InfoSection = styled.div`
//   flex: 1;
//   display: flex;
//   flex-direction: column;
//   gap: 1rem;
// `;

// const HeaderContainer = styled.div`
//   display: flex;
//   gap: 0.7rem;
//   align-items: center;
// `;

// const ContentContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 0.5rem;
// `;

// const StyledInput = styled(Input)`
//   padding: 0.6rem;
//   font-size: 0.95rem;
// `;

// const Name = styled.h2`
//   font-size: 1.6rem;
//   color: #111827;
// `;

// const RoleBadge = styled.span`
//   background-color: #f3f4f6;
//   border-radius: 0.5rem;
//   padding: 0.3rem 0.8rem;
//   font-size: 0.85rem;
//   color: #374151;
// `;

// const DetailText = styled.p`
//   color: #4b5563;
//   margin: 0;
// `;

// const IconText = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
//   color: #4b5563;
//   font-size: 0.95rem;
// `;

// const Link = styled.a`
//   color: #2563eb;
//   &:hover {
//     text-decoration: underline;
//   }
// `;
