export default function Card({ children }) {
    return (
        <div className="
            rounded-2xl
            border
            border-border
            bg-surface
            p-8
            shadow-sm
        ">
            {children}
        </div>
    );
}