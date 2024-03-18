import { AccessType } from "../../context/AppProvider";
import Access from "../guest/access";
import { 
    Modal, 
    ModalContent, 
    ModalHeader, 
    ModalBody,
} from "@nextui-org/react";

export type OwnerHistoryProps = {
    accesses: AccessType[];
    isOpenHistory: boolean;
    onCloseHistory: () => void;
};

export default function OwnerHistory ({accesses, isOpenHistory, onCloseHistory} : OwnerHistoryProps) {
    return (
        <Modal isOpen={isOpenHistory} onOpenChange={onCloseHistory} scrollBehavior="inside" placement="top-center">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">History of accesses to the door</ModalHeader>
                        <ModalBody>
                            {accesses.length ? (
                                <div className="row row-cols-2">
                                    {accesses.map((access : any, index : number) => (
                                        <Access key={index} timestamp={access.timestamp.toString()}/>
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