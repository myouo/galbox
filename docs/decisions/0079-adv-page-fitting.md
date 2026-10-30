# ADR 0079: fit the complete ADV page inside its window

The default DOM renderer must not scroll an ADV dialogue window. Keep the
authored font size whenever the complete page fits. On overflow, reduce a shared
typographic factor with a bounded twelve-step measurement search; preserve the
relative sizes of ruby, speaker and authored rich spans. Measure inline font
boxes as well as scroll extents, reserving missing leading above the first line;
layout offsets keep this independent of stage camera transforms. Hanging wrap
whitespace has no painted glyph box, so it participates in line layout but is
excluded from ink bounds unless it is underlined. Wrap otherwise
unbreakable text. Reset fitting for each page, theme, display preference, font
load and mount size. Reveal ticks reuse the fit, including unrevealed text, so
typing does not repeatedly shrink or scroll the page.

This is a Web presentation correction, not story pagination. It does not advance
the PC, insert confirmation points, truncate content, mutate snapshots, or change
Program/release/save signatures. Explicitly accumulated NVL windows retain their
existing scroll behavior. Custom renderers remain responsible for their layout.
Authored rectangles must still provide usable space; automatic fitting cannot
make an arbitrarily small window legible. No minimum readable-font certification,
native line-breaking or pixel fidelity is implied.

Verify long CJK/Latin/ruby pages, oversized preferences, partial reveal, resize,
next-page size reset, illustrated saves/restores, and NVL behavior in a browser.
The independent consumer must use a rebuilt real package and test actual content
with its declared fonts without changing the frozen story payload.
