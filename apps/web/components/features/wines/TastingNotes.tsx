interface TastingNotesProps {
  description: string | null
}

export function TastingNotes({ description }: TastingNotesProps) {
  if (!description) {
    return null
  }

  return (
    <section aria-labelledby="tasting-notes-heading">
      <h2
        id="tasting-notes-heading"
        className="text-lg font-semibold text-foreground mb-3"
      >
        Tasting Description
      </h2>
      <p className="text-base leading-relaxed text-muted-foreground italic">
        &ldquo;{description}&rdquo;
      </p>
    </section>
  )
}
