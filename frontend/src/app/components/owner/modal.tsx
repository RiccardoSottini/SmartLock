import { 
    Modal, 
    ModalContent, 
    ModalHeader, 
    ModalBody, 
    ModalFooter, 
    Input, 
    Button 
} from "@nextui-org/react";

export type OwnerModalProps = {
    isOpen: boolean;
    onOpenChange: () => void;
};

export default function OwnerModal ({isOpen, onOpenChange} : OwnerModalProps) {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">New Authorisation</ModalHeader>
                        <ModalBody>
                            <Input
                                autoFocus
                                endContent={
                                    ""
                                }
                                label="Name"
                                placeholder="Enter the name"
                                variant="bordered"
                            />
                            <Input
                                autoFocus
                                endContent={
                                    ""
                                }
                                label="Address"
                                placeholder="Enter the address"
                                variant="bordered"
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="flat" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={onClose}>
                                Confirm
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}