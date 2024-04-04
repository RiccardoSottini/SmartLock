/* Props of the OwnerReset component */
export type OwnerResetProps = {
  reset: () => void;
};

/* OwnerReset React component - component used to display the reset button */
export default function OwnerReset({ reset }: OwnerResetProps) {
  /* Return component JSX markup (reset button) */
  return (
    <p className="text-center mt-4" style={{ fontSize: "18px" }}>
      <button
        type="button"
        className="btn btn-light border px-3 py-2"
        onClick={reset}
      >
        Reset Contract
      </button>
    </p>
  );
}
