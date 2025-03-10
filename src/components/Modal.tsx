import ReactDOM from "react-dom";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-1rem);  
  }
  100% {
    opacity: 1;
    transform: translateY(0);  
  }
`;

const ModalOverlay = styled.div`
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(81, 81, 81, 0.3);
  z-index: 1100; /* Header보다 높은 값 */
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(0.1rem);
`;

const ModalContent = styled.div`
  width: auto;
  background-color: #fff;
  border-radius: 1rem;
  position: relative;
  animation: ${fadeIn} 0.3s ease-in-out;
`;

type ModalProps = {
  onClose: () => void;
  children: React.ReactNode;
};

const Modal = ({ onClose, children }: ModalProps) => {
  return ReactDOM.createPortal(
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>{children}</ModalContent>
    </ModalOverlay>,
    document.body
  );
};

export default Modal;
