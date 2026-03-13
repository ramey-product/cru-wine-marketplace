interface ProducerStoryProps {
  storyContent: string | null
}

export function ProducerStory({ storyContent }: ProducerStoryProps) {
  if (!storyContent) {
    return null
  }

  // For V1, render as plain text with proper typography.
  // TODO: Add markdown rendering when a markdown library is integrated.
  const paragraphs = storyContent.split(/\n\n+/).filter(Boolean)

  return (
    <section aria-labelledby="producer-story-heading">
      <h2
        id="producer-story-heading"
        className="font-display text-2xl font-bold text-foreground mb-4"
      >
        The Story
      </h2>
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="text-base leading-relaxed text-foreground/80"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}
