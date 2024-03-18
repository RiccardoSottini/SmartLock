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
    createAuthorisation: (guest: string) => void;
};

export default function OwnerModal ({checkAddress, rows, isOpen, onOpenChange, createAuthorisation} : OwnerModalProps) {
    const [name, setName] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [error, setError] = useState<string>("");

    const onPress = (onClose) => {
        createAuthorisation(address);
        onClose();
    }

    useEffect(() => {
        console.log(address);
        console.log(rows);
        console.log(rows.find((authorisation : any) => authorisation.guest == address));

        if(rows.find((authorisation : any) => authorisation.guest.toLowerCase() == address.toLowerCase())) {
            setError("There is already an authorisation request for this address");
        } else if(!checkAddress(address)) {
            setError("Enter a valid blockchain address");
        } else {
            setError("");
        }
    }, [address, rows]);

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
                                value={name}
                                onValueChange={setName}
                            />
                            <Input
                                autoFocus
                                endContent={
                                    ""
                                }
                                label="Address"
                                placeholder="Enter the address"
                                variant="bordered"
                                value={address}
                                onValueChange={setAddress}      
                                isInvalid={error != ""}
                                errorMessage={error}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="flat" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={(e) => {onPress(onClose)}}>
                                Confirm
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}