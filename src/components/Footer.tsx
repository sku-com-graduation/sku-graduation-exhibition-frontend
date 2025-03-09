import styled from "styled-components";
import { HomeIcon } from "./Icons"; // 아이콘 import

const FooterContainer = styled.footer`
  width: 100%;
  padding: 16px;
  background-color: #f8f9fa;
  font-size: 14px;
  color: #6c757d;
  border-top: 1px solid #dee2e6;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
`;

const FooterText = styled.p`
  margin: 0;
  color: #adb5bd;
  text-align: left;
  display: flex;
  align-items: center;

  &:hover {
    color: #4d8ecf;
  }
`;

const IconLink = styled.a`
  color: #adb5bd;
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterText style={{ justifySelf: "start" }}>
        &copy; {new Date().getFullYear()} Sungkyul University Computer Engineering. All rights reserved.
      </FooterText>
      <FooterText style={{ justifySelf: "end" }}>
        <IconLink href="https://www.sungkyul.ac.kr/computer/index.do" target="_blank" rel="noopener noreferrer">
          <HomeIcon />
        </IconLink>
        Sungkyul University Department of Computer Engineering
      </FooterText>
    </FooterContainer>
  );
};

export default Footer;
