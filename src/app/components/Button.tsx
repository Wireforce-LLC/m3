interface Props {
    readonly onClick?: () => void,
    readonly children?: React.ReactNode
}

export default function Button({children, onClick}: Props) {
    return <button className="w-full bg-gray-100 rounded transition-colors hover:bg-gray-100 px-2 py-1.5 text-xs cursor-pointer flex flex-row gap-2 items-center justify-center">{children}</button>
}