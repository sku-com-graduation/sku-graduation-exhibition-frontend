import styled from "styled-components";

const FooterContainer = styled.footer`
  width: 100%;
  padding: 16px;
  background-color: #f8f9fa;
  text-align: center;
  font-size: 14px;
  color: #6c757d;
  border-top: 1px solid #dee2e6;
  box-sizing: border-box;
`;

const Footer = () => {
  return (
    <FooterContainer>
      &copy; {new Date().getFullYear()} Sungkyul University Computer Engineering. All rights reserved.
    </FooterContainer>
  );
};

export default Footer;
