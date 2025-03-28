// AdminPage.tsx
import { useState } from "react";
import styled from "styled-components";
import StudentGrid from "../components/table/StudentGrid";
import AccountGrid from "@components/table/AccountGrid";
import TeamGrid from "@components/table/TeamGrid";
import ProfessorGrid from "@components/table/ProfessorGrid";

const adminMenus: {
  id: "student" | "team" | "account" | "professor";
  title: string;
}[] = [
  { id: "student", title: "학생 관리" },
  { id: "team", title: "팀 관리" },
  { id: "account", title: "계정 관리" },
  { id: "professor", title: "교수 관리" },
];

const Container = styled.div`
  width: 100%;
  height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  background-color: #eff5ff;
`;

const MenuContainer = styled.div`
  margin-top: 5rem;
  display: grid;
  width: 50%;
  grid-template-columns: repeat(4, 1fr);
  text-align: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MenuItem = styled.div<{ $isSelected: boolean }>`
  display: grid;
  padding: 10px;
  background-color: ${(props) => (props.$isSelected ? "#ffffff" : "#F3F3F3")};
  border-radius: 1rem 1rem 0 0;
  place-items: center;

  transition: background-color 0.25s;

  &:hover {
    background-color: ${(props) => (props.$isSelected ? "#ffffff" : "#dfdfdf")};
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 12px;
  }
`;

const WorkContainer = styled.div`
  width: 100%;
  height: 95%;
  background-color: #ffffff;
  padding: 1rem;
  box-sizing: border-box;
`;

const AdminPage = () => {
  const [selectedMenu, setSelectedMenu] = useState<"student" | "team" | "account" | "professor">(adminMenus[0].id);

  return (
    <Container>
      <MenuContainer>
        {adminMenus.map((menu) => {
          const isSelected = selectedMenu === menu.id;
          return (
            <MenuItem key={menu.id} onClick={() => setSelectedMenu(menu.id)} $isSelected={isSelected}>
              {menu.title}
            </MenuItem>
          );
        })}
      </MenuContainer>
      <WorkContainer>
        {selectedMenu === "student" && <StudentGrid />}
        {selectedMenu === "account" && <AccountGrid />}
        {selectedMenu === "team" && <TeamGrid />}
        {selectedMenu === "professor" && <ProfessorGrid />}
      </WorkContainer>
    </Container>
  );
};

export default AdminPage;
