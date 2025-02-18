import styled from "styled-components";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(81, 81, 81, 0.3);
`;

const ModalContainer = styled.div`
  width: 20rem;
  background-color: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 0.625rem;
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
  return (
    <Container>
      <ModalContainer>
        <CloseButton onClick={onClose}>X</CloseButton>
        {children}
      </ModalContainer>
    </Container>
  );
};

export default Modal;
