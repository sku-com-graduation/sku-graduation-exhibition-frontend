import styled, { keyframes } from "styled-components";
import React, { useRef } from "react";
// import { CloseIcon } from "./Icons";

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-1rem);  
    background-color: rgba(81, 81, 81, 0);
  }
  100% {
    opacity: 1;
    transform: translateY(0);  
    background-color: rgba(81, 81, 81, 0.5);
  }
`;

const Container = styled.div`
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(81, 81, 81, 0.3);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(0.1rem);
`;

const ModalContainer = styled.div`
  width: auto;
  background-color: #fff;
  border-radius: 1rem;
  position: relative;
  animation: ${fadeIn} 0.3s ease-in-out;
`;

// const CloseButton = styled.button`
//   position: absolute;
//   top: 0.5rem;
//   right: 0.5rem;
//   cursor: pointer;
//   background: none;
//   border: none;
// `;

type ModalProps = {
  onClose: () => void;
  children: React.ReactNode;
};

const Modal = ({ onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <Container onClick={handleContainerClick}>
      <ModalContainer ref={modalRef}>
        {/* <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton> */}
        {children}
      </ModalContainer>
    </Container>
  );
};

export default Modal;
