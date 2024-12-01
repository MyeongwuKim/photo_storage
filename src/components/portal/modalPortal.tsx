"use client";
import { createPortal } from "react-dom";
import { useState, useEffect, ReactNode } from "react";
import { registModalsState } from "@/hooks/useEvent";

export default function ModalPortal() {
  const [modalArr, setModalArr] = useState<ReactNode[]>([]);
  const [portalElement, setPortalElement] = useState<Element | null>(null);

  registModalsState(setModalArr);

  useEffect(() => {
    setPortalElement(document.getElementById("modal"));
  }, []);

  return (
    <>
      {portalElement
        ? createPortal(
            <div id="modalWrapper">
              {modalArr.map((v, i) => (
                <div key={i} id={`modalIndex_${i}`}>
                  {v}
                </div>
              ))}
            </div>,
            portalElement
          )
        : null}
    </>
  );
}
