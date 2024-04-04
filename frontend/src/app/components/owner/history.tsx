import { AccessType } from "../../context/AppProvider";
import Access from "../guest/access";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";

/* Props of the OwnerHistory component */
export type OwnerHistoryProps = {
  accesses: AccessType[];
  isOpenHistory: boolean;
  onCloseHistory: () => void;
};

/* OwnerHistory React component - component used to display the modal to display the history of door accesses */
export default function OwnerHistory({
  accesses,
  isOpenHistory,
  onCloseHistory,
}: OwnerHistoryProps) {
  /* Return the modal JSX markup (history of door accesses modal) */
  return (
    <Modal
      isOpen={isOpenHistory}
      onOpenChange={onCloseHistory}
      scrollBehavior="inside"
      placement="top-center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              History of accesses to the door
            </ModalHeader>
            <ModalBody>
              {accesses.length ? (
                <div className="row row-cols-2">
                  {accesses.map((access: any, index: number) => (
                    <Access
                      key={index}
                      timestamp={access.timestamp.toString()}
                    />
                  ))}
                </div>
              ) : (
                <p>The guest has never accessed the door before.</p>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
