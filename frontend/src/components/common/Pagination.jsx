import Button from "./Button"

const Pagination = ({ pagination, onPageChange, className = "" }) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null
  }

  const { currentPage, totalPages, hasNext, hasPrev } = pagination

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={`flex justify-center items-center space-x-2 ${className}`}>
      {/* Previous Button */}
      <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => onPageChange(currentPage - 1)}>
        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </Button>

      {/* Page Numbers */}
      <div className="flex space-x-1">
        {/* First page if not visible */}
        {pageNumbers[0] > 1 && (
          <>
            <Button variant="outline" size="sm" onClick={() => onPageChange(1)}>
              1
            </Button>
            {pageNumbers[0] > 2 && <span className="px-2 py-1 text-gray-500">...</span>}
          </>
        )}

        {/* Visible page numbers */}
        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "primary" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}

        {/* Last page if not visible */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="px-2 py-1 text-gray-500">...</span>
            )}
            <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}
      </div>

      {/* Next Button */}
      <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => onPageChange(currentPage + 1)}>
        Next
        <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  )
}

export default Pagination
