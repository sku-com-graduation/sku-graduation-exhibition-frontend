import { useCallback, useState } from "react";
import Modal from "@components/Modal";

type UseModalResult = {
  Modal: React.FC<{ children: React.ReactNode }>;
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useModal = (): UseModalResult => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const ModalComponent: React.FC<{ children: React.ReactNode }> = isOpen
    ? ({ children }) => <Modal onClose={closeModal}>{children}</Modal>
    : () => null;

  return {
    Modal: ModalComponent,
    isOpen,
    openModal,
    closeModal,
  };
};
