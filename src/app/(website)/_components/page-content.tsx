const PageContent = ({ content, className }: { content: string, className?: string }) => {
    return (
        <div className={className} dangerouslySetInnerHTML={{ __html: content }}></div>
    )
}
export default PageContent;