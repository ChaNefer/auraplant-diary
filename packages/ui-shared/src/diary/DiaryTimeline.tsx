import classNames from "classnames";
import dayjs from "dayjs";
import Timeline from "../timeline/index.js";
import { defaultDictionary } from "./defaultDictionary.js";
import { resolveEventCopy } from "./formatSummary.js";
import type { DiaryEvent, DiaryTimelineProps } from "./types.js";

function groupByDay(events: DiaryEvent[]) {
  const groups = new Map<string, DiaryEvent[]>();
  const sorted = [...events].sort(
    (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime(),
  );
  for (const event of sorted) {
    const key = dayjs(event.ts).format("YYYY-MM-DD");
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }
  return [...groups.entries()];
}

function DefaultMedia({
  alert,
  mediaClassName,
}: {
  alert: boolean;
  mediaClassName: string;
}) {
  return (
    <div
      className={classNames(
        "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white",
        alert ? "bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-900" : mediaClassName,
      )}
      title={alert ? "alert" : undefined}
    >
      {alert ? "!" : ""}
    </div>
  );
}

export function DiaryTimeline({
  events,
  dictionary = defaultDictionary,
  className,
  renderMedia,
  renderBody,
}: DiaryTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {dictionary.emptyLabel ?? "No events yet"}
      </p>
    );
  }

  const groups = groupByDay(events);

  return (
    <div className={classNames("diary-timeline space-y-8", className)}>
      {groups.map(([day, dayEvents]) => (
        <section key={day}>
          <h3 className="mb-4 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            {dayjs(day).format("dddd, DD MMMM YYYY")}
          </h3>
          <Timeline>
            {dayEvents.map((event) => {
              const { label, summary, mediaClassName } = resolveEventCopy(
                event,
                dictionary,
              );
              const alert = event.flags.includes("alert");
              return (
                <Timeline.Item
                  key={event.id}
                  media={
                    renderMedia?.(event) ?? (
                      <DefaultMedia
                        alert={alert}
                        mediaClassName={mediaClassName}
                      />
                    )
                  }
                >
                  {renderBody ? (
                    renderBody(event, label, summary)
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {label}
                        </span>
                        {alert && (
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-rose-700 uppercase dark:bg-rose-950 dark:text-rose-300">
                            {dictionary.alertLabel ?? "Alert"}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {dayjs(event.ts).format("HH:mm")}
                        </span>
                      </div>
                      {summary && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {summary}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {event.source} · workspace {event.workspace_id.slice(0, 8)}…
                      </p>
                    </div>
                  )}
                </Timeline.Item>
              );
            })}
          </Timeline>
        </section>
      ))}
    </div>
  );
}

export default DiaryTimeline;
