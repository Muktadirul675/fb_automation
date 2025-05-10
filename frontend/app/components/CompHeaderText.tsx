export default function CompHeaderText({ children }: { children: React.ReactNode }) {
    return <>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {children}
        </h2>
    </>
}