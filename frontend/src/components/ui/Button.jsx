export default function Button({
    children,
    type = "button",
    loading = false,
    disabled = false,
}) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            className="
                w-full
                rounded-lg
                bg-primary-700
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-primary-800
                focus:outline-none
                focus:ring-2
                focus:ring-primary-500
                focus:ring-offset-2
                disabled:cursor-not-allowed
                disabled:opacity-50
            "
        >
            {loading ? "Creating account..." : children}
        </button>
    );
}