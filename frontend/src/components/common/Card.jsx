const Card = ({ children, className = "" }) => {
  return <div className={`rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm ${className}`}>{children}</div>
}

const CardHeader = ({ children, className = "" }) => {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
}

const CardTitle = ({ children, className = "" }) => {
  return <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
}

const CardDescription = ({ children, className = "" }) => {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
}

const CardContent = ({ children, className = "" }) => {
  return <div className={`p-6 ${className}`}>{children}</div>
}

const CardFooter = ({ children, className = "" }) => {
  return <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Content = CardContent
Card.Footer = CardFooter

export default Card
