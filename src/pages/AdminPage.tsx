import { useState } from "react";
import styled from "styled-components";
import { AccountGrid, HomeGrid, ProfessorGrid, StudentGrid, TeamGrid } from "@components/grid";
import { ADMIN_MENUS } from "@constant/menuColumns";
import { TAdminMenu } from "@interface";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  background-color: rgb(236, 238, 252);
`;

const MenuContainer = styled.div`
  margin-top: 5rem;
  display: grid;
  width: 50%;
  grid-template-columns: repeat(5, 1fr);
  text-align: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MenuItem = styled.div<{ $isSelected: boolean }>`
  display: grid;
  padding: 1rem;
  background-color: ${(props) => (props.$isSelected ? "#ffffff" : "#e2e2e2")};
  border-radius: 1rem 1rem 0 0;
  place-items: center;

  transition: background-color 0.25s;

  &:hover {
    background-color: ${(props) => (props.$isSelected ? "#ffffff" : "#acacac")};
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.5rem;
  }
`;

const WorkContainer = styled.div`
  flex: 1;
  overflow: hidden;
  background-color: #ffffff;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const AdminPage = () => {
  const [selectedMenu, setSelectedMenu] = useState<TAdminMenu>(ADMIN_MENUS[0].id);

  return (
    <Container>
      <MenuContainer>
        {ADMIN_MENUS.map((menu) => {
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
        {selectedMenu === "home" && <HomeGrid />}
      </WorkContainer>
    </Container>
  );
};

export default AdminPage;
