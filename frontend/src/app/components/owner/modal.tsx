import { useState, useEffect } from "react";
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
    checkAddress: any;
    rows: any;
    isOpen: boolean;
    onOpenChange: () => void;
    createAuthorisation: (guest: string, address: string) => void;
};

export default function OwnerModal ({checkAddress, rows, isOpen, onOpenChange, createAuthorisation} : OwnerModalProps) {
    const [name, setName] = useState<string | undefined>();
    const [address, setAddress] = useState<string | undefined>();
    const [errorName, setErrorName] = useState<string>("");
    const [errorAddress, setErrorAddress] = useState<string>("");

    const onPress = (onClose : any) => {
        if(name && address) {
            createAuthorisation(name, address);
        }

        onClose();
    }

    useEffect(() => {
        if(name?.trim().length == 0) {
            setErrorName("Enter a valid name");
        } else {
            setErrorName("");
        }

        if(rows.find((authorisation : any) => authorisation.guest.toLowerCase() == address?.toLowerCase())) {
            setErrorAddress("There is already an authorisation request for this address");
        } else if((!checkAddress(address) && address != undefined) || address?.trim().length == 0) {
            setErrorAddress("Enter a valid blockchain address");
        } else {
            setErrorAddress("");
        }
    }, [name, address, rows]);

    const closeModal = () => {
        setName(undefined);
        setAddress(undefined);
        setErrorName("");
        setErrorAddress("");

        onOpenChange();
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={closeModal} placement="top-center">
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
                                value={name}
                                onValueChange={setName}  
                                isInvalid={errorName != ""}
                                errorMessage={errorName}
                            />
                            <Input
                                endContent={
                                    ""
                                }
                                label="Address"
                                placeholder="Enter the address"
                                variant="bordered"
                                value={address}
                                onValueChange={setAddress}      
                                isInvalid={errorAddress != ""}
                                errorMessage={errorAddress}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="flat" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color="primary" disabled={errorName != "" || errorAddress != "" || name == undefined || address == undefined} onPress={(e) => {onPress(onClose)}}>
                                Confirm
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}