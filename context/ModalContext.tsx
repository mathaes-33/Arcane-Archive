import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { Book } from '@/types';

type ModalType = 'bookDetail' | 'archive' | 'readingView';

interface ModalPayload {
  bookDetail: { book: Book };
  archive: {};
  readingView: { book: Book };
}

// This generic type mapping ensures that calling openModal with a certain 'type'
// requires the corresponding 'props' payload, enhancing type safety.
type ModalProps<T extends ModalType> = T extends keyof ModalPayload ? ModalPayload[T] : {};

// Create a discriminated union of all possible modal configurations.
type ModalConfig = {
    [K in ModalType]: { type: K; props: ModalPayload[K] };
}[ModalType];

// The full state can be a specific modal config or the 'closed' state.
type ModalState = ModalConfig | { type: null };

interface ModalContextType {
  modal: ModalState;
  openModal: <T extends ModalType>(type: T, props?: ModalProps<T>) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modal, setModal] = useState<ModalState>({ type: null });

  const openModal = useCallback(<T extends ModalType>(type: T, props: ModalProps<T> = {} as ModalProps<T>) => {
    // The cast is safe because the generic relationship between T and ModalProps<T> is enforced.
    setModal({ type, props } as ModalConfig);
  }, []);
  
  const closeModal = useCallback(() => {
    setModal({ type: null });
  }, []);

  const value: ModalContextType = { modal, openModal, closeModal };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};