import type { CSSProperties, ReactNode } from "react";

export interface CommonProps {
  id?: string;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}
