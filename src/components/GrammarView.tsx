"use client";

import AudioButton from "./AudioButton";
import type { GrammarPoint, LanguageConfig } from "@/lib/types";

/**
 * One grammar point: explanation, tables, the trap, then examples you can hear.
 *
 * Rows carrying a `note` are the ones that catch people out, so they get a
 * highlighted band rather than being buried in an otherwise uniform table.
 */
export default function GrammarView({
  language,
  point,
}: {
  language: LanguageConfig;
  point: GrammarPoint;
}) {
  const { ui, locale } = language;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {point.explanation.map((paragraph, index) => (
          <p key={index} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {point.tables?.map((table, tableIndex) => (
        <div key={tableIndex} className="space-y-2">
          {table.caption && (
            <p className="text-sm font-semibold">{table.caption}</p>
          )}
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-sunk">
                  {table.headers.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-4 py-2.5 text-left font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`border-t border-line ${row.note ? "bg-warn-soft" : ""}`}
                  >
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`px-4 py-2.5 align-top ${
                          cellIndex === 0 ? "target font-medium" : ""
                        }`}
                      >
                        {cell}
                        {row.note && cellIndex === row.cells.length - 1 && (
                          <span className="mt-1 block text-xs text-warn">{row.note}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {point.trap && (
        <div className="rounded-xl bg-bad-soft px-5 py-4">
          <p className="text-sm font-semibold text-bad">Common trap</p>
          <p className="mt-1 text-sm leading-relaxed text-bad">{point.trap}</p>
        </div>
      )}

      {point.examples && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Voorbeelden · Examples
          </h2>
          <div className="space-y-2">
            {point.examples.map((example) => (
              <div
                key={example.target}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="target text-lg">{example.target}</p>
                  <p className="text-sm text-muted">{example.en}</p>
                </div>
                <AudioButton
                  text={example.target}
                  locale={locale}
                  label={ui.listen}
                  slowLabel={ui.slow}
                  size="sm"
                  withSlow
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
