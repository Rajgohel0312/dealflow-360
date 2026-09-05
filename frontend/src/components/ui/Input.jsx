export default function Input({
    label,
    error,
    className = "",
    ...props
}) {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="
                    block
                    text-sm
                    font-medium
                    text-text-primary
                ">
                    {label}
                </label>
            )}

            <input
                {...props}
                className={`
                    w-full
                    rounded-lg
                    border
                    bg-surface
                    px-4
                    py-2.5
                    text-sm
                    text-text-primary
                    outline-none
                    transition
                    placeholder:text-text-muted

                    ${
                        error
                            ? `
                                border-danger-500
                                focus:ring-2
                                focus:ring-danger-100
                            `
                            : `
                                border-border
                                focus:border-primary-600
                                focus:ring-2
                                focus:ring-primary-100
                            `
                    }
                    ${className}
                `}
            />

            {error && (
                <p className="text-xs text-danger-600">
                    {error}
                </p>
            )}

        </div>
    );
}