const Loading = ({ size = "md", text = "Loading..." }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizes[size]} mb-4 inline-block animate-spin rounded-full border-2 border-current border-r-transparent`} />
      <p className="text-gray-600">{text}</p>
    </div>
  )
}

export default Loading
