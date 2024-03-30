export type OwnerResetProps = {
    reset: () => void;
};

export default function OwnerReset ({reset} : OwnerResetProps) {
    return (
        <p className="text-center mt-4" style={{fontSize: "18px"}}>
            <button type="button" className="btn btn-light border px-3 py-2" onClick={reset}>Reset Contract</button>
        </p>
    );
}