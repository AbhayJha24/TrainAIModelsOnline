'use client';

import ShowInfoModal from "../types/ShowInfoModalTypes";

type InfoModalProps = {
    styles: { readonly [key: string]: string; },
    showInfoModal: ShowInfoModal
}

export default function Modal({styles, showInfoModal}: InfoModalProps) {

  return (
    <section className={showInfoModal.visibility ? (showInfoModal.type === 'info'? styles.InfoModalTrueYellow : (showInfoModal.type === 'success'? styles.InfoModalTrueGreen: (showInfoModal.type === 'error' ? styles.InfoModalTrueRed : styles.InfoModalTrue))) : styles.InfoModalFalse} onClick={e=> e.stopPropagation()}>
      <h4 className={styles.infoModalText}>{showInfoModal.message}</h4>
      <p className={styles.infoModalText}>{showInfoModal.description}</p>
    </section>
  );
}

