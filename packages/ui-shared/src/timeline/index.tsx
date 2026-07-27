import type { ForwardRefExoticComponent, RefAttributes } from "react";
import _Timeline, { type TimelineProps } from "./Timeline.js";
import TimeLineItem from "./TimeLineItem.js";

export type { TimelineProps } from "./Timeline.js";
export type { TimeLineItemProps } from "./TimeLineItem.js";

type CompoundedComponent = ForwardRefExoticComponent<
  TimelineProps & RefAttributes<HTMLUListElement>
> & {
  Item: typeof TimeLineItem;
};

const Timeline = _Timeline as CompoundedComponent;
Timeline.Item = TimeLineItem;

export { Timeline };
export default Timeline;
