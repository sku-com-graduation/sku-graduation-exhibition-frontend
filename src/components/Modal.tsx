import styled from "styled-components";
import React, { useRef } from "react";

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
`;

const ModalContainer = styled.div`
  width: auto;
  background-color: #fff;
  border-radius: 1rem;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;

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
        <CloseButton onClick={onClose}>X</CloseButton>
        {children}
      </ModalContainer>
    </Container>
  );
};

export default Modal;

// import styled from "styled-components";

// const Container = styled.div`
//   width: 100%;
//   height: 100%;
//   position: absolute;
//   top: 0;
//   left: 0;
//   background-color: rgba(81, 81, 81, 0.3);
//   z-index: 1000;
// `;

// const ModalContainer = styled.div`
//   width: 20rem;
//   background-color: #fff;
//   position: absolute;
//   top: 50%;
//   left: 50%;
//   transform: translate(-50%, -50%);
//   border-radius: 0.625rem;
// `;

// const CloseButton = styled.button`
//   position: absolute;
//   top: 10px;
//   right: 10px;
//   cursor: pointer;
// `;

// type ModalProps = {
//   onClose: () => void;
//   children: React.ReactNode;
// };

// const Modal = ({ onClose, children }: ModalProps) => {
//   return (
//     <Container>
//       <ModalContainer>
//         <CloseButton onClick={onClose}>X</CloseButton>
//         {children}
//       </ModalContainer>
//     </Container>
//   );
// };

// export default Modal;
